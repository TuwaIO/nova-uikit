import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import { createPixelIcon, LIT_FILL, pixelFlight, pixelPath } from './pixelIcon';

type Node = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

/** The children of an element as a list of elements. */
const childrenOf = (node: Node): Node[] =>
  ([] as unknown[])
    .concat(node.props.children ?? [])
    .flat()
    .filter((child): child is Node => isValidElement(child));

/** The pixels a path draws, as "x,y" keys: the path is made of `M x y h w v 1 h -w z` runs. */
const pixelsOf = (d: unknown): string[] =>
  [...String(d).matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)].flatMap(([, x, y, w]) =>
    Array.from({ length: Number(w) }, (_, i) => `${Number(x) + i},${y}`),
  );

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
    expect(lit.props).toMatchObject({ d: 'M1 1h1v1h-1z', fill: LIT_FILL });
  });

  // The lit pixels stay, and they must read in the light and the dark theme. The color of the
  // text is light in a dark theme and dark in a light one, so a mix of the TUWA orange with it is darker on a light page
  // and lighter on a dark one; a theme that sets an accent (Nova, Quasar) gives its own for each theme
  it('lights its lit pixels in the accent of the theme, and without one in the TUWA orange mixed with the text color', () => {
    expect(LIT_FILL).toBe(
      'var(--tuwa-icon-accent, var(--tuwa-text-accent, color-mix(in oklab, #f05a14 80%, currentColor)))',
    );
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

// Both motions, once each and in plain CSS. The component only marks what moves; `motion.css`
// of the package animates it
describe('the motions of an icon', () => {
  const Icon = createPixelIcon('TestIcon', ['##.', '.o#', '#..']);

  // Not lit up in place: each pixel flies in to its place from a spot nearby, as the pixels of the theme switch travel
  it('assembles from its pixels: one element per pixel, each flying in from its own spot', () => {
    const svg = Icon({ motion: 'assemble' }) as unknown as Node;
    expect(svg.props['data-motion']).toBe('assemble');
    const pixels = childrenOf(svg).filter((child) => child.type === 'rect');
    const at = (p: Node) => `${p.props.x},${p.props.y}`;
    const still = childrenOf(Icon({}) as unknown as Node);
    const drawn = (lit: boolean) =>
      still
        .filter((p) => (p.props.fill === LIT_FILL) === lit)
        .flatMap((p) => pixelsOf(p.props.d))
        .sort();
    expect(
      pixels
        .filter((p) => p.props.fill !== LIT_FILL)
        .map(at)
        .sort(),
    ).toEqual(drawn(false));
    expect(
      pixels
        .filter((p) => p.props.fill === LIT_FILL)
        .map(at)
        .sort(),
    ).toEqual(drawn(true));
    for (const pixel of pixels) {
      expect(pixel.props['data-px']).toBe('');
      expect(pixel.props.style).toEqual(pixelFlight(Number(pixel.props.x), Number(pixel.props.y)));
    }
  });

  it('sends each pixel from a spot of its own, nearby, the same on every render', () => {
    const spots = new Set<string>();
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const flight = pixelFlight(x, y) as Record<string, string>;
        const dx = parseFloat(flight['--nova-px-x']);
        const dy = parseFloat(flight['--nova-px-y']);
        const distance = Math.hypot(dx, dy);
        expect(distance).toBeGreaterThanOrEqual(2.9);
        expect(distance).toBeLessThanOrEqual(7.1);
        expect(parseFloat(flight['--nova-px-delay'])).toBeLessThanOrEqual(240);
        expect(pixelFlight(x, y)).toEqual(flight);
        spots.add(`${flight['--nova-px-x']} ${flight['--nova-px-y']}`);
      }
    }
    // Scattered round the picture, not all from one side
    expect(spots.size).toBeGreaterThan(200);
    const far = pixelFlight(3, 5, { spread: 4, stagger: 600 }) as Record<string, string>;
    const near = pixelFlight(3, 5) as Record<string, string>;
    expect(parseFloat(far['--nova-px-x'])).toBeCloseTo(parseFloat(near['--nova-px-x']) * 4, 1);
  });

  it('breathes with its lit pixels, or with the whole drawing when it has none', () => {
    const lit = childrenOf(Icon({ motion: 'breathe' }) as unknown as Node).filter((child) => child.type === 'path');
    expect(lit.find((p) => p.props['data-breathe'] !== undefined)?.props.fill).toBe(LIT_FILL);
    const Plain = createPixelIcon('PlainIcon', ['#.', '.#']);
    const plain = childrenOf(Plain({ motion: 'breathe' }) as unknown as Node).filter((child) => child.type === 'path');
    expect(plain).toHaveLength(1);
    expect(plain[0].props['data-breathe']).toBe('');
  });

  it('does not pass the motion to the SVG element as an attribute of its own', () => {
    const svg = Icon({ motion: 'breathe' }) as unknown as Node;
    expect(svg.props.motion).toBeUndefined();
    expect(svg.props['data-motion']).toBe('breathe');
    expect((Icon({}) as unknown as Node).props['data-motion']).toBeUndefined();
  });
});
