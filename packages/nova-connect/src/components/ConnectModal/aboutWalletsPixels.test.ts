import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { byDiagonal, type Cell, KEY, NETWORK, NODES, PLATE, WALLET } from './aboutWalletsPixels';

const key = ({ x, y }: Cell) => `${x},${y}`;
const inside = (cells: Cell[], area: Cell[]) => {
  const plate = new Set(area.map(key));
  return cells.every((cell) => plate.has(key(cell)));
};

// The owner, 2026-11-11: the pictures of "About wallets" have a pixel variant, the key on its orbit and the wallet with its
// circuit, as the classic ones
describe('the pixel picture of About wallets', () => {
  it('keeps the network, its nodes and both subjects on the plate', () => {
    for (const line of NETWORK) expect(inside(line, PLATE.disc)).toBe(true);
    expect(
      inside(
        NODES.flatMap(({ x, y }) => [
          { x, y },
          { x: x + 1, y: y + 1 },
        ]),
        PLATE.disc,
      ),
    ).toBe(true);
    for (const subject of [KEY, WALLET]) {
      expect(inside([...subject.ink, ...subject.lit, ...subject.paths.flat()], PLATE.disc)).toBe(true);
    }
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

  it('gathers each subject one diagonal at a time, every pixel once', () => {
    for (const subject of [KEY, WALLET]) {
      const steps = byDiagonal(subject.ink);
      expect(steps.map(({ step }) => step)).toEqual([...steps.map(({ step }) => step)].sort((a, b) => a - b));
      const drawn = steps.flatMap(({ d }) => [...d.matchAll(/M(\d+) (\d+)/g)].map(([, x, y]) => `${x},${y}`));
      expect(new Set(drawn)).toEqual(new Set(subject.ink.map(key)));
    }
  });

  it('holds still with prefers-reduced-motion', () => {
    const css = readFileSync(path.resolve(__dirname, '../../styles/app.css'), 'utf8');
    const still = css.slice(css.indexOf('.novacon-art-px-in,'));
    for (const name of [
      'novacon-art-px-in',
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
