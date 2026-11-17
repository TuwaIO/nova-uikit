import { pixelFlight as flightOfNovaIcons } from '@tuwaio/nova-icons';

import type { Cell } from './draw';

export type { Cell };

/** A point of the box of a mark, in pixels of the screen from its top left corner. */
export type Point = { x: number; y: number };

/** A shape of a pixel drawing, as its SVG has it: a rectangle of whole pixels, or a path. */
export type PixelShape = { x: number; y: number; width: number; height: number } | { d: string };

/**
 * Where a pixel of a picture that assembles itself comes from, and when: `pixelFlight` of `@tuwaio/nova-icons`, the one
 * motion of every pixel drawing of Nova (the icons, the marks of a result, the pictures of the connect modal). Give each
 * pixel `data-px` and this `style`, and its parent `data-motion="assemble"`: the pixel flies in to its place from a spot
 * 3 to 7 cells away (times `spread`), after a delay of up to `stagger` ms, once, with a little overshoot. The same pixel
 * gets the same spot on every render.
 *
 * @param x - The column of the pixel on its grid.
 * @param y - The row of the pixel on its grid.
 * @param options - How far and over how long the pixels come.
 * @param options.spread - The distance in cells, times this; 1 by default.
 * @param options.stagger - The longest delay of a pixel, in ms; 220 by default.
 * @returns The `style` of the pixel: `--nova-px-x`, `--nova-px-y` and `--nova-px-delay`.
 */
export const pixelFlight: (
  x: number,
  y: number,
  options?: { spread?: number; stagger?: number },
) => ReturnType<typeof flightOfNovaIcons> = flightOfNovaIcons;

/** A run of pixels in a row, as the pixel drawings of Nova write it in a path: `M5 1h6v1h-6z`. */
const RUN = /M(\d+) (\d+)h(\d+)v1h-\3z/g;

/**
 * The pixels a drawing is made of, read from its shapes: rectangles of whole pixels and paths made of runs of pixels,
 * which is how the pixel icons and the pixel loader of Nova are drawn. A drawing of lines and curves (the classic look)
 * has none.
 *
 * @param shapes - The rectangles and the paths of the drawing.
 * @returns Its pixels, each once.
 */
export function cellsOfShapes(shapes: PixelShape[]): Cell[] {
  const cells = new Map<string, Cell>();
  const add = (x: number, y: number) => cells.set(`${x},${y}`, { x, y });
  for (const shape of shapes) {
    if ('d' in shape) {
      // Only a path made of nothing but runs is a pixel drawing
      if (shape.d.replace(RUN, '') !== '') continue;
      for (const [, x, y, length] of shape.d.matchAll(RUN)) {
        for (let step = 0; step < Number(length); step++) add(Number(x) + step, Number(y));
      }
      continue;
    }
    const whole = [shape.x, shape.y, shape.width, shape.height].every(Number.isInteger);
    if (!whole) continue;
    for (let dy = 0; dy < shape.height; dy++) for (let dx = 0; dx < shape.width; dx++) add(shape.x + dx, shape.y + dy);
  }
  return [...cells.values()];
}

/**
 * Where each pixel of a new mark flies from: the pixel of the mark before it that lies closest in direction from the
 * center, so the old mark opens out into the new one. The pixels of a smaller mark are shared among those of a larger
 * one.
 *
 * @param targets - The pixels of the new mark, by their centers.
 * @param sources - The pixels of the mark before it, in the same box.
 * @param center - The center of the box.
 * @returns For each target, in the same order, the point it starts from; empty without sources.
 */
export function flightOrigins(targets: Point[], sources: Point[], center: Point): Point[] {
  if (sources.length === 0) return [];
  const turn = Math.PI * 2;
  const angle = ({ x, y }: Point) => Math.atan2(y - center.y, x - center.x);
  // The shorter way round between two directions
  const apart = (a: number, b: number) => {
    const between = Math.abs(a - b) % turn;
    return between > Math.PI ? turn - between : between;
  };
  const round = sources.map((source) => ({ source, at: angle(source) }));
  return targets.map((target) => {
    const at = angle(target);
    return round.reduce((best, next) => (apart(next.at, at) < apart(best.at, at) ? next : best)).source;
  });
}

function gridWidthOf(svg: SVGSVGElement): number {
  return svg.viewBox?.baseVal?.width || Number(svg.getAttribute('viewBox')?.trim().split(/\s+/)[2]) || 0;
}

/**
 * The centers of the pixels an SVG drawing is made of, in pixels of the screen from the corner of `box`.
 *
 * @param svg - The SVG element of the mark.
 * @param box - The bounding box of the mark container.
 * @returns The screen coordinates of each pixel center relative to `box`.
 */
export function pixelsOf(svg: SVGSVGElement, box: DOMRect): Point[] {
  const gridWidth = gridWidthOf(svg);
  const frame = svg.getBoundingClientRect();
  if (gridWidth === 0 || frame.width === 0) return [];
  const number = (element: Element, name: string) => Number(element.getAttribute(name) ?? 0);
  // Not the shapes a drawing only clips with
  const drawn = (element: Element) => !element.closest('defs, clipPath, mask');
  const shapes: PixelShape[] = [
    ...[...svg.querySelectorAll('rect')].filter(drawn).map((rect) => ({
      x: number(rect, 'x'),
      y: number(rect, 'y'),
      width: number(rect, 'width'),
      height: number(rect, 'height'),
    })),
    ...[...svg.querySelectorAll('path')].filter(drawn).map((path) => ({ d: path.getAttribute('d') ?? '' })),
  ];
  const scale = frame.width / gridWidth;
  return cellsOfShapes(shapes).map(({ x, y }) => ({
    x: frame.left - box.left + (x + 0.5) * scale,
    y: frame.top - box.top + (y + 0.5) * scale,
  }));
}

/**
 * Makes the pixels of a mark that assembles (`data-px`, the motion of `@tuwaio/nova-icons`) start from the pixels of
 * the mark before it instead of from spots of their own nearby.
 *
 * @param svg - The SVG element of the new mark.
 * @param box - The bounding box of the mark container.
 * @param sources - The pixel centers of the mark before it, from {@link pixelsOf}.
 */
export function flyFrom(svg: SVGSVGElement, box: DOMRect, sources: Point[]): void {
  const squares = [...svg.querySelectorAll<SVGElement>('[data-px]')];
  const gridWidth = gridWidthOf(svg);
  const frame = svg.getBoundingClientRect();
  if (squares.length === 0 || gridWidth === 0 || frame.width === 0) return;
  const scale = frame.width / gridWidth;
  const centers = squares.map((square) => ({
    x: frame.left - box.left + (Number(square.getAttribute('x') ?? 0) + 0.5) * scale,
    y: frame.top - box.top + (Number(square.getAttribute('y') ?? 0) + 0.5) * scale,
  }));
  const origins = flightOrigins(centers, sources, { x: box.width / 2, y: box.height / 2 });
  // A mark before that was not made of pixels: the new one assembles from its own spots nearby
  if (origins.length === 0) return;
  const units = (pixels: number) => `${Math.round((pixels / scale) * 100) / 100}px`;
  squares.forEach((square, index) => {
    // In units of the drawing, as `pixelFlight` gives them
    square.style.setProperty('--nova-px-x', units(origins[index].x - centers[index].x));
    square.style.setProperty('--nova-px-y', units(origins[index].y - centers[index].y));
  });
}
