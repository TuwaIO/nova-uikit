import { describe, expect, it, vi } from 'vitest';

import { retryableLazy } from './retryableLazy';

const payloadOf = (component: unknown) => component as { _init: (payload: unknown) => unknown; _payload: unknown };
const start = (component: unknown) => {
  const { _init, _payload } = payloadOf(component);
  try {
    _init(_payload);
  } catch {
    // React.lazy throws the promise while it loads
  }
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('retryableLazy', () => {
  const Loaded = () => null;

  // One failed load of the history disabled it until the page was reloaded
  it('tries again on the next mount after a failed load', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('chunk')).mockResolvedValueOnce(Loaded);
    const getComponent = retryableLazy(load);

    start(getComponent());
    await settle();
    start(getComponent());
    await settle();

    expect(load).toHaveBeenCalledTimes(2);
    expect(getComponent()).toBe(Loaded);
  });

  it('gives the component itself once it has loaded, so that coming back shows no fallback', async () => {
    const load = vi.fn().mockResolvedValue(Loaded);
    const getComponent = retryableLazy(load);

    start(getComponent());
    await settle();

    expect(getComponent()).toBe(Loaded);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
