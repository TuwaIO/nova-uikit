import { afterEach, describe, expect, it, vi } from 'vitest';

import { isTouchDevice } from './isTouchDevice';

describe('isTouchDevice utility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(isTouchDevice()).toBe(false);
  });

  it('returns true for touch-enabled mobile screen', () => {
    vi.stubGlobal('window', {
      innerWidth: 400,
      ontouchstart: null,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });
    vi.stubGlobal('navigator', { maxTouchPoints: 5 });

    expect(isTouchDevice(1200)).toBe(true);
  });

  it('returns false for touch-enabled screen exceeding maxWidth', () => {
    vi.stubGlobal('window', {
      innerWidth: 1400,
      ontouchstart: null,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });
    vi.stubGlobal('navigator', { maxTouchPoints: 5 });

    expect(isTouchDevice(1200)).toBe(false);
  });

  it('returns false when no touch properties exist', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });
    vi.stubGlobal('navigator', { maxTouchPoints: 0 });

    expect(isTouchDevice(1200)).toBe(false);
  });
});
