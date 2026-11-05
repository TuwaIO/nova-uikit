import { describe, expect, it, vi } from 'vitest';

const reduceMotion = vi.hoisted(() => ({ value: false }));

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => reduceMotion.value,
}));

const state = vi.hoisted(() => ({ settled: undefined as string | undefined }));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [typeof initial === 'string' ? (state.settled ?? initial) : initial, vi.fn()],
  useRef: () => ({ current: null }),
  useEffect: vi.fn(),
}));

import { morphLetters } from './morphLetters';
import { MorphText } from './MorphText';

type Node = { type: string; props: { children: [Node, unknown, unknown]; className?: string } };
const textOf = (tree: Node) => tree.props.children[0];

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
  it('is plain text at rest: a list of statuses must not cost a motion element per letter', () => {
    reduceMotion.value = false;
    state.settled = undefined;
    const tree = MorphText({ children: 'Pending', className: 'label' }) as unknown as Node;

    expect(tree.type).toBe('span');
    expect(tree.props.className).toBe('label');
    expect(textOf(tree).props.children).toBe('Pending');
    expect(tree.props.children[1]).toBe(false);
  });

  it('keeps the new text in the one element a screen reader reads, while the letters change on top of it', () => {
    reduceMotion.value = false;
    state.settled = 'Pending';
    const tree = MorphText({ children: 'Success' }) as unknown as Node;

    expect(textOf(tree).type).toBe('span');
    expect(textOf(tree).props.children).toBe('Success');
    expect(tree.props.children[1]).toBeTruthy();
  });

  it('just changes the text with prefers-reduced-motion', () => {
    reduceMotion.value = true;
    state.settled = 'Pending';
    const tree = MorphText({ children: 'Success' }) as unknown as Node;

    expect(textOf(tree).props.children).toBe('Success');
    expect(tree.props.children[1]).toBe(false);
  });
});
