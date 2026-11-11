import type { CSSProperties, ReactElement, ReactNode, Ref, SVGProps } from 'react';

/**
 * A motion of a Nova icon, which plays once when the icon appears, through `@tuwaio/nova-icons/motion.css`:
 *
 * - `assemble`: the icon assembles from its pixels: each one flies in to its place from a spot nearby, with a little
 *   overshoot, in about 0.75 s (see `pixelFlight`). For an empty state or a large icon.
 * - `breathe`: the lit pixels (the whole drawing when the icon has none) dim and come back once, in 1.6 s. For an icon
 *   next to something that waits: a wallet, a transaction.
 *
 * Without the stylesheet, and for a reader who asks for less motion (`prefers-reduced-motion`), the icon stays still.
 */
export type NovaIconMotion = 'assemble' | 'breathe';

/**
 * The props of a Nova icon: those of an SVG element, as for the icons of Heroicons, so one replaces the other.
 *
 * - `title`: what the icon means, for an icon that is the only content of a control; without it the icon is hidden
 *   from screen readers (`aria-hidden`).
 * - `titleId`: the `id` of that title, which `aria-labelledby` names.
 * - `ref`: the SVG element.
 * - `motion`: a motion that plays once when the icon appears (`NovaIconMotion`); none by default.
 */
export type NovaIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
  ref?: Ref<SVGSVGElement>;
  motion?: NovaIconMotion;
};

/** A Nova icon: a React component that draws one icon. */
export type NovaIcon = ((props: NovaIconProps) => ReactElement) & { displayName: string };

/**
 * The color of the lit pixels: `--tuwa-icon-accent`, else the accent of a TUWA theme (`--tuwa-text-accent`, which Nova
 * and Quasar set for the light and the dark theme), else the TUWA blue mixed with the color of the text, which is darker
 * on a light page and lighter on a dark one, so the lit pixels read in both.
 */
export const LIT_FILL =
  'var(--tuwa-icon-accent, var(--tuwa-text-accent, color-mix(in oklab, #0052ff 72%, currentColor)))';

/** The marks of a grid: `#` a pixel in the color of the text, `o` a lit pixel in the accent, `.` none. */
const MARKS = /^[#o.]+$/;

/**
 * The pixels of one mark of a grid as SVG path data: each run of the mark in a row is one rectangle, so the path stays
 * short and its edges meet without seams.
 *
 * @param art - The rows of the grid, top first.
 * @param mark - The mark to draw (`#` or `o`).
 * @returns The path data; empty when the grid has no such pixel.
 */
export function pixelPath(art: readonly string[], mark: string): string {
  return art
    .flatMap((row, y) =>
      [...row.matchAll(new RegExp(`\\${mark}+`, 'g'))].map(
        ({ 0: run, index }) => `M${index} ${y}h${run.length}v1h-${run.length}z`,
      ),
    )
    .join('');
}

/** A number in [0, 1) of a pixel and a salt, the same on every render: the scatter of `pixelFlight` without randomness. */
function noise(x: number, y: number, salt: number): number {
  let hash = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 1, 0x165667b1) ^ Math.imul(salt, 0x9e3779b9);
  hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Where a pixel of a picture that assembles itself comes from, and when: the CSS variables that `motion.css` reads for an
 * element with `data-px` under an element with `data-motion="assemble"` (an icon with `motion="assemble"`, or any pixel
 * drawing of yours). The pixel flies in to its place from a spot 3 to 7 cells away, in a direction of its own, after a
 * delay of its own, so the pixels of a picture gather from all round it. The same pixel gets the same spot on every
 * render: nothing random, and a server render matches the client.
 *
 * @param x - The column of the pixel on its grid.
 * @param y - The row of the pixel on its grid.
 * @param options - How far and over how long the pixels come.
 * @param options.spread - The distance in cells, times this (a grid of 64 might take 3); 1 by default.
 * @param options.stagger - The longest delay of a pixel, in ms; 220 by default.
 * @returns The `style` of the pixel: `--nova-px-x`, `--nova-px-y` (its start, in user units of the SVG) and
 * `--nova-px-delay`.
 */
export function pixelFlight(
  x: number,
  y: number,
  { spread = 1, stagger = 220 }: { spread?: number; stagger?: number } = {},
): CSSProperties {
  const angle = noise(x, y, 1) * Math.PI * 2;
  const distance = (3 + noise(x, y, 2) * 4) * spread;
  return {
    '--nova-px-x': `${round(Math.cos(angle) * distance)}px`,
    '--nova-px-y': `${round(Math.sin(angle) * distance)}px`,
    '--nova-px-delay': `${Math.round(noise(x, y, 3) * stagger)}ms`,
  } as CSSProperties;
}

/** A pixel of the drawing for `assemble`, plain or lit. */
type Cell = { x: number; y: number; lit: boolean };

/** The pixels of a grid, one by one. */
function cellsOf(art: readonly string[]): Cell[] {
  return art.flatMap((row, y) => [...row].flatMap((mark, x) => (mark === '.' ? [] : [{ x, y, lit: mark === 'o' }])));
}

/**
 * Makes an icon of a pixel grid in the TUWA retro style: an SVG with the grid as its view box and crisp edges, the
 * pixels in the color of the text (`currentColor`) and the lit ones in `LIT_FILL`. It is `1em` square unless its class
 * sets a size, hidden from screen readers unless it has a `title`, and still unless it has a `motion`.
 *
 * @param name - The name of the component, as the icon is exported (`XMarkIcon`).
 * @param art - The rows of the grid, top first, all of one length: `#` a pixel, `o` a lit pixel, `.` none.
 * @returns The component.
 * @throws When the rows differ in length or hold another mark.
 */
export function createPixelIcon(name: string, art: readonly string[]): NovaIcon {
  const width = art[0]?.length ?? 0;
  if (!width || art.some((row) => row.length !== width || !MARKS.test(row))) {
    throw new Error(`${name}: every row of the grid must have ${width} marks of "#", "o" or "."`);
  }
  const base = pixelPath(art, '#');
  const lit = pixelPath(art, 'o');
  let cells: Cell[] | undefined;

  const drawing = (motion: NovaIconMotion | undefined): ReactNode => {
    if (motion === 'assemble') {
      cells ??= cellsOf(art);
      return cells.map(({ x, y, lit: isLit }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={isLit ? LIT_FILL : undefined}
          data-px=""
          style={pixelFlight(x, y)}
        />
      ));
    }
    const breathe = motion === 'breathe' ? '' : undefined;
    return [
      base ? <path key="base" d={base} data-breathe={lit ? undefined : breathe} /> : null,
      lit ? <path key="lit" d={lit} fill={LIT_FILL} data-breathe={breathe} /> : null,
    ];
  };

  const Icon = ({ title, titleId, motion, ...props }: NovaIconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${art.length}`}
      width="1em"
      height="1em"
      fill="currentColor"
      shapeRendering="crispEdges"
      focusable="false"
      data-slot="icon"
      data-motion={motion}
      {...(title ? { role: 'img', 'aria-labelledby': titleId } : { 'aria-hidden': true })}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {drawing(motion)}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}
