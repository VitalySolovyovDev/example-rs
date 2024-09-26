import {
  useState,
  useEffect,
  useRef,
  type FocusEvent,
  type MouseEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import * as R from 'remeda';

type FormatOptions = {
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  decimalScale?: number;
  needFormatDecimal?: boolean;
  withoutSpecialSymbols?: boolean;
};

type Handlers = {
  onChange?(value: number | null): void;
  onFocus?(event: FocusEvent<HTMLInputElement>): void;
  onBlur?(event: FocusEvent<HTMLInputElement>): void;
  onMouseUp?(event: MouseEvent<HTMLInputElement>): void;
  onKeyUp?(event: KeyboardEvent<HTMLInputElement>): void;
};

function convertExponentialToNormal(value: number): string {
  const data = value.toString().split(/[eE]/);
  const mantissa = data[0];
  const exponent = data[1];
  if (exponent === undefined) {
    return data[0];
  }

  let zeroes = '';
  const sign = value < 0 ? '-' : '';
  const str = mantissa.replace('.', '');
  let zeroesAcc = Number(exponent) + 1;

  if (zeroesAcc < 0) {
    zeroes = `${sign}0.`;
    while (zeroesAcc) {
      zeroesAcc += 1;
      zeroes += '0';
    }
    return zeroes + str.replace(/^-/, '');
  }
  zeroesAcc -= sign ? str.length - 1 : str.length;
  while (zeroesAcc) {
    zeroesAcc -= 1;
    zeroes += '0';
  }
  return str + zeroes;
}

const escapeRegexpSymbols = (str: string) => str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');

function useNumberFormat(
  numberValue: number | null,
  { onChange, onBlur, onFocus, onMouseUp, onKeyUp }: Handlers,
  {
    prefix = '',
    suffix = '',
    min: minProp = -Infinity,
    max: maxProp = Infinity,
    decimalScale,
    needFormatDecimal = false,
    withoutSpecialSymbols = false,
  }: FormatOptions = {},
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [caretPosition, setCaretPosition] = useState([0, 0]);

  const safePrefix = escapeRegexpSymbols(prefix);
  const safeSuffix = escapeRegexpSymbols(suffix);
  const prefixRegExp = RegExp(`^(-)?(${safePrefix})`);
  const suffixRegExp = RegExp(`(${safeSuffix})$`);
  const signRegExp = RegExp(`^-(${safePrefix})`);
  const clearValueRegExp = /^(-)?(\d*)?(\.\d*)?$/;
  const numberRegExp = RegExp(`^(-)?(\\d*)?(\\.\\d{0,${decimalScale ?? ''}})?`);
  const hasOnlyValidSymbols = R.piped(
    removePrefix,
    removeSuffix,
    value => value.replace(/[-\d]/g, ''),
    value => value.replace(/[.]/, ''),
    value => value.length === 0,
  );

  const [min, max] = minProp < maxProp ? [minProp, maxProp] : [maxProp, minProp];
  const disallowNegative = min >= 0;

  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    setFormattedValue(validateAndGetValue(formatNumber(numberValue, needFormatDecimal), true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isFormattingBroken = (value: string) =>
    !/^-?\s*$/.test(formattedValue) && prefixRegExp.test(value) !== suffixRegExp.test(value);

  const areValuesValid = (value: string, clearString: string) => {
    if (disallowNegative && clearString.includes('-')) {
      return false;
    }
    return (
      hasOnlyValidSymbols(value) && !isFormattingBroken(value) && clearValueRegExp.test(clearString)
    );
  };

  useEffect(() => {
    const [start, end] = caretPosition;
    // setSelectionRange on iPhone causes setting focus on input on page open (https://bitsgap.atlassian.net/browse/NF-842)
    // that's why we need to set selection only if input already has focus
    if (focused) {
      inputRef.current?.setSelectionRange(start, end);
    }
  }, [caretPosition]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!focused) {
      updateStateByValue(formatNumber(numberValue, needFormatDecimal), true);
    }
  }, [numberValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshValue = () => updateStateByValue(formatNumber(numberValue, needFormatDecimal), true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refreshValue, [decimalScale, min, max, prefix, suffix]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    const convertCommaToDotValue = value.replace(',', '.');

    const clearValue = getClearValue(convertCommaToDotValue);

    if (areValuesValid(convertCommaToDotValue, clearValue)) {
      updateStateByValue(formatString(clearValue), false);

      const convertedRawValue = convertToNumber(clearValue);
      onChange?.(validateByLimits(convertedRawValue, false) ?? convertedRawValue);
    } else {
      const [start] = caretPosition;
      setCaretPosition([start, start]);
    }
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    updateStateByValue(formatNumber(numberValue, needFormatDecimal), true);
    setFocused(false);
    onBlur?.(event);
  }

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    const { selectionStart, selectionEnd } = event.currentTarget;
    const position = correctCaretPosition(Number(selectionStart), Number(selectionEnd));
    setCaretPosition(position);
    onKeyUp?.(event);
  }

  function handleMouseUp(event: MouseEvent<HTMLInputElement>) {
    const position = correctCaretPosition(
      inputRef.current?.selectionStart ?? 0,
      inputRef.current?.selectionEnd ?? 0,
    );

    setCaretPosition(position);
    onMouseUp?.(event);
  }

  function correctCaretPosition(start: number, end: number) {
    const value = inputRef.current?.value || '';
    const leftBound = prefix.length + (signRegExp.test(value) ? 1 : 0);
    const rightBound = value.length - suffix.length;
    const position =
      leftBound <= rightBound ? R.clamp(start, { min: leftBound, max: rightBound }) : start;

    return start === end ? [position, position] : [start, end];
  }

  function formatNumber(value: number | null, needDecimalPadding = false) {
    return formatString(
      value !== null ? convertExponentialToNormal(value) : '',
      needDecimalPadding,
    );
  }

  function formatString(value: string, needDecimalPadding = false) {
    if (value === '-' || value === '') {
      return value;
    }
    const operatingValue = formattingZero(value);
    const [, sign = '', whole = '', decimal = ''] = operatingValue.match(numberRegExp) ?? [];
    const showDecimalScale = decimalScale === undefined || decimalScale > 0;
    const decimalValue =
      decimalScale && needDecimalPadding
        ? getFormattedDecimalValue(decimalScale, decimal)
        : decimal;
    return `${sign}${prefix}${whole}${showDecimalScale ? decimalValue : ''}${suffix}`;
  }

  function getFormattedDecimalValue(scale: number, decimal: string) {
    if (!decimal) {
      return `.`.padEnd(scale + 1, '0');
    }

    return decimal.padEnd(scale + 1, '0');
  }

  function convertToNumber(value: string): number | null {
    const number = parseFloat(value);
    return Number.isNaN(number) ? null : number;
  }

  function correctSign(value: string) {
    const needNegate = (value.match(/-/g)?.length ?? 0) % 2 !== 0;
    const valueWithoutSign = value.replace(/-/g, '');
    return needNegate ? `-${valueWithoutSign}` : valueWithoutSign;
  }

  function trimDecimals(value: string) {
    return value.match(numberRegExp)?.[0] ?? value;
  }

  function removePrefix(value: string) {
    return value.replace(prefixRegExp, '$1');
  }

  function removeSuffix(value: string) {
    return value.replace(suffixRegExp, '');
  }

  function removeSpecialSymbols(value: string) {
    return withoutSpecialSymbols ? value.replace(/(^\D)|(-)/g, '') : value;
  }

  function validateByLimits(value: number | null, forced: boolean) {
    if (value === null) {
      return;
    }
    if (value > max && (max >= 0 || forced)) {
      return max;
    }
    if (value < min && (min <= 0 || forced)) {
      return min;
    }
  }

  function updateStateByValue(value: string, forced: boolean) {
    setFormattedValue(validateAndGetValue(value, forced));
  }

  function validateAndGetValue(value: string, forced: boolean): string {
    if (value === '') {
      return value;
    }

    const unrangedValue = parseFloat(getClearValue(value));
    const valueOutOfLimits = validateByLimits(unrangedValue, forced);

    if (valueOutOfLimits !== undefined) {
      onChange?.(valueOutOfLimits);
      return formatNumber(valueOutOfLimits);
    }

    return value;
  }

  function getClearValue(value: string) {
    return R.pipe(
      value,
      removeSpecialSymbols,
      removePrefix,
      removeSuffix,
      correctSign,
      trimDecimals,
    );
  }

  function formattingZero(value: string) {
    if (/^0{2,}$/.test(value)) {
      return '0';
    }

    if (/^0[1-9]+(\.)?(\d+)?$/.test(value)) {
      return value.slice(1);
    }

    if (/^-0[1-9]+(\.)?(\d+)?$/.test(value)) {
      return `-${value.slice(2)}`;
    }

    if (/^[.]\d+$/.test(value)) {
      return `0${value}`;
    }

    if (/^-[.]\d+?$/.test(value)) {
      const pureValue = value.replace(/-/g, '');
      return `-0${pureValue}`;
    }

    return value;
  }

  return {
    inputRef,
    api: {
      setValue: (value: number | null) =>
        updateStateByValue(formatNumber(value, needFormatDecimal), true),
      refreshValue,
      getFormattedValue: () => formattedValue,
    },
    value: formattedValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyUp: handleKeyUp,
    onMouseUp: handleMouseUp,
  } as const;
}

export { useNumberFormat };
