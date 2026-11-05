import { afterEach, describe, expect, it, vi } from 'vitest';

import { dialogTop, watchDialogAnchor } from './dialogAnchor';

describe('dialogTop', () => {
  it('stays where the dialog opened, whatever its height: moving would take everything in it along', () => {
    expect(dialogTop(100, 800, 1000, 16)).toBe(100);
    expect(dialogTop(100, 300, 1000, 16)).toBe(100);
  });

  it('moves up only as far as it takes when the dialog would run past the bottom of the screen', () => {
    expect(dialogTop(300, 800, 1000, 16)).toBe(184);
  });

  it('never goes above the screen', () => {
    expect(dialogTop(100, 1200, 1000, 16)).toBe(0);
  });
});

describe('watchDialogAnchor', () => {
  afterEach(() => vi.unstubAllGlobals());

  const setUp = (matches: boolean) => {
    const observed: Array<() => void> = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        observe() {
          observed.push(this.callback);
        }
        disconnect() {}
      },
    );
    const listeners = new Map<string, () => void>();
    vi.stubGlobal('window', {
      innerHeight: 1000,
      matchMedia: () => ({ matches }),
      addEventListener: (type: string, listener: () => void) => listeners.set(type, listener),
      removeEventListener: (type: string) => listeners.delete(type),
    });
    const style: Record<string, string> = {};
    const styled = new Proxy(style, {
      get: (target, key) => (key === 'removeProperty' ? (name: string) => delete target[name] : target[key as string]),
      set: (target, key, value) => {
        target[key as string] = value;
        return true;
      },
    });
    const dialog = {
      offsetHeight: 800,
      style: styled,
      getBoundingClientRect: () => ({ top: 100 }),
    } as unknown as HTMLElement & { offsetHeight: number };
    return { observed, listeners, style, dialog, content: {} as HTMLElement };
  };

  it('holds the top edge when the content shrinks and grows', () => {
    const { observed, style, dialog, content } = setUp(true);
    watchDialogAnchor({ dialog, content });
    expect(style).toEqual({ translate: '-50% 0', top: '100px' });

    Object.assign(dialog, { offsetHeight: 400 });
    observed.forEach((report) => report());
    expect(style.top).toBe('100px');
  });

  it('leaves a sheet at the bottom of a narrow screen alone', () => {
    const { style, dialog, content } = setUp(false);
    watchDialogAnchor({ dialog, content });
    expect(style).toEqual({});
  });

  it('gives the position back to the classes when it stops', () => {
    const { style, dialog, content, listeners } = setUp(true);
    const stop = watchDialogAnchor({ dialog, content });
    stop();
    expect(style).toEqual({});
    expect(listeners.size).toBe(0);
  });
});
