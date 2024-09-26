import type { ReactNode, UIEvent } from 'react';
import cn from 'clsx';
import { Tooltip as MUITooltip, type TooltipProps, Button, type ButtonProps } from '@mui/material';

import styles from './Tooltip.module.scss';

type Props = {
  dataTest?: string;
  title?: ReactNode;
  message: ReactNode;
  children: TooltipProps['children'];
  open?: boolean;
  isError?: boolean;
  placement?: TooltipProps['placement'];
  disableHoverListener?: boolean;
  disableTouchListener?: boolean;
  /** Allows wide tooltips */
  wide?: boolean;
  onClose?(): void;
  onFixError?(event: UIEvent): void;
};

const IS_OS_MOBILE = false;

function Tooltip({
  dataTest,
  title,
  children,
  message,
  isError,
  placement = 'top',
  open,
  disableHoverListener,
  disableTouchListener,
  wide,
  onClose,
  onFixError,
}: Props) {
  const content = (() => {
    if (!message && !title) {
      return '';
    }

    const tooltipDataTest = dataTest && `tooltip-text-${dataTest}`;
    return (
      <div className={styles.content} data-test="tooltip-content">
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message} data-test={tooltipDataTest}>
          {message}
        </div>
        {onFixError && (
          <div className={styles.fixItButton}>
            <TextButton
              fullWidth
              {...getFixErrorHandlerBtnProp()}
            >
              {'Fix It'}
            </TextButton>
          </div>
        )}
      </div>
    );
  })();

  return (
    <MUITooltip
      data-test={dataTest && `${dataTest}-tooltip`}
      title={content}
      classes={{
        tooltip: cn(styles.rootTooltip, {
          [styles.error]: isError,
          [styles.wide]: wide,
        }),
        popper: styles.popper,
      }}
      placement={placement}
      open={open}
      disableFocusListener // onFocus and onBlur do not work if using a Tooltip with TextField https://github.com/mui-org/material-ui/issues/19883#issuecomment-592980194
      disableHoverListener={disableHoverListener}
      disableTouchListener={disableTouchListener}
      onClose={onClose}
      enterTouchDelay={0}
      leaveTouchDelay={Infinity}
    >
      {children}
    </MUITooltip>
  );

  function getFixErrorHandlerBtnProp() {
    // we need touch events instead pointer events for mobiles,
    // because preventDefault and stopPropagation don't work correctly in pointer events
    return IS_OS_MOBILE
      ? {
          onTouchEnd: (e: UIEvent) => {
            e.stopPropagation();
            e.preventDefault();
            onFixError?.(e);
          },
        }
      : { onPointerDown: onFixError };
  }
}

const buttonClasses: ButtonProps['classes'] = {
  root: styles?.textButton,
  focusVisible: styles?.focused,
  disabled: styles?.disabled,
};

function TextButton({ children, ...rest }: ButtonProps) {
  return (
    <Button disableRipple classes={buttonClasses} {...rest}>
      {children}
    </Button>
  );
}

export { Tooltip };