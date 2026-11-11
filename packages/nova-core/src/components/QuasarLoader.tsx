/**
 * @file The Quasar mark as a loader: a dash orbits the tilted disk, behind the core on the far side and in front of it on
 * the near side, the core breathes, and a beam runs out along each jet and lights its node. Two looks: the pixel one, on a
 * grid, and the classic one, in thin lines.
 */

import { type CSSProperties, useId } from 'react';

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';
import { cn } from '../utils';

/** Props of {@link QuasarLoader}. */
export type QuasarLoaderProps = {
  /** Width and height in pixels. Defaults to `40`. */
  size?: number;
  /**
   * `full` is the whole mark, for 40–72 px. `compact` is a rounder disk and the core, bolder, for 12–24 px: buttons and
   * lines of text. Defaults to `compact` below 28 px and to `full` from there.
   */
  variant?: 'full' | 'compact';
  /** CSS color of the moving parts and the core, such as `var(--tuwa-pending-icon)`. Defaults to `--tuwa-text-accent`. */
  accent?: string;
  /**
   * What is being waited for, for screen readers: with it the loader is a `role="status"` region with that text; without it, it
   * is decorative. A region announces what changes after it is on the page, so one that mounts with the loader is found by
   * browsing, not announced.
   */
  label?: string;
  /** Classes of the loader. The still parts take the text color. */
  className?: string;
  /** `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel without one). */
  look?: NovaLook;
};

/** Below this size the jets and the thin disk of the whole mark can no longer be told apart. */
const COMPACT_BELOW = 28;

/**
 * The loader of the TUWA ecosystem, for actions and for the wait of a whole screen (skeletons stay for content that is
 * loading). It is an SVG animated by the `dist/index.css` of this package, runs on no JavaScript timer and holds still
 * with `prefers-reduced-motion`.
 *
 * @param props - See {@link QuasarLoaderProps}.
 * @returns The loader.
 */
export function QuasarLoader({ size = 40, variant, accent, label, className, look }: QuasarLoaderProps) {
  // The two half planes are per instance: a clip path found by id in another loader that has been unmounted is lost
  const id = useId().replace(/[^\w-]/g, '');
  const setLook = useNovaIcons().look;
  const isCompact = (variant ?? (size < COMPACT_BELOW ? 'compact' : 'full')) === 'compact';
  if ((look ?? setLook) === 'pixel') {
    // A plain function, no hooks: it draws in place of the classic mark
    return pixelQuasarLoader({ size, isCompact, accent, label, className });
  }
  const rx = isCompact ? 15 : 16;
  const ry = isCompact ? 8.5 : 4.4;
  const style = { width: size, height: size, ...(accent && { '--tuwa-loader-accent': accent }) } as CSSProperties;

  return (
    <span
      className={cn('tuwa-quasar-loader', isCompact && 'tuwa-quasar-loader--compact', className)}
      style={style}
      {...(label ? { role: 'status' } : { 'aria-hidden': true })}
    >
      {label && <span className="novacore:sr-only">{label}</span>}
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-far`}>
            <rect x={-10} y={-10} width={60} height={30} />
          </clipPath>
          <clipPath id={`${id}-near`}>
            <rect x={-10} y={20} width={60} height={30} />
          </clipPath>
        </defs>
        <g transform="rotate(-22 20 20)">
          {/* The far half of the disk, behind the core */}
          <path className="tuwa-ql-track" d={`M${20 - rx} 20a${rx} ${ry} 0 0 1 ${rx * 2} 0`} />
          <ellipse
            className="tuwa-ql-dash tuwa-ql-dash--far"
            cx={20}
            cy={20}
            rx={rx}
            ry={ry}
            pathLength={100}
            clipPath={`url(#${id}-far)`}
          />
          {!isCompact && (
            <>
              <path className="tuwa-ql-jet" d="M18.5 18 19.55 5.2h.9L21.5 18z" />
              <path className="tuwa-ql-jet" d="M18.5 22 19.55 34.8h.9L21.5 22z" />
              <path className="tuwa-ql-beam" d="M20 16.5V4.6" pathLength={100} />
              <path className="tuwa-ql-beam" d="M20 23.5v11.9" pathLength={100} />
              <circle className="tuwa-ql-node" cx={20} cy={3.6} r={1.9} />
              <circle className="tuwa-ql-node" cx={20} cy={36.4} r={1.9} />
              <circle className="tuwa-ql-glow" cx={20} cy={20} r={7.2} />
            </>
          )}
          <circle className="tuwa-ql-core" cx={20} cy={20} r={isCompact ? 4.6 : 3.8} />
          {!isCompact && <circle className="tuwa-ql-spark" cx={20} cy={20} r={1.2} />}
          {/* The near half, in front of it */}
          <path className="tuwa-ql-track" d={`M${20 + rx} 20a${rx} ${ry} 0 0 1 ${-rx * 2} 0`} />
          <ellipse
            className="tuwa-ql-dash tuwa-ql-dash--near"
            cx={20}
            cy={20}
            rx={rx}
            ry={ry}
            pathLength={100}
            clipPath={`url(#${id}-near)`}
          />
        </g>
      </svg>
    </span>
  );
}

/** A pixel of the grid of the pixel loader. */
type Cell = { x: number; y: number };

/**
 * The pixels of the pixel loader on a grid of `n`: the orbit in order round the tilted disk (each with its side), the core
 * and the ring of its glow, and, for the whole mark, the pixels of each jet from the core out with the node at its end.
 */
function pixelMark(n: number, { rx, ry, core, jet }: { rx: number; ry: number; core: number; jet?: number }) {
  const c = n / 2;
  const tilt = (-22 * Math.PI) / 180;
  const [cos, sin] = [Math.cos(tilt), Math.sin(tilt)];
  const orbit: (Cell & { near: boolean })[] = [];
  for (let step = 0; step < 1440; step++) {
    const angle = (step / 1440) * Math.PI * 2;
    const x = Math.floor(c + rx * Math.cos(angle) * cos - ry * Math.sin(angle) * sin);
    const y = Math.floor(c + rx * Math.cos(angle) * sin + ry * Math.sin(angle) * cos);
    if (!orbit.some((cell) => cell.x === x && cell.y === y)) orbit.push({ x, y, near: Math.sin(angle) > 0 });
  }
  const cells: Cell[] = Array.from({ length: n * n }, (_, i) => ({ x: i % n, y: Math.floor(i / n) }));
  const distance = ({ x, y }: Cell) => Math.hypot(x + 0.5 - c, y + 0.5 - c);
  const coreCells = cells.filter((cell) => distance(cell) <= core / 2 + 0.05);
  const glow = cells.filter((cell) => distance(cell) > core / 2 + 0.05 && distance(cell) <= core / 2 + 1.3);
  // The jets lie on the axis of the disk: up and to the left, and down and to the right
  const jets = jet
    ? [1, -1].map((side) => {
        const beam: Cell[] = [];
        for (let d = core / 2 + 1.2; d <= jet; d += 0.25) {
          const cell = { x: Math.floor(c + side * sin * d), y: Math.floor(c - side * cos * d) };
          if (!beam.some(({ x, y }) => x === cell.x && y === cell.y)) beam.push(cell);
        }
        const end = beam[beam.length - 1];
        return { beam: beam.slice(0, -1), node: end };
      })
    : [];
  return { n, orbit, core: coreCells, glow, jets };
}

const FULL = pixelMark(20, { rx: 8.6, ry: 2.6, core: 4, jet: 9.4 });
const COMPACT = pixelMark(12, { rx: 5.4, ry: 2.9, core: 4 });

/** Path data of one-pixel squares. */
const cellsPath = (cells: Cell[]) => cells.map(({ x, y }) => `M${x} ${y}h1v1h-1z`).join('');

/** The pixel loader: the mark on a grid, its light stepping round the orbit and out along the jets. */
function pixelQuasarLoader({
  size,
  isCompact,
  accent,
  label,
  className,
}: {
  size: number;
  isCompact: boolean;
  accent?: string;
  label?: string;
  className?: string;
}) {
  const mark = isCompact ? COMPACT : FULL;
  const style = { width: size, height: size, ...(accent && { '--tuwa-loader-accent': accent }) } as CSSProperties;
  const count = mark.orbit.length;
  // Where the light rests when the reader asks for less motion: the front of the near side
  const parked = new Set(
    mark.orbit
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell.near)
      .slice(Math.floor(count / 4) - 2, Math.floor(count / 4) + 2)
      .map(({ index }) => index),
  );
  const orbit = (near: boolean) =>
    mark.orbit.map((cell, index) =>
      cell.near === near ? (
        <rect
          key={index}
          className={cn(
            'tuwa-qlp-orbit',
            near ? 'tuwa-qlp-orbit--near' : 'tuwa-qlp-orbit--far',
            parked.has(index) && 'tuwa-qlp-park',
          )}
          x={cell.x}
          y={cell.y}
          width={1}
          height={1}
          style={{ '--i': index, '--n': count } as CSSProperties}
        />
      ) : null,
    );

  return (
    <span
      className={cn(
        'tuwa-quasar-loader tuwa-quasar-loader--pixel',
        isCompact && 'tuwa-quasar-loader--compact',
        className,
      )}
      style={style}
      {...(label ? { role: 'status' } : { 'aria-hidden': true })}
    >
      {label && <span className="novacore:sr-only">{label}</span>}
      <svg viewBox={`0 0 ${mark.n} ${mark.n}`} shapeRendering="crispEdges" aria-hidden="true">
        {orbit(false)}
        {mark.jets.map(({ beam, node }, side) => (
          <g key={side}>
            {beam.map((cell, index) => (
              <rect
                key={index}
                className="tuwa-qlp-beam"
                x={cell.x}
                y={cell.y}
                width={1}
                height={1}
                style={{ '--j': index, '--len': beam.length } as CSSProperties}
              />
            ))}
            {/* Two pixels square, from the end of the jet outward: up and to the left for the first, down and right for the other */}
            <rect
              className="tuwa-qlp-node"
              x={node.x - (side ? 0 : 1)}
              y={node.y - (side ? 0 : 1)}
              width={2}
              height={2}
            />
          </g>
        ))}
        <path className="tuwa-qlp-glow" d={cellsPath(mark.glow)} />
        <path className="tuwa-qlp-core" d={cellsPath(mark.core)} />
        {orbit(true)}
      </svg>
    </span>
  );
}
