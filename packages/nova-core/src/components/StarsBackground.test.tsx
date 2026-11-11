import { describe, expect, it, vi } from 'vitest';

const { box } = vi.hoisted(() => ({
  box: { size: { width: 300, height: 200 } as { width: number; height: number } | null },
}));

// One render after mount, without a DOM: the measured box of the field is what a test sets in `box`
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useContext: (context: { _currentValue: unknown }) => context._currentValue,
    useMemo: (factory: () => unknown) => factory(),
    useRef: () => ({ current: null }),
    useEffect: () => undefined,
    useState: () => [box.size, () => undefined],
  };
});

import { StarsBackground } from './StarsBackground';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const classes = (tree: unknown) => elements(tree).map((element) => String(element.props.className ?? ''));

describe('StarsBackground', () => {
  it('draws no star before it knows its box, so the server renders the same empty field', () => {
    box.size = null;
    const tree = StarsBackground({ starsCount: 50 });
    expect(classes(tree).filter((name) => name.startsWith('tuwa-star'))).toHaveLength(0);
    box.size = { width: 300, height: 200 };
  });

  // The owner, 2026-11-11: the stars must look like stars, not dots, in both looks
  it('in the classic look has four-pointed stars among the small round ones', () => {
    const tree = StarsBackground({ starsCount: 120, look: 'classic' });
    const all = elements(tree);
    const sparkles = all.filter((element) => String(element.props.className).includes('tuwa-star-sparkle'));
    expect(sparkles.length).toBeGreaterThan(10);
    // A star of four points: four curves meeting at its tips
    const path = all.find((element) => element.type === 'path' && String(element.props.d).startsWith('M0 '));
    expect(String(path?.props.d).match(/C/g)).toHaveLength(4);
    expect(all.some((element) => element.type === 'circle')).toBe(true);
  });

  it('in the pixel look is made of pixel stars on whole pixels of the field', () => {
    const tree = StarsBackground({ starsCount: 120 });
    const stars = elements(tree).filter((element) =>
      String(element.props.className).split(' ').includes('tuwa-star-px'),
    );
    expect(stars.length).toBe(120);
    for (const star of stars) {
      expect(Number.isInteger(Number(star.props.x)), 'x').toBe(true);
      expect(Number.isInteger(Number(star.props.y)), 'y').toBe(true);
      expect(Number(star.props.x)).toBeLessThan(300);
      expect(Number(star.props.y)).toBeLessThan(200);
    }
    const svg = elements(tree).find((element) => element.type === 'svg');
    expect(svg?.props.shapeRendering).toBe('crispEdges');
    // The lit heart of a large star has the color of the star while it waits for its turn, and for good with reduced motion
    for (const heart of elements(tree).filter((element) => element.props.className === 'tuwa-star-px-heart')) {
      expect(heart.props.fill).toBe('color-mix(in srgb, var(--tuwa-text-primary) 70%, transparent)');
    }
  });

  it('holds still for a reader who asks for less motion, in both looks', () => {
    const style = elements(StarsBackground({ starsCount: 10 })).find((element) => element.type === 'style');
    const css = String(style?.props.children);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
    expect(css).toContain('.tuwa-star-px');
    expect(css).toContain('.tuwa-star-sparkle');
  });
});
