import { useState, useEffect, type SyntheticEvent } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import {
  Slider as MUISlider,
  type SliderProps,
  type SliderValueLabelProps,
  Tooltip,
} from '@mui/material';

import styles from './Slider.module.scss';

type ValueLabelPlacement = 'top' | 'bottom';

type Props<TValue extends number | number[]> = Omit<
  SliderProps,
  'onChange' | 'value' | 'color' | 'size' | 'classes' | 'onChangeCommitted' | 'slots'
> & {
  value: TValue;
  color?: 'default' | 'transparent';
  dataTest?: string;
  startLabel?: string;
  endLabel?: string;
  valueLabelPlacement?: ValueLabelPlacement;
  onChange(value: TValue): void;
  onChangeCommitted?(value: TValue): void;
  valueLabelFormat?(value: number): string | number;
};

const MIN_VALUE = 0;
const MAX_VALUE = 100;

const makeValueLabel = <TValue extends number | number[]>(
  valueLabelFormat?: Props<TValue>['valueLabelFormat'],
  startOrEndLabel?: string | null,
  valueLabelPlacement?: ValueLabelPlacement,
) =>
  function ValueLabel({ children, open, value }: SliderValueLabelProps) {
    return (
      <Tooltip
        open={open}
        title={startOrEndLabel || valueLabelFormat?.(value) || `${value}%`}
        PopperProps={{
          disablePortal: true,
          modifiers: [{ name: 'flip', enabled: false }],
        }}
        TransitionProps={{ timeout: 0 }}
        classes={{
          tooltip: styles.valueLabel,
          popper: styles.valueLabelPopper,
        }}
        placement={valueLabelPlacement}
      >
        {children}
      </Tooltip>
    );
  };

export const Slider = observer(function Slider<TValue extends number | number[]>({
  color = 'default',
  onChange,
  onChangeCommitted,
  disabled,
  valueLabelFormat,
  dataTest = '',
  startLabel,
  endLabel,
  valueLabelPlacement = 'top',
  min = MIN_VALUE,
  max = MAX_VALUE,
  ...rest
}: Props<TValue>) {
  const sliderClasses: SliderProps['classes'] & { active?: string } = {
    root: cn(styles.slider, styles[color], {
      [styles.disabled]: disabled,
    }),
    track: styles.track,
    rail: styles.rail,
    thumb: styles.thumb,
    valueLabel: styles.valueLabel,
    active: styles.active,
    focusVisible: styles.focused,
    markLabel: styles.markLabel,
    mark: styles.mark,
    markActive: styles.markActive,
  };

  const [startOrEndLabel, setStartOrEndLabel] = useState<string | null>(null);
  const hasStartOrEndLabel = Boolean(startLabel || endLabel);

  useEffect(() => {
    if (hasStartOrEndLabel) {
      changeStartOrEndLabel(rest.value);
    }
  }, [rest.value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={cn(styles.root, {
        [styles.withStartLabel]: startLabel,
        [styles.withEndLabel]: endLabel,
      })}
    >
      {startLabel && (
        <span
          className={cn(styles.startLabel, styles[color], {
            [styles.disabled]: disabled,
            [styles.highlight]: rest.value === min,
          })}
          onClick={handleStartLabelClick}
        >
          {startLabel}
        </span>
      )}
      <MUISlider
        {...rest}
        min={min}
        max={max}
        data-test={dataTest}
        size="small"
        classes={sliderClasses}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        disabled={disabled}
        slots={{
          valueLabel:
            rest.valueLabelDisplay !== 'off'
              ? makeValueLabel(valueLabelFormat, startOrEndLabel, valueLabelPlacement)
              : undefined,
        }}
      />
      {endLabel && (
        <span
          className={cn(styles.endLabel, styles[color], {
            [styles.disabled]: disabled,
            [styles.highlight]: rest.value === max,
          })}
          onClick={handleEndLabelClick}
        >
          {endLabel}
        </span>
      )}
    </div>
  );

  function handleStartLabelClick() {
    if (!disabled) {
      onChange(min as TValue);
    }
  }

  function handleEndLabelClick() {
    if (!disabled) {
      onChange(max as TValue);
    }
  }

  function handleSliderChange(_: Event, value: number | number[]) {
    onChange(value as TValue);
  }

  function handleSliderChangeCommitted(_: SyntheticEvent | Event, value: number | number[]) {
    onChangeCommitted?.(value as TValue);
  }

  function changeStartOrEndLabel(value: number | number[]) {
    setStartOrEndLabel(() => {
      if (startLabel && value === min) {
        return startLabel;
      }
      if (endLabel && value === max) {
        return endLabel;
      }
      return null;
    });
  }
});
