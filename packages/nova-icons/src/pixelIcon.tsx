import type { ReactElement, Ref, SVGProps } from 'react';

/**
 * The props of a Nova icon: those of an SVG element, as for the icons of Heroicons, so one replaces the other.
 *
 * - `title`: what the icon means, for an icon that is the only content of a control; without it the icon is hidden
 *   from screen readers (`aria-hidden`).
 * - `titleId`: the `id` of that title, which `aria-labelledby` names.
 * - `ref`: the SVG element.
 */
export type NovaIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
  ref?: Ref<SVGSVGElement>;
};

/** A Nova icon: a React component that draws one icon. */
export type NovaIcon = ((props: NovaIconProps) => ReactElement) & { displayName: string };

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

/**
 * Makes an icon of a pixel grid in the TUWA retro style: an SVG with the grid as its view box and crisp edges, the
 * pixels in the color of the text (`currentColor`) and the lit ones in `--tuwa-icon-accent` (the color of the text when
 * the theme sets none). It is `1em` square unless its class sets a size, and hidden from screen readers unless it has a
 * `title`.
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

  const Icon = ({ title, titleId, ...props }: NovaIconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${art.length}`}
      width="1em"
      height="1em"
      fill="currentColor"
      shapeRendering="crispEdges"
      focusable="false"
      data-slot="icon"
      {...(title ? { role: 'img', 'aria-labelledby': titleId } : { 'aria-hidden': true })}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {base ? <path d={base} /> : null}
      {lit ? <path d={lit} fill="var(--tuwa-icon-accent, currentColor)" /> : null}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}
