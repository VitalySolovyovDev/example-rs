import type { ReactNode } from 'react';
import { StyledEngineProvider } from '@mui/material/styles';

import { RootStoreProvider } from 'core/RootStore';
import { DepsProvider } from 'core/deps';
import { useRootStoreInit } from 'core/useRootStoreInit';

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  const rootStore = useRootStoreInit();

  return (
    <StyledEngineProvider injectFirst>
      <RootStoreProvider store={rootStore}>
        <DepsProvider>{children}</DepsProvider>
      </RootStoreProvider>
    </StyledEngineProvider>
  );
};
