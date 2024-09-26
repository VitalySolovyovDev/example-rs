import {action, computed, makeObservable, observable} from 'mobx';
import Decimal from 'decimal.js';
import * as R from 'remeda';

import type { Services } from 'services';

const FRACTION_DIGITS_IN_PERCENT = 2;

class BotsStore {
  constructor(
    services: Services,
  ) {
    makeObservable(this);
  }

  @observable private _investment: number | null = null;
  @observable public availableInvestment: number = 1000;

  // Bots Validation Store (this is just structure example)
  formValidator = {
    errors: {
      investment: {
        error: null,
        closestValidValue: 0
      }
    }
  };

  public subscribeToBots = () => {};

  @computed
  public get investment() {
    if (this._investment !== null) {
      return this._investment;
    }

    return this.defaultInvestment;
  }

  @computed
  public get defaultInvestment() {
    return 0;
  }

  @computed
  get investmentProportion(): number {
    if (this.investment === 0) {
      return 0;
    }
    return this.calcValueProportion(this.investment, this.availableInvestment);
  }

  @action.bound
  public setInvestment(value: number | null) {
    this._investment = value;
  }

  @action.bound
  public setInvestmentProportion(proportion: number) {
    const newInvestment = this.calcByPercent(this.availableInvestment, proportion);
    this.setInvestment(newInvestment);
  }

  private calcValueProportion = (
    currentValue: number,
    availableValue: number,
    digits = FRACTION_DIGITS_IN_PERCENT,
  ) => {
    if (availableValue === 0) {
      return 0;
    }
    const percent = Decimal.div(currentValue, availableValue).mul(100).toDP(digits).toNumber();
    return R.clamp(percent, { min: 0, max: 100 });
  };

  private calcByPercent = (percent: number, value: number): number => {
    return Decimal.mul(value, percent).div(100).toNumber();
  }
}

export { BotsStore };
