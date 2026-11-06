import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { closedToasts, rememberClosedToast } from './closedToasts';

const KEY = 'nova-transactions:closedToasts';

describe('the toasts a person closed', () => {
  beforeEach(() => {
    const kept = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => kept.get(key) ?? null,
      setItem: (key: string, value: string) => void kept.set(key, value),
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('are remembered across a page load', () => {
    rememberClosedToast('0xa');
    rememberClosedToast('0xb');
    expect(closedToasts()).toEqual(new Set(['0xa', '0xb']));
  });

  it('keep only the newest ones, as nothing else ever clears them', () => {
    for (let n = 0; n < 60; n += 1) rememberClosedToast(`0x${n}`);
    const closed = closedToasts();
    expect(closed.size).toBe(50);
    expect(closed.has('0x59')).toBe(true);
    expect(closed.has('0x0')).toBe(false);
  });

  it('say nothing of what cannot be read', () => {
    localStorage.setItem(KEY, 'not json');
    expect(closedToasts()).toEqual(new Set());
    localStorage.setItem(KEY, '{"a":1}');
    expect(closedToasts()).toEqual(new Set());
  });

  // A private window, a blocked origin: the page works, the toast only comes back
  it('do not break a page whose storage is closed', () => {
    const denied = () => {
      throw new Error('denied');
    };
    vi.stubGlobal('localStorage', { getItem: denied, setItem: denied });
    expect(closedToasts()).toEqual(new Set());
    expect(() => rememberClosedToast('0xa')).not.toThrow();
  });
});
