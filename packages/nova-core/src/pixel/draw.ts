/**
 * @file The pixels of a drawing of `art.ts`: as one path, or one by one in the order a hand would draw them.
 */

import type { PixelArt } from './art';

/** A pixel of a drawing. */
export type Cell = { x: number; y: number };

/** The view box and the edges of every pixel drawing: a 16 x 16 grid, each pixel a crisp square. */
export const PIXEL_SVG = { viewBox: '0 0 16 16', shapeRendering: 'crispEdges' } as const;

/**
 * The pixels of a drawing.
 *
 * @param art - The drawing.
 * @returns Its pixels, row by row.
 */
export const cellsOf = (art: PixelArt): Cell[] =>
  art.flatMap((row, y) => [...row].flatMap((mark, x) => (mark === '.' ? [] : [{ x, y }])));

/**
 * The drawing as SVG path data: each run of pixels in a row is one rectangle.
 *
 * @param art - The drawing.
 * @returns The path data.
 */
export const pathOf = (art: PixelArt): string =>
  art
    .flatMap((row, y) =>
      [...row.matchAll(/[^.]+/g)].map(({ 0: run, index }) => `M${index} ${y}h${run.length}v1h-${run.length}z`),
    )
    .join('');

/**
 * The pixels of a mark in the order its strokes are drawn: a check mark from left to right, a cross from the top left to the
 * bottom right, then from the top right to the bottom left.
 *
 * @param art - The drawing of the mark.
 * @param mark - `check` or `cross`.
 * @returns The pixels, first drawn first.
 */
export function strokeOrder(art: PixelArt, mark: 'check' | 'cross'): Cell[] {
  const cells = cellsOf(art);
  if (mark === 'check') return cells.sort((a, b) => a.x - b.x || a.y - b.y);
  const onFirst = ({ x, y }: Cell) => Math.abs(x - y) <= Math.abs(x + y - 15);
  return [
    ...cells.filter(onFirst).sort((a, b) => a.x - b.x || a.y - b.y),
    ...cells.filter((cell) => !onFirst(cell)).sort((a, b) => b.x - a.x || a.y - b.y),
  ];
}
