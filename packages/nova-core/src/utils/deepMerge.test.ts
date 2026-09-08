import { describe, expect, it } from 'vitest';

import { deepMerge } from './deepMerge';

describe('deepMerge utility', () => {
  it('merges shallow objects without mutating target', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 99, c: 3 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 99, c: 3 });
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('recursively merges nested objects', () => {
    const target = {
      user: {
        name: 'Alice',
        settings: { theme: 'dark', notifications: true },
      },
    };
    const source = {
      user: {
        settings: { theme: 'light' },
      },
    };

    const result = deepMerge(target, source as unknown as Partial<typeof target>);
    expect(result).toEqual({
      user: {
        name: 'Alice',
        settings: { theme: 'light', notifications: true },
      },
    });
  });

  it('overwrites primitive values with source values', () => {
    const target = { count: 10, label: 'old' };
    const source = { count: 20, label: 'new' };
    const result = deepMerge(target, source);

    expect(result).toEqual({ count: 20, label: 'new' });
  });

  it('replaces arrays rather than merging them', () => {
    const target = { items: [1, 2, 3] };
    const source = { items: [4, 5] };
    const result = deepMerge(target, source);

    expect(result).toEqual({ items: [4, 5] });
  });
});
