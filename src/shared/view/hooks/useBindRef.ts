import { type Ref, type RefObject, type MutableRefObject, useEffect } from 'react';

export function useBindRef<TValue, TRef extends Ref<TValue> | MutableRefObject<TValue>>(
  sourceRef: TRef,
  targetRef?: TRef,
) {
  useEffect(() => {
    if (!targetRef) {
      return;
    }
    // eslint-disable-next-line no-param-reassign
    (targetRef as MutableRefObject<TValue | null>).current = (
      sourceRef as RefObject<TValue>
    ).current;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
