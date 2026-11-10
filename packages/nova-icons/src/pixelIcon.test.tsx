import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import * as icons from './index';
import { createPixelIcon, pixelPath } from './pixelIcon';

type Node = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

/** The children of an element as a list of elements. */
const childrenOf = (node: Node): Node[] =>
  ([] as unknown[]).concat(node.props.children ?? []).filter((child): child is Node => isValidElement(child));

const ART = ['#..', '.o.', '##.'];

describe('the pixels of an icon', () => {
  it('draws each run of a row as one rectangle', () => {
    expect(pixelPath(['##.#', '....', '.###'], '#')).toBe('M0 0h2v1h-2zM3 0h1v1h-1zM1 2h3v1h-3z');
    expect(pixelPath(ART, 'o')).toBe('M1 1h1v1h-1z');
  });

  it('refuses a grid whose rows differ in length, or an unknown mark', () => {
    expect(() => createPixelIcon('BadIcon', ['##', '###'])).toThrow(/BadIcon/);
    expect(() => createPixelIcon('BadIcon', ['#x'])).toThrow(/BadIcon/);
  });
});

describe('a pixel icon', () => {
  const Icon = createPixelIcon('TestIcon', ART);

  it('is an SVG on its grid, in the color of the text, with crisp pixels and a size of 1em by default', () => {
    const svg = Icon({}) as unknown as Node;
    expect(svg.type).toBe('svg');
    expect(svg.props).toMatchObject({
      viewBox: '0 0 3 3',
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      shapeRendering: 'crispEdges',
      'aria-hidden': true,
      focusable: 'false',
      'data-slot': 'icon',
    });
    const [base, lit] = childrenOf(svg);
    expect(base.props.d).toBe('M0 0h1v1h-1zM0 2h2v1h-2z');
    // A lit pixel takes the accent of the theme, the color of the text without one
    expect(lit.props).toMatchObject({ d: 'M1 1h1v1h-1z', fill: 'var(--tuwa-icon-accent, currentColor)' });
  });

  it('takes the props of an SVG element, its class and its ref as Heroicons do', () => {
    const ref = { current: null };
    const svg = Icon({ className: 'h-5 w-5', ref, 'aria-hidden': false }) as unknown as Node;
    expect(svg.props).toMatchObject({ className: 'h-5 w-5', ref, 'aria-hidden': false });
  });

  it('is named for a screen reader when it has a title, and hidden from it otherwise', () => {
    const svg = Icon({ title: 'Close', titleId: 'close-title' }) as unknown as Node;
    expect(svg.props).toMatchObject({ role: 'img', 'aria-labelledby': 'close-title' });
    expect(svg.props['aria-hidden']).toBeUndefined();
    const title = childrenOf(svg).find((child) => child.type === 'title');
    expect(title?.props).toMatchObject({ id: 'close-title', children: 'Close' });
  });
});

// The set: every icon a component of its own, named as Heroicons name it, on a 16 × 16 grid
describe('the icons of the set', () => {
  const set = Object.entries(icons).filter(([name]) => /^[A-Z]\w*Icon$/.test(name));

  it('has icons, each one drawn and named after itself', () => {
    expect(set.length).toBeGreaterThanOrEqual(4);
    for (const [name, Icon] of set) {
      const svg = (Icon as (props: object) => ReactElement)({}) as unknown as Node;
      expect(svg.props.viewBox, name).toBe('0 0 16 16');
      expect(childrenOf(svg).length, name).toBeGreaterThan(0);
      expect((Icon as { displayName?: string }).displayName).toBe(name);
    }
  });
});
