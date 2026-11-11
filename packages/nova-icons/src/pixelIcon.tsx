import type { ReactElement, ReactNode, Ref, SVGProps } from 'react';

/**
 * A motion of a Nova icon, which plays once when the icon appears, through `@tuwaio/nova-icons/motion.css`:
 *
 * - `assemble`: the pixels gather along the diagonals, from the top left, in about 0.4 s. For an empty state or a large
 *   icon.
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

/** One diagonal of the drawing for `assemble`: its pixels of one mark, and its step (the sum of x and y). */
type Step = { step: number; d: string; lit: boolean };

/** The pixels of a grid split by diagonal, the plain ones and the lit ones apart. */
function stepsOf(art: readonly string[]): Step[] {
  const steps = new Map<string, Step>();
  art.forEach((row, y) =>
    [...row].forEach((mark, x) => {
      if (mark === '.') return;
      const lit = mark === 'o';
      const key = `${x + y}${lit ? 'o' : '#'}`;
      const step = steps.get(key) ?? { step: x + y, d: '', lit };
      step.d += `M${x} ${y}h1v1h-1z`;
      steps.set(key, step);
    }),
  );
  return [...steps.values()].sort((a, b) => a.step - b.step);
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
  let steps: Step[] | undefined;

  const drawing = (motion: NovaIconMotion | undefined): ReactNode => {
    if (motion === 'assemble') {
      steps ??= stepsOf(art);
      return steps.map(({ step, d, lit: isLit }) => (
        <path key={`${step}${isLit ? 'o' : '#'}`} d={d} fill={isLit ? LIT_FILL : undefined} data-step={String(step)} />
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
