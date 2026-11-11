/**
 * @file The picture of the "About wallets" slides, drawn in the manner of the TUWA mark: thin lines in the text color, a bright
 * core in the accent color and node dots at the ends. One SVG for all the slides: on a change of slide the lines of one subject
 * are drawn away while those of the next are drawn in, and the core travels from one to the other. Inline, so it follows the
 * theme and weighs a few KB. The pixel look draws the same picture on a grid of 64: the subject gathers pixel by pixel and
 * the lights step along the lines.
 */

import { useNovaIcons, useNovaSounds } from '@tuwaio/nova-core';
import { motion, useReducedMotion } from 'framer-motion';
import { type CSSProperties, useEffect, useState } from 'react';

import {
  byDiagonal,
  type Cell,
  KEY,
  NETWORK as PIXEL_NETWORK,
  NODES as PIXEL_NODES,
  pathOf,
  PLATE,
  WALLET,
} from './aboutWalletsPixels';

const ACCENT = 'var(--tuwa-text-accent)';
const EASE = [0.4, 0, 0.2, 1] as const;

/** The slides with a subject in the picture. */
export const ART_SLIDES = [1, 2] as const;

/** Whether a slide has its subject in the picture. */
export const hasArt = (slideId: number) => (ART_SLIDES as readonly number[]).includes(slideId);

/** Where the core stands for each subject, and how large it is. In the coordinates of the picture, after the rotations below. */
const CORE: Record<number, { x: number; y: number; scale: number }> = {
  1: { x: 82.66, y: 113.54, scale: 1 },
  2: { x: 130.24, y: 98.73, scale: 0.76 },
};

const NETWORK = ['M24 76 54 40h44', 'M146 34l26 34', 'M178 118l-30 42h-46', 'M26 126l28 36'];

const NODES = [
  [24, 76],
  [98, 40],
  [146, 34],
  [172, 68],
  [178, 118],
  [102, 160],
  [26, 126],
  [54, 162],
];

/**
 * The motion of a stroke that is drawn in and away.
 *
 * @internal
 * @param isOn - Whether the stroke is shown.
 * @param delay - When it starts to be drawn, in seconds.
 * @param reduceMotion - Whether the viewer asked for less motion: then it is simply shown or not.
 * @returns The props of the stroke.
 */
export function strokeMotion(isOn: boolean, delay: number, reduceMotion: boolean) {
  const shown = { pathLength: isOn ? 1 : 0, opacity: isOn ? 1 : 0 };
  if (reduceMotion) return { initial: false as const, animate: shown, transition: { duration: 0 } };
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: shown,
    transition: {
      // A stroke goes faster than one comes, so that the two read as one line turning into the other
      pathLength: isOn ? { duration: 0.75, delay, ease: EASE } : { duration: 0.4, ease: EASE },
      // After it is gone or before it starts: a round cap draws a dot at length zero
      opacity: isOn ? { duration: 0.01, delay } : { duration: 0.01, delay: 0.4 },
    },
  };
}

/** A dot that comes up where a line ends. */
const Dot = ({
  cx,
  cy,
  isOn,
  delay,
  reduce,
}: {
  cx: number;
  cy: number;
  isOn: boolean;
  delay: number;
  reduce: boolean;
}) => (
  <motion.circle
    cx={cx}
    cy={cy}
    r={3.5}
    fill={ACCENT}
    initial={reduce ? false : { scale: 0 }}
    animate={{ scale: isOn ? 1 : 0 }}
    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 18, delay: isOn ? delay : 0 }}
  />
);

/** A light that runs along a line, slowly, once it has been drawn. */
const Flow = ({ d, seconds, delay, opacity = 1 }: { d: string; seconds: number; delay: number; opacity?: number }) => (
  <path
    d={d}
    className="novacon-art-flow"
    pathLength={100}
    stroke={ACCENT}
    strokeWidth={2.5}
    strokeLinecap="round"
    fill="none"
    style={{ '--art-seconds': `${seconds}s`, '--art-delay': `${delay}s`, '--art-opacity': opacity } as CSSProperties}
  />
);

/** Props of {@link AboutWalletsArt}. */
export type AboutWalletsArtProps = {
  /** The ID of the slide whose subject is shown: a key on slide `1`, a wallet on slide `2`. */
  slideId: number;
  /** What it shows, for screen readers. */
  label: string;
};

/**
 * The picture of the built-in slides. When it appears it draws itself, the plate, then the network, then the subject, with the
 * core coming up last; on a change of slide one subject is drawn into the next and the core travels; after that it moves slowly
 * and gently: the core breathes, the lights run along the lines and the nodes twinkle. With `prefers-reduced-motion` it is simply
 * shown.
 *
 * Side effects: none. The slow motion is CSS animation from `dist/index.css` of this package.
 *
 * @internal
 * @param props - See {@link AboutWalletsArtProps}.
 * @returns The picture.
 */
export function AboutWalletsArt({ slideId, label }: AboutWalletsArtProps) {
  const reduce = useReducedMotion() ?? false;
  const [lastSlideId, setLastSlideId] = useState(slideId);
  const [hasChanged, setHasChanged] = useState(false);
  if (slideId !== lastSlideId) {
    setLastSlideId(slideId);
    setHasChanged(true);
  }

  // With each picture that draws itself. With less motion it is simply there, and nothing is drawn to hear
  const play = useNovaSounds();
  useEffect(() => {
    if (!reduce) play('aboutWallets');
  }, [slideId, reduce, play]);

  // On the first drawing the subject waits for the plate and the network, and on a change it follows what is being drawn away
  const start = hasChanged ? 0.15 : 0.55;
  const { look } = useNovaIcons();
  if (look === 'pixel') return <PixelArt slideId={slideId} label={label} start={start} />;
  const isKey = slideId === 1;
  const isWallet = slideId === 2;
  const core = CORE[slideId] ?? CORE[1];
  const stroke = (isOn: boolean, step: number) => strokeMotion(isOn, start + step * 0.14, reduce);

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label={label}
      className="novacon-art novacon:block novacon:h-full novacon:w-full novacon:overflow-visible novacon:text-[var(--tuwa-text-primary)]"
    >
      {/* The plate */}
      <motion.circle
        cx={100}
        cy={100}
        r={99}
        fill="var(--tuwa-bg-secondary)"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.6 }}
      />
      <motion.path
        d="M100 1a99 99 0 1 1 0 198a99 99 0 1 1 0-198"
        stroke="var(--tuwa-border-primary)"
        {...(reduce
          ? { initial: false as const, animate: { pathLength: 1, opacity: 1 } }
          : {
              initial: { pathLength: 0, opacity: 0 },
              animate: { pathLength: 1, opacity: 1 },
              transition: { pathLength: { duration: 0.9, ease: EASE }, opacity: { duration: 0.01 } },
            })}
      />

      {/* The network behind the subject */}
      <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        {NETWORK.map((d, index) => (
          <motion.path key={d} d={d} {...strokeMotion(true, reduce ? 0 : 0.2 + index * 0.1, reduce)} />
        ))}
      </g>
      {NETWORK.map((d, index) => (
        <Flow key={d} d={d} seconds={11 + index * 2} delay={2 + index * 1.7} opacity={0.45} />
      ))}
      {NODES.map(([cx, cy], index) => (
        <motion.circle
          key={`${cx}-${cy}`}
          className="novacon-art-twinkle"
          style={{ '--art-delay': `${index * 0.7}s` } as CSSProperties}
          cx={cx}
          cy={cy}
          r={3}
          fill="currentColor"
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={
            reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 18, delay: 0.3 + index * 0.05 }
          }
        />
      ))}

      {/* The subject floats a little, slowly, with the core */}
      <g className="novacon-art-float">
        <g transform="rotate(-38 100 100)" strokeLinecap="round" strokeLinejoin="round">
          <g transform="rotate(-22 78 100)">
            <motion.path
              d="M38 100a40 11 0 1 1 80 0a40 11 0 1 1-80 0"
              stroke={ACCENT}
              strokeOpacity={0.4}
              strokeWidth={2}
              {...stroke(isKey, 3)}
            />
            {isKey && <Flow d="M38 100a40 11 0 1 1 80 0a40 11 0 1 1-80 0" seconds={9} delay={2} />}
          </g>
          <motion.path
            d="M78 74a26 26 0 1 1 0 52a26 26 0 1 1 0-52"
            stroke="currentColor"
            strokeWidth={4}
            {...stroke(isKey, 0)}
          />
          <motion.path d="M104 100h66" stroke="currentColor" strokeWidth={4} {...stroke(isKey, 1)} />
          <motion.path d="M150 100v15M167 100v11" stroke="currentColor" strokeWidth={4} {...stroke(isKey, 2)} />
          <Dot cx={150} cy={119} isOn={isKey} delay={start + 0.7} reduce={reduce} />
          <Dot cx={167} cy={115} isOn={isKey} delay={start + 0.8} reduce={reduce} />
        </g>

        <g transform="rotate(-10 100 100)" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M57 66h86a13 13 0 0 1 13 13v50a13 13 0 0 1-13 13H57a13 13 0 0 1-13-13V79a13 13 0 0 1 13-13z"
            stroke="currentColor"
            strokeWidth={4}
            {...stroke(isWallet, 0)}
          />
          <motion.path
            d="M56 66l54-18a8 8 0 0 1 10.5 7.6V66"
            stroke="currentColor"
            strokeWidth={4}
            {...stroke(isWallet, 1)}
          />
          <motion.path
            d="M129 91h14a13 13 0 0 1 0 26h-14a13 13 0 0 1 0-26z"
            stroke="currentColor"
            strokeWidth={4}
            {...stroke(isWallet, 2)}
          />
          <motion.path
            d="M116 104H94l-9-10H68M94 104l-9 10H70"
            stroke={ACCENT}
            strokeOpacity={0.55}
            strokeWidth={2}
            {...stroke(isWallet, 3)}
          />
          {isWallet && (
            <>
              <Flow d="M116 104H94l-9-10H68" seconds={7} delay={1.8} />
              <Flow d="M116 104H94l-9 10H70" seconds={8} delay={4} />
            </>
          )}
          <Dot cx={66} cy={94} isOn={isWallet} delay={start + 0.8} reduce={reduce} />
          <Dot cx={68} cy={114} isOn={isWallet} delay={start + 0.9} reduce={reduce} />
        </g>

        {/* The core, which travels from one subject to the next */}
        <motion.g
          initial={reduce ? false : { x: core.x, y: core.y, scale: 0 }}
          animate={{ x: core.x, y: core.y, scale: core.scale }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  x: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
                  y: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
                  scale: hasChanged
                    ? { duration: 0.9, ease: [0.65, 0, 0.35, 1] }
                    : { type: 'spring', stiffness: 260, damping: 14, delay: 0.95 },
                }
          }
        >
          <circle className="novacon-art-breathe" r={17} fill={ACCENT} />
          <circle r={8.5} fill={ACCENT} />
          <circle r={2.7} fill="#fff" />
        </motion.g>
      </g>
    </svg>
  );
}

const PLATE_DISC = pathOf(PLATE.disc);
const PLATE_RIM = pathOf(PLATE.rim);
const NETWORK_PATHS = PIXEL_NETWORK.map(pathOf);
const SUBJECTS = {
  1: {
    subject: KEY,
    ink: byDiagonal(KEY.ink),
    lit: byDiagonal(KEY.lit),
    paths: KEY.paths.map(byDiagonal),
    seconds: [9],
  },
  2: {
    subject: WALLET,
    ink: byDiagonal(WALLET.ink),
    lit: byDiagonal(WALLET.lit),
    paths: WALLET.paths.map(byDiagonal),
    seconds: [7, 8],
  },
} as const;

/** A light that steps along a line of pixels, slowly: each pixel lights up in its turn (`dist/index.css`). */
const PixelFlow = ({
  cells,
  seconds,
  delay,
  opacity = 1,
}: {
  cells: Cell[];
  seconds: number;
  delay: number;
  opacity?: number;
}) => (
  <g
    style={
      { '--s': `${seconds}s`, '--d0': `${delay}s`, '--len': cells.length, '--art-opacity': opacity } as CSSProperties
    }
  >
    {cells.map(({ x, y }, index) => (
      <rect
        key={`${x}-${y}`}
        className="novacon-art-px-flow"
        x={x}
        y={y}
        width={1}
        height={1}
        style={{ '--i': index } as CSSProperties}
      />
    ))}
  </g>
);

/**
 * The pixel picture: the plate, the network with lights stepping along it and its nodes twinkling, the subject of the slide
 * gathering pixel by pixel from the top left (again on a change of slide), and its core stepping over from the last one. All
 * of it is CSS of `dist/index.css`, still with `prefers-reduced-motion`.
 */
function PixelArt({ slideId, label, start }: { slideId: number; label: string; start: number }) {
  const shown = SUBJECTS[slideId as 1 | 2] ?? SUBJECTS[1];
  const { core } = shown.subject;
  return (
    <svg
      viewBox="0 0 64 64"
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
      style={{ '--art-start': `${start}s` } as CSSProperties}
      className="novacon-art novacon-art-px novacon:block novacon:h-full novacon:w-full novacon:text-[var(--tuwa-text-primary)]"
    >
      <path className="novacon-art-px-plate" d={PLATE_DISC} fill="var(--tuwa-bg-secondary)" />
      <path className="novacon-art-px-plate" d={PLATE_RIM} fill="var(--tuwa-border-primary)" />

      {NETWORK_PATHS.map((d) => (
        <path key={d} className="novacon-art-px-net" d={d} fill="currentColor" />
      ))}
      {PIXEL_NETWORK.map((cells, index) => (
        <PixelFlow key={index} cells={cells} seconds={11 + index * 2} delay={2 + index * 1.7} opacity={0.45} />
      ))}
      {PIXEL_NODES.map(({ x, y }, index) => (
        <rect
          key={`${x}-${y}`}
          className="novacon-art-px-twinkle"
          x={x}
          y={y}
          width={2}
          height={2}
          fill="currentColor"
          style={{ '--art-delay': `${index * 0.7}s` } as CSSProperties}
        />
      ))}

      <g className="novacon-art-px-float">
        {/* A new subject is a new group: it gathers again from the top left */}
        <g key={slideId}>
          {shown.paths.map((steps, index) =>
            steps.map(({ step, d }) => (
              <path
                key={`${index}-${step}`}
                className="novacon-art-px-in novacon-art-px-path"
                d={d}
                style={{ '--d': step } as CSSProperties}
              />
            )),
          )}
          {shown.subject.paths.map((cells, index) => (
            <PixelFlow key={index} cells={cells} seconds={shown.seconds[index] ?? 8} delay={2 + index * 2} />
          ))}
          {shown.ink.map(({ step, d }) => (
            <path
              key={step}
              className="novacon-art-px-in"
              d={d}
              fill="currentColor"
              style={{ '--d': step } as CSSProperties}
            />
          ))}
          {shown.lit.map(({ step, d }) => (
            <path
              key={step}
              className="novacon-art-px-in"
              d={d}
              fill="var(--tuwa-text-accent)"
              style={{ '--d': step + 12 } as CSSProperties}
            />
          ))}
        </g>
        {/* The core steps from the last subject to this one */}
        {/* Around (3, 3) of its own: a glow of 8 pixels, the core of 4 with its corners cut, a white spark of 2 */}
        <g className="novacon-art-px-core" style={{ transform: `translate(${core.x - 3}px, ${core.y - 3}px)` }}>
          <path
            className="novacon-art-px-glow"
            d="M1 -1h4v1h1v1h1v4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1z"
            fill="var(--tuwa-text-accent)"
          />
          <path d="M2 1h2v1h1v2h-1v1h-2v-1h-1v-2h1z" fill="var(--tuwa-text-accent)" />
          <rect x={2} y={2} width={2} height={2} fill="#fff" />
        </g>
      </g>
    </svg>
  );
}
