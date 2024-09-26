const DELAY_MIN = 3000;
const DELAY_EXTRA_MAX = 2000;
const IS_SUPPORT_REQUEST_IDLE_CALLBACK = 'requestIdleCallback' in window;

export function preloadImport(factory: () => Promise<unknown>): void {
  const runAfterDelay = () => {
    const delay = DELAY_MIN + Math.random() * DELAY_EXTRA_MAX;
    window.setTimeout(() => {
      if (IS_SUPPORT_REQUEST_IDLE_CALLBACK) {
        window.requestIdleCallback(factory);
      } else {
        factory();
      }
    }, delay);
  };

  if (document.readyState === 'complete') {
    runAfterDelay();
  } else {
    window.addEventListener('load', runAfterDelay);
  }
}
