import { useState, useEffect } from 'react';

import { RootStore } from 'core/RootStore';

/**
 * 1. `RootStore` should be initialized only after loading the wasm module (@see src/index.tsx),
 *    so it's initialized inside the component tree rather than at the top level of some module.
 * 2. `RootStore` should not change between renders,
 *    so it's initialized via the `initialState` using the `useState` hook.
 * 3. However, `RootStore` should be reinitialized when its code changes,
 *    so we use the Hot Module Replacement API of bundler. (adapted for Webpack, Rspack and Vite).
 */
export const useRootStoreInit = () => {
  const [rootStore, setRootStore] = useState(() => new RootStore());

  useEffect(() => {
    const handleHMR = () => setRootStore(new RootStore());
    // @ts-expect-error -- not processed by TypeScript
    if (import.meta.hot) {
      // Vite: https://vitejs.dev/guide/api-hmr#hot-accept-deps-cb
      // @ts-expect-error -- not processed by TypeScript
      import.meta.hot.accept('core/RootStore', handleHMR);
      // @ts-expect-error -- not processed by TypeScript
    } else if (import.meta.webpackHot) {
      // Webpack: https://webpack.js.org/api/hot-module-replacement/#module-api
      // Rspack: https://www.rspack.dev/api/hmr#hot-module-replacement
      // @ts-expect-error -- not processed by TypeScript
      import.meta.webpackHot.accept('core/RootStore', handleHMR);
    }
  }, []);

  return rootStore;
};
