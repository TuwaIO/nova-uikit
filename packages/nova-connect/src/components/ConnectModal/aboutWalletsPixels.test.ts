import { readFileSync } from 'node:fs';
import path from 'node:path';

import { pixelFlight } from '@tuwaio/nova-core';
import { describe, expect, it } from 'vitest';

import { PixelArt } from './AboutWalletsArt';
import { ART_FLIGHT, type Cell, KEY, NETWORK, NODES, PIXEL_FIRST_START, PLATE, WALLET } from './aboutWalletsPixels';

type Node = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

/** The elements of a tree, depth first. */
const elementsOf = (node: unknown): Node[] => {
  if (Array.isArray(node)) return node.flatMap(elementsOf);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Node;
  return [element, ...elementsOf(element.props.children)];
};

const key = ({ x, y }: Cell) => `${x},${y}`;
const inside = (cells: Cell[], area: Cell[]) => {
  const plate = new Set(area.map(key));
  return cells.every((cell) => plate.has(key(cell)));
};

// The pictures of "About wallets" have a pixel variant, the key on its orbit and the wallet with its
// circuit, as the classic ones
describe('the pixel picture of About wallets', () => {
  it('keeps the network, its nodes and both subjects on the plate', () => {
    for (const line of NETWORK) expect(inside(line, PLATE.face)).toBe(true);
    expect(
      inside(
        NODES.flatMap(({ x, y }) => [
          { x, y },
          { x: x + 1, y: y + 1 },
        ]),
        PLATE.face,
      ),
    ).toBe(true);
    for (const subject of [KEY, WALLET]) {
      expect(inside([...subject.ink, ...subject.lit, ...subject.paths.flat()], PLATE.face)).toBe(true);
    }
  });

  // The pixel plate is there at once, so the subject does not wait for it: a wait of half a second read as a delay
  it('starts to assemble at once when About wallets opens', () => {
    expect(PIXEL_FIRST_START).toBeLessThanOrEqual(0.15);
  });

  // Square, as every frame of paper and ink: the whole grid, its rim the edge of it
  it('stands on a square plate', () => {
    const size = Math.max(...PLATE.face.map(({ x }) => x)) + 1;
    expect(PLATE.face).toHaveLength(size * size);
    const edge = PLATE.face.filter(({ x, y }) => x === 0 || y === 0 || x === size - 1 || y === size - 1);
    expect(new Set(PLATE.rim.map(key))).toEqual(new Set(edge.map(key)));
  });

  it('puts the core of the key in its ring and the core of the wallet in its clasp, clear of their lines', () => {
    const ink = (cells: Cell[]) => new Set(cells.map(key));
    for (const subject of [KEY, WALLET]) {
      const lines = ink(subject.ink);
      // The core is 4 pixels across around its point
      for (let dx = -2; dx < 2; dx++)
        for (let dy = -2; dy < 2; dy++) {
          expect(lines.has(key({ x: subject.core.x + dx, y: subject.core.y + dy }))).toBe(false);
        }
    }
  });

  // As the dots at the ends of the lines of the classic picture: the tips of the teeth, the nodes of the circuit
  it('lights the ends of its lines, never a pixel apart from them', () => {
    for (const subject of [KEY, WALLET]) {
      const lines = [...subject.ink, ...subject.paths.flat()];
      for (const cell of subject.lit) {
        // A lit node is three pixels square: its far pixels are three from the line it ends
        const near = (other: Cell) => Math.abs(other.x - cell.x) <= 3 && Math.abs(other.y - cell.y) <= 3;
        expect(lines.some(near), key(cell)).toBe(true);
      }
    }
  });

  // Not lit up in place: the subject assembles from its pixels, each flying in from a spot nearby, as every pixel
  // drawing of Nova does (`pixelFlight`)
  it('assembles each subject from its pixels, every pixel once', () => {
    for (const [slideId, subject] of [
      [1, KEY],
      [2, WALLET],
    ] as const) {
      const svg = PixelArt({ slideId, label: 'picture', start: 0.55 }) as unknown as Node;
      expect((svg.props.style as Record<string, string>)['--nova-px-start']).toBe('0.55s');
      const group = elementsOf(svg).find((node) => node.props['data-motion'] === 'assemble')!;
      const pixels = elementsOf(group).filter((node) => node.props['data-px'] === '');
      // Each pixel once in its layer (the lines of a subject cross), and every pixel of the subject there
      const once = (cells: Cell[]) => new Set(cells.map(key)).size;
      const expected = once(subject.ink) + once(subject.lit) + once(subject.paths.flat());
      expect(pixels).toHaveLength(expected);
      expect(new Set(pixels.map((node) => `${node.props.x},${node.props.y},${String(node.props.fill)}`)).size).toBe(
        expected,
      );
      for (const node of pixels) {
        expect(node.props.style).toEqual(pixelFlight(Number(node.props.x), Number(node.props.y), ART_FLIGHT));
      }
    }
  });

  // The motion of the pixel picture was not smooth. It stepped: the subject jumped a whole pixel of the
  // picture (several on screen), the nodes and the glow flicked between levels, the light hopped from pixel to pixel and the
  // core moved in nine jerks. The pixels stay crisp; how they move, fade and glow is smooth
  it('moves, fades and glows smoothly, never in steps', () => {
    const css = readFileSync(path.resolve(__dirname, '../../styles/app.css'), 'utf8');
    const rules = [...css.matchAll(/\.novacon-art-px-[\w-]+\s*\{[^}]*\}/g)].map(([rule]) => rule);
    expect(rules.length).toBeGreaterThan(5);
    for (const rule of rules) {
      for (const [declaration] of rule.matchAll(/(animation|transition)[\w-]*:[^;]*;/g)) {
        expect(declaration, rule.split('{')[0]).not.toMatch(/step-end|step-start|steps\(/);
      }
    }
  });

  it('holds still with prefers-reduced-motion', () => {
    const css = readFileSync(path.resolve(__dirname, '../../styles/app.css'), 'utf8');
    const still = css.slice(css.indexOf('.novacon-art-px-flow,'));
    for (const name of [
      'novacon-art-px-flow',
      'novacon-art-px-twinkle',
      'novacon-art-px-float',
      'novacon-art-px-core',
    ]) {
      expect(still).toContain(`.${name}`);
    }
    expect(still).toMatch(/animation: none;\s*transition: none;/);
  });
});
