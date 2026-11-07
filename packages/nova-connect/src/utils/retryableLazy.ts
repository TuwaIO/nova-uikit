import { ComponentType, lazy } from 'react';

/**
 * A component loaded on demand that can try again. `React.lazy` keeps a failed load for good, which disabled the screen
 * until a reload of the page. Call what this returns once per mount of the screen: it gives the component itself once it
 * has loaded, so coming back shows no fallback, and otherwise a new lazy component.
 *
 * @typeParam C - The component.
 * @param load - Loads the component.
 * @returns A function that gives the component to render.
 * @internal
 */
export function retryableLazy<C>(load: () => Promise<C>): () => C {
  let loaded: C | undefined;
  return () =>
    loaded ??
    (lazy(async () => {
      const component = await load();
      loaded = component;
      return { default: component as unknown as ComponentType<object> };
    }) as unknown as C);
}
