import type { ReactNode } from 'react';

import { useRootStore } from 'core/RootStore';
import { FeaturesProvider } from 'features/featureProvider';
import { ServicesProvider } from 'services/servicesProvider';

type Props = {
  children: ReactNode;
};

export const DepsProvider = ({ children }: Props) => {
  const rootStore = useRootStore();

  return (
    <ServicesProvider value={rootStore.services}>
      <FeaturesProvider value={rootStore.features}>{children}</FeaturesProvider>
    </ServicesProvider>
  );
};
