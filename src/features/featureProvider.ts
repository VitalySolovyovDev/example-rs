import { useContext, createContext } from 'react';

import type { Services } from 'services';
import { BotsStore } from "features/bots/mobx/BotsStore";

class Features {
  constructor(private services: Services) {}

  readonly bots = new BotsStore(this.services);
}

const featuresContext = createContext<Features | null>(null);
const FeaturesProvider = featuresContext.Provider;

function useFeature<T extends keyof Features>(featureName: T) {
  const context = useContext(featuresContext);
  if (context) {
    return context[featureName];
  }
  throw Error('Feature Provider or features in Feature Provider are not provided!');
}

export { Features, useFeature, FeaturesProvider, featuresContext };
