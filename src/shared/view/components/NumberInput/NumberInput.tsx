import { type MutableRefObject, useEffect, useState } from 'react';
import type { InputBaseComponentProps } from '@mui/material';

import { useBindRef } from 'shared/view/hooks/useBindRef';
import { TextInput, type TextInputProps } from 'shared/view/components/TextInput/TextInput';

import { useNumberFormat } from './useNumberFormat';

type Api = ReturnType<typeof useNumberFormat>['api'];

type Props = Omit<TextInputProps, 'onChange' | 'value' | 'isError' | 'prefix' | 'suffix'> & {
  value: number | null;
  apiRef?: MutableRefObject<Api | undefined>;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  decimalScale?: number;
  /** only has an effect when `decimalScale` is set */
  needFormatDecimal?: boolean;
  withoutSpecialSymbols?: boolean;
  onChange?(value: number | null): void;
  onFixError?(): void;
};

const NUMERIC_INPUT_PROPS: InputBaseComponentProps = { inputMode: 'decimal', maxLength: 20 };

const NumberInput = ({
  dataTest,
  value,
  autoComplete = 'off',
  prefix,
  suffix,
  min,
  max,
  decimalScale,
  needFormatDecimal,
  withoutSpecialSymbols,
  apiRef,
  onChange,
  onBlur,
  onFocus,
  onFixError,
  onMouseUp,
  onKeyUp,
  InputProps,
  ...rest
}: Props) => {
  const numberInput = useNumberFormat(
    value,
    { onChange, onBlur, onFocus, onMouseUp, onKeyUp },
    { suffix, min, max, decimalScale, prefix, needFormatDecimal, withoutSpecialSymbols },
  );
  const [isFixedError, setIsFixedError] = useState(false);

  useEffect(() => {
    if (apiRef) {
      // eslint-disable-next-line no-param-reassign
      apiRef.current = numberInput.api;
    }
  });

  // needs update number input value if fix validation error handled
  useEffect(() => {
    if (isFixedError) {
      numberInput.api.refreshValue();
      setIsFixedError(false);
    }
  }, [isFixedError]); // eslint-disable-line react-hooks/exhaustive-deps

  const { inputRef } = InputProps ?? rest;
  useBindRef(numberInput.inputRef, inputRef);

  return (
    <TextInput
      dataTest={dataTest}
      autoComplete={autoComplete}
      {...rest}
      onFixError={
        onFixError
          ? () => {
              onFixError?.();
              setIsFixedError(true);
            }
          : undefined
      }
      InputProps={{
        ...InputProps,
        ...numberInput,
        inputProps: { ...NUMERIC_INPUT_PROPS, ...InputProps?.inputProps },
      }}
    />
  );
};

export { NumberInput };
export type { Props as NumberInputProps, Api as NumberInputApi };
