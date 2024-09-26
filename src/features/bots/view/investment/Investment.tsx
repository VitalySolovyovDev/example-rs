import { useDeferredValue } from 'react';
import { observer } from 'mobx-react-lite';

import { useFeature } from 'features/featureProvider';
import { NumberInput } from 'shared/view/components/NumberInput';
import { Slider } from 'shared/view/components/Slider';

import styles from './Investment.module.scss';

export const Investment = observer(function Investment() {
  const {
    investment,
    formValidator,
    setInvestment,
    investmentProportion,
    setInvestmentProportion,
    availableInvestment,
  } = useFeature('bots');

  const inputLabel = 'Investment';
  const profitCurrency = 'USDT';
  const profitCurrencyDecimals = 2;

  const validValue = formValidator.errors.investment.closestValidValue;

  const deferredInvestment = useDeferredValue(investment)

  return (
    <div className={styles.root}>
      <NumberInput
        data-test="dca-investment"
        value={deferredInvestment}
        onChange={setInvestment}
        label={`${inputLabel}, ${profitCurrency}`}
        decimalScale={profitCurrencyDecimals}
        InputProps={{
          endAdornment: <span>≈ {`${investment} USD`}</span>,
        }}
        error={formValidator.errors.investment.error}
        onFixError={validValue ? handleFixInvestment : undefined}
        min={0}
      />
      <Slider<number>
        dataTest="dca-investment-slider"
        valueLabelDisplay="on"
        value={investmentProportion}
        onChange={setInvestmentProportion}
      />
      <span className={styles.availableInvestment}>{`Available Investment: ${availableInvestment} USDT`}</span>
    </div>
  );

  function handleFixInvestment() {
    if (validValue) {
      setInvestment(validValue);
    }
  }
});
