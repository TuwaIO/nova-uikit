import { readFileSync } from 'node:fs';
import path from 'node:path';

import { pixelFlight } from '@tuwaio/nova-icons';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useId: () => ':r1:',
  // No provider in these tests: the default of the icon set (the pixel look)
  useContext: (context: { _currentValue: unknown }) => context._currentValue,
}));

import { QuasarLoader } from './QuasarLoader';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const classesOf = (tree: unknown) => elements(tree).map((element) => String(element.props.className ?? ''));

describe('QuasarLoader, classic', () => {
  it('is the whole mark from 28 px and the compact one below that', () => {
    expect(classesOf(QuasarLoader({ size: 40, look: 'classic' }))).toContain('tuwa-ql-jet');
    expect(classesOf(QuasarLoader({ size: 28, look: 'classic' }))).toContain('tuwa-ql-jet');
    expect(classesOf(QuasarLoader({ size: 16, look: 'classic' }))).not.toContain('tuwa-ql-jet');
    expect(classesOf(QuasarLoader({ size: 16, variant: 'full', look: 'classic' }))).toContain('tuwa-ql-jet');
  });

  it('is announced only with a label, and is decorative without one', () => {
    const labelled = QuasarLoader({ label: 'Loading' }) as unknown as Element;
    const plain = QuasarLoader({}) as unknown as Element;

    expect(labelled.props.role).toBe('status');
    expect(elements(labelled).some((element) => element.props.children === 'Loading')).toBe(true);
    expect(plain.props.role).toBeUndefined();
    expect(plain.props['aria-hidden']).toBe(true);
  });

  it('takes its color from the accent prop', () => {
    const tree = QuasarLoader({ accent: 'var(--tuwa-pending-icon)' }) as unknown as Element;

    expect((tree.props.style as Record<string, unknown>)['--tuwa-loader-accent']).toBe('var(--tuwa-pending-icon)');
  });

  it('has a clip path id that is a plain name: colons from useId would not work inside url(#…)', () => {
    const ids = elements(QuasarLoader({ look: 'classic' })).flatMap((element) =>
      element.props.id ? [String(element.props.id)] : [],
    );

    expect(ids).toEqual(['r1-far', 'r1-near']);
  });

  it('holds still with prefers-reduced-motion', () => {
    const css = readFileSync(path.resolve(__dirname, '../styles/quasar-loader.css'), 'utf8');

    expect(css).toMatch(
      /prefers-reduced-motion: reduce\) \{\s*\.tuwa-quasar-loader \* \{\s*animation: none !important;/,
    );
    // The opacity of these comes from their animations alone: without one the glow is a solid disc over the mark
    const still = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(still).toMatch(/\.tuwa-ql-glow \{\s*opacity: 0\.2;/);
    expect(still).toMatch(/\.tuwa-ql-beam \{\s*opacity: 0;/);
  });
});

// What Nova draws has a pixel variant, its look by default, and the look of today with Heroicons
describe('QuasarLoader, pixel', () => {
  const svgOf = (tree: unknown) => elements(tree).find((element) => element.type === 'svg')!;
  const rectsOf = (tree: unknown, className: string) =>
    elements(tree).filter((element) => element.type === 'rect' && String(element.props.className).includes(className));

  it('is the pixel look without a provider, on a grid with crisp edges', () => {
    const tree = QuasarLoader({}) as unknown as Element;
    expect(String(tree.props.className)).toContain('tuwa-quasar-loader--pixel');
    expect(svgOf(tree).props).toMatchObject({ viewBox: '0 0 20 20', shapeRendering: 'crispEdges' });
    expect(svgOf(QuasarLoader({ size: 16 })).props.viewBox).toBe('0 0 12 12');
  });

  it('has the jets and their nodes in the whole mark only', () => {
    expect(rectsOf(QuasarLoader({ size: 40 }), 'tuwa-qlp-node')).toHaveLength(2);
    expect(rectsOf(QuasarLoader({ size: 40 }), 'tuwa-qlp-beam').length).toBeGreaterThan(4);
    expect(rectsOf(QuasarLoader({ size: 16 }), 'tuwa-qlp-node')).toHaveLength(0);
  });

  it('runs a light round the orbit, each pixel in its turn, the near half in front of the core', () => {
    const tree = QuasarLoader({ size: 40 });
    const orbit = rectsOf(tree, 'tuwa-qlp-orbit');
    const turns = orbit
      .map((rect) => Number((rect.props.style as Record<string, unknown>)['--i']))
      .sort((a, b) => a - b);
    expect(turns).toEqual(orbit.map((_, index) => index));
    const all = elements(tree);
    const core = all.findIndex((element) => String(element.props.className).includes('tuwa-qlp-core'));
    const near = all.findIndex((element) => String(element.props.className).includes('tuwa-qlp-orbit--near'));
    const far = all.findIndex((element) => String(element.props.className).includes('tuwa-qlp-orbit--far'));
    expect(far).toBeLessThan(core);
    expect(near).toBeGreaterThan(core);
  });

  it('keeps its label, its accent and its decorative role as the classic one', () => {
    const labelled = QuasarLoader({ label: 'Loading', accent: 'red' }) as unknown as Element;
    expect(labelled.props.role).toBe('status');
    expect((labelled.props.style as Record<string, unknown>)['--tuwa-loader-accent']).toBe('red');
    expect((QuasarLoader({}) as unknown as Element).props['aria-hidden']).toBe(true);
  });

  it('holds still with prefers-reduced-motion, the light parked on the near side', () => {
    const css = readFileSync(path.resolve(__dirname, '../styles/quasar-loader.css'), 'utf8');
    const still = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(still).toMatch(/\.tuwa-qlp-park \{[^}]*fill: var\(--tuwa-loader-accent/);
    expect(rectsOf(QuasarLoader({ size: 40 }), 'tuwa-qlp-park').length).toBeGreaterThan(0);
  });

  // The mark beside the title of a sign-in page is drawn from its pixels as the page opens, like an icon with
  // `motion="assemble"`: each pixel flies in from its own spot, and the light runs on the pixels meanwhile
  describe('with motion="assemble"', () => {
    const flying = (tree: unknown) => elements(tree).filter((element) => element.props['data-px'] === '');

    it('assembles from its pixels: every part of the mark is one pixel in a group that flies in from its spot', () => {
      const tree = QuasarLoader({ size: 96, motion: 'assemble' });
      const groups = flying(tree);
      const still = QuasarLoader({ size: 96 });

      expect(svgOf(tree).props['data-motion']).toBe('assemble');
      // No part is left as one path, which could only appear at once
      expect(elements(tree).filter((element) => element.type === 'path')).toHaveLength(0);
      for (const group of groups) {
        expect(group.type).toBe('g');
        const [pixel] = elements(group.props.children);
        expect(pixel.type).toBe('rect');
        // The node is two pixels square, drawn from the end of its jet outward: it flies as the pixel of that end
        const isNode = String(pixel.props.className).includes('tuwa-qlp-node');
        if (!isNode) expect(group.props.style).toEqual(pixelFlight(Number(pixel.props.x), Number(pixel.props.y)));
      }
      const pixelsOf = (d: unknown) => [...String(d).matchAll(/M\d+ \d+h1v1h-1z/g)].length;
      const paths = elements(still).filter((element) => element.type === 'path');
      const filled = paths.reduce((count, element) => count + pixelsOf(element.props.d), 0);
      const drawn = elements(still).filter((element) => element.type === 'rect').length;
      expect(filled).toBeGreaterThan(0);
      expect(groups).toHaveLength(drawn + filled);
    });

    it('keeps the light on the pixels: the flight is on the group, the animation of the light on the pixel', () => {
      const tree = QuasarLoader({ size: 96, motion: 'assemble' });
      const orbit = rectsOf(tree, 'tuwa-qlp-orbit');

      expect(orbit.length).toBe(rectsOf(QuasarLoader({ size: 96 }), 'tuwa-qlp-orbit').length);
      for (const rect of orbit) {
        expect(rect.props['data-px']).toBeUndefined();
        expect(rect.props.style).toHaveProperty('--i');
      }
      expect(rectsOf(tree, 'tuwa-qlp-core').length).toBeGreaterThan(4);
    });

    it('is the mark at once without it, and in the classic look', () => {
      expect(svgOf(QuasarLoader({ size: 96 })).props['data-motion']).toBeUndefined();
      expect(flying(QuasarLoader({ size: 96 }))).toHaveLength(0);
      const classic = QuasarLoader({ size: 96, look: 'classic', motion: 'assemble' });
      expect(svgOf(classic).props['data-motion']).toBeUndefined();
      expect(flying(classic)).toHaveLength(0);
    });

    it('holds still for a reader who asks for less motion: the flight is an animation inside the loader', () => {
      const css = readFileSync(path.resolve(__dirname, '../styles/quasar-loader.css'), 'utf8');
      expect(css).toMatch(
        /prefers-reduced-motion: reduce\) \{\s*\.tuwa-quasar-loader \* \{\s*animation: none !important;/,
      );
    });
  });
});
