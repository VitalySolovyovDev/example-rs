import {
  useState,
  type ReactNode,
  type MouseEvent,
  type ChangeEvent,
  type FocusEvent,
  useRef,
} from 'react';
import {
  TextField,
  type FilledTextFieldProps,
  type InputBaseProps as MUIInputProps,
  type InputLabelProps as MUIInputLabelProps,
  type TooltipProps,
} from '@mui/material';
import cn from 'clsx';
import { LockOutlined } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';

import { Tooltip } from 'shared/view/components/Tooltip/Tooltip';
import { useBindRef } from 'shared/view/hooks/useBindRef';

import styles from './TextInput.module.scss';

type Props = Omit<
  FilledTextFieldProps,
  'variant' | 'onChange' | 'className' | 'classes' | 'error' | 'helperText'
> & {
  dataTest?: string;
  /** for cases when startAdornment is used with labeled input */
  labeledStartAdornment?: ReactNode;
  isError?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  error?: ReactNode;
  blank?: boolean;
  centeredMode?: boolean;
  autoFocus?: boolean;
  InputLabelProps?: Omit<FilledTextFieldProps['InputLabelProps'], 'className' | 'classes'>;
  InputProps?: Omit<
    FilledTextFieldProps['InputProps'],
    'disableUnderline' | 'classes' | 'className'
  >;
  errorPlacement?: TooltipProps['placement'];
  errorDisplay?: 'tooltip' | 'text';
  onChange?(value: string): void;
  onFixError?(): void;
};

const TextInput = observer(function TextInput({
  dataTest,
  blank,
  isError,
  error,
  centeredMode,
  autoFocus,
  onChange,
  onFocus,
  onBlur,
  InputLabelProps,
  InputProps,
  labeledStartAdornment,
  disabled,
  errorPlacement = 'top',
  errorDisplay = 'tooltip',
  onFixError,
  label,
  multiline,
  ...rest
}: Props) {
  const inputClasses = (withoutLabel: boolean): MUIInputProps['classes'] => {
    return {
      root: cn(styles.inputRoot, {
        [styles.multiline]: multiline,
        [styles.centeredInput]: centeredMode,
      }),
      focused: cn(styles.inputRoot, styles.focused),
      adornedEnd: cn(styles.inputRoot, styles.withAdornedEnd),
      adornedStart: cn(styles.inputRoot, styles.withAdornedStart),
      input: cn(styles.input, {
        [styles.withoutLabel]: withoutLabel,
        [styles.blank]: blank,
        [styles.withAdornedStart]: !!InputProps?.startAdornment,
        [styles.center]: centeredMode,
      }),
    };
  };
  const isMobile = false;
  const [isFocused, setIsFocused] = useState(false);

  const labelClasses: MUIInputLabelProps['classes'] = {
    root: cn(styles.inputLabel, { [styles.centered]: centeredMode }),
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const { inputRef: parentInputRef } = InputProps ?? rest;
  useBindRef(inputRef, parentInputRef);

  // preventDefault keeps focus
  const handleFixError = (event: MouseEvent) => {
    if (isMobile) {
      event.preventDefault();
    }
    onFixError?.();
  };

  const hasError = !!error && !disabled;
  const endAdornment = InputProps?.endAdornment;

  return (
    <Tooltip
      dataTest={dataTest}
      open={isFocused && hasError && errorDisplay === 'tooltip'}
      message={error ?? ''}
      isError={hasError || isError}
      placement={errorPlacement}
      onFixError={onFixError && handleFixError}
    >
      <div className={styles.wrapper}>
        <div
          className={cn(
            styles.inputWrapper,
            { [styles.disabled]: disabled },
            { [styles.withStartAdornment]: (!!labeledStartAdornment || disabled) && !centeredMode },
            { [styles.wrapperError]: hasError || isError },
            { [styles.focused]: isFocused },
          )}
          data-test={dataTest && `${dataTest}-wrapper`}
        >
          {disabled && !centeredMode ? (
            <LockOutlined className={styles.lockIcon} />
          ) : (
            labeledStartAdornment
          )}
          <TextField
            {...rest}
            label={
              centeredMode && disabled ? (
                <div className={styles.labelCentered}>
                  {label} <LockOutlined className={styles.lockIcon} />
                </div>
              ) : (
                label
              )
            }
            multiline={multiline}
            disabled={disabled}
            className={styles.root}
            variant="filled"
            onChange={handleChange}
            InputLabelProps={{
              ...InputLabelProps,
              classes: labelClasses,
            }}
            InputProps={{
              ...InputProps,
              onFocus: handleFocus,
              onBlur: handleBlur,
              disableUnderline: true,
              classes: inputClasses(!label),
              inputRef,
              inputProps: {
                'data-test': dataTest,
                autoFocus,
                ...InputProps?.inputProps,
              },
              endAdornment: !!endAdornment && (
                <div className={styles.endAdornment}>{endAdornment}</div>
              ),
            }}
          />
        </div>
        {error && errorDisplay === 'text' && <div className={styles.errorText}>{error}</div>}
      </div>
    </Tooltip>
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event.target.value);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (onFocus) {
      onFocus(event);
    } else {
      InputProps?.onFocus?.(event);
    }
    setIsFocused(true);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (onBlur) {
      onBlur(event);
    } else {
      InputProps?.onBlur?.(event);
    }
    setIsFocused(false);
  }
});

export { TextInput };
export type { Props as TextInputProps };
