import { describe, expect, it, vi } from 'vitest';

const reduceMotion = vi.hoisted(() => ({ value: false }));

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => reduceMotion.value,
}));

const state = vi.hoisted(() => ({ settled: undefined as string | undefined }));
const layoutEffects = vi.hoisted(() => [] as (() => unknown)[]);

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [typeof initial === 'string' ? (state.settled ?? initial) : initial, vi.fn()],
  useRef: () => ({ current: null }),
  useEffect: vi.fn(),
  useLayoutEffect: (effect: () => unknown) => void layoutEffects.push(effect),
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

  // A text of the host in its monospace font turned to Nova's own one while its letters changed, and back: at rest it has no
  // class of Nova, and with one it became the outermost part of Nova, which sets the font
  it('keeps the font it stands in while it changes', () => {
    reduceMotion.value = false;
    state.settled = undefined;
    expect((MorphText({ children: 'Pending' }) as unknown as Node).props.className).toBe('');
    state.settled = 'Pending';
    const changing = MorphText({ children: 'Success' }) as unknown as Node;
    expect(changing.props.className).toContain('novacore:[font-family:inherit]');
  });

  // A button whose label had changed its language kept the width of the change: motion wrote the width once more in the frame
  // after it had been taken off, so the label no longer wrapped and ran out of a narrow window
  it('leaves no width on the text, whenever the change ends', () => {
    reduceMotion.value = false;
    state.settled = 'Delete account';
    const letters = (
      MorphText({ children: 'Видалити обліковий запис' }) as unknown as { props: { children: unknown[] } }
    ).props.children[1] as { type: (props: object) => unknown; props: object };
    const cancel = vi.fn();
    const root = {
      getBoundingClientRect: () => ({ width: 100 }),
      parentElement: null,
      animate: vi.fn(() => ({ cancel })),
      style: {
        width: '',
        removeProperty(name: string) {
          if (name === 'width') this.width = '';
        },
      },
    };
    const text = { getBoundingClientRect: () => ({ width: 228 }) };
    let frame: (() => void) | undefined;
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      frame = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    layoutEffects.length = 0;
    letters.type({ ...letters.props, rootRef: { current: root }, textRef: { current: text } });
    const cleanups = layoutEffects.map((effect) => effect());
    expect(root.style.width).toBe('100px');

    frame?.();
    // The browser animates it, and writes nothing to the element: the end of the change stands under it
    expect(root.animate).toHaveBeenCalledExactlyOnceWith([{ width: '100px' }, { width: '228px' }], {
      duration: 340,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    });
    expect(root.style.width).toBe('228px');

    for (const cleanup of cleanups) if (typeof cleanup === 'function') cleanup();
    expect(cancel).toHaveBeenCalledOnce();
    expect(root.style.width).toBe('');
    vi.unstubAllGlobals();
  });

  it('just changes the text with prefers-reduced-motion', () => {
    reduceMotion.value = true;
    state.settled = 'Pending';
    const tree = MorphText({ children: 'Success' }) as unknown as Node;

    expect(textOf(tree).props.children).toBe('Success');
    expect(tree.props.children[1]).toBe(false);
  });
});
