import { describe, expect, it, vi } from 'vitest';

const reduceMotion = vi.hoisted(() => ({ value: false }));

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => reduceMotion.value,
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
}));

import { morphLetters, MorphText } from './MorphText';

describe('morphLetters', () => {
  it('gives the n-th copy of a letter the same key in both versions, so that it glides', () => {
    const keys = (text: string) => morphLetters(text).map(({ key }) => key);

    expect(keys('Pending')).toContain('n-1');
    expect(keys('Pending').filter((key) => keys('Spend').includes(key))).toEqual(['e-0', 'n-0', 'd-0']);
  });

  it('keeps every letter unique, as React keys need', () => {
    const keys = morphLetters('aaa bbb').map(({ key }) => key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('does not tear apart a letter made of several code points', () => {
    expect(morphLetters('a👨‍👩‍👧b').map(({ letter }) => letter)).toEqual(['a', '👨‍👩‍👧', 'b']);
  });

  it('keeps the spaces', () => {
    expect(
      morphLetters('a b')
        .map(({ letter }) => letter)
        .join(''),
    ).toBe('a b');
  });
});

describe('MorphText', () => {
  it('is a plain span at rest: a list of statuses must not cost a motion element per letter', () => {
    reduceMotion.value = false;
    const tree = MorphText({ children: 'Pending', className: 'label' }) as unknown as {
      type: string;
      props: { children: string; className: string };
    };

    expect(tree.type).toBe('span');
    expect(tree.props.children).toBe('Pending');
    expect(tree.props.className).toBe('label');
  });
});
