import { useContext, createContext, type ReactNode } from 'react';

import { Features } from 'features/featureProvider';
import { type Services, services } from 'services/servicesProvider';

export class RootStore {
  constructor() {
    this.services = services;
    this.features = new Features(this.services);
  }

  services: Services;
  features: Features;
}

const rootStoreContext = createContext<RootStore | null>(null);

export const useRootStore = () => {
  const context = useContext(rootStoreContext);
  if (context) {
    return context;
  }
  throw Error('Root store is not provided!');
};

type RootStoreProviderProps = {
  children: ReactNode;
  store: RootStore;
};

export const RootStoreProvider = ({ children, store }: RootStoreProviderProps) => {
  return <rootStoreContext.Provider value={store}>{children}</rootStoreContext.Provider>;
};
