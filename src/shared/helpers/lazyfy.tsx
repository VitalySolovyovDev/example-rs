/* eslint-disable @typescript-eslint/no-explicit-any,ban/ban */
import {
  Suspense,
  lazy,
  type ComponentType,
  type ReactNode,
  type LazyExoticComponent,
} from 'react';

import { preloadImport } from 'shared/helpers/preloadImport';

type LazyfyOptions = {
  fallback?: null | ReactNode;
  preload: boolean;
};

export function lazyfy<
  TSource extends Record<string, ComponentType<any>>,
  TComponentName extends keyof TSource & string,
>(
  factory: () => Promise<TSource>,
  componentName: TComponentName,
  { fallback = null, preload }: LazyfyOptions,
) {
  const LazyComponent = lazy(() =>
    factory().then(module => ({
      default: module[componentName],
    })),
  );
  if (preload) {
    preloadImport(factory);
  }
  return {
    [`${componentName}Lazy`]: (props => (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )) as LazyExoticComponent<TSource[TComponentName]>,
    [`preload${componentName}`]: () => factory(),
  } as {
    [P in TComponentName as `${TComponentName & string}Lazy`]: LazyExoticComponent<
      TSource[TComponentName]
    >;
  } & { [P in TComponentName as `preload${TComponentName & string}`]: () => Promise<void> };
}
