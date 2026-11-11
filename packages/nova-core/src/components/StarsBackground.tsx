/* eslint-disable react-hooks/purity */
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

import { type NovaLook, useNovaIcons } from '../hooks/useNovaIcons';

/** A star of the field: where it is (a fraction of the width and height), what it is, and how it twinkles. */
type Star = { fx: number; fy: number; kind: 'dot' | 'sparkle' | 'nova'; size: number; delay: number; duration: number };

/** A four-pointed star of radius `r` around 0,0: four curves between its tips, pinched to the middle. */
const sparklePath = (r: number) => {
  const k = Number((r * 0.16).toFixed(2));
  return `M0 ${-r}C${k} ${-k} ${k} ${-k} ${r} 0C${k} ${k} ${k} ${k} 0 ${r}C${-k} ${k} ${-k} ${k} ${-r} 0C${-k} ${-k} ${-k} ${-k} 0 ${-r}Z`;
};

/** The pixels of the pixel stars, two screen pixels each: a dot, a small cross, and a large cross with a lit heart. */
const PIXEL_STARS = {
  dot: { size: 2, cells: [[0, 0]] },
  sparkle: {
    size: 6,
    cells: [
      [2, 0],
      [0, 2],
      [2, 2],
      [4, 2],
      [2, 4],
    ],
  },
  nova: {
    size: 10,
    cells: [
      [4, 0],
      [4, 2],
      [0, 4],
      [2, 4],
      [6, 4],
      [8, 4],
      [4, 6],
      [4, 8],
    ],
  },
} as const;

const STAR_COLOR = 'color-mix(in srgb, var(--tuwa-text-primary) 70%, transparent)';

const STYLES = `
  @keyframes tuwa-stars-pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.9); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }
  @keyframes tuwa-stars-twinkle {
    0%, 100% { opacity: 0.25; transform: scale(0.6); }
    50% { opacity: 0.95; transform: scale(1); }
  }
  @keyframes tuwa-stars-supernova {
    0% { opacity: 0.5; transform: scale(0.8); fill: ${STAR_COLOR}; }
    20% { opacity: 1; transform: scale(1.6); fill: var(--tuwa-button-gradient-from); }
    100% { opacity: 0; transform: scale(0.8); fill: var(--tuwa-button-gradient-to); }
  }
  /* The pixel stars step through four brightnesses instead of fading */
  @keyframes tuwa-stars-px {
    0%, 100% { opacity: 0.2; }
    25%, 75% { opacity: 0.5; }
    50% { opacity: 0.95; }
  }
  @keyframes tuwa-stars-px-heart {
    0%, 60%, 100% { fill: ${STAR_COLOR}; }
    70%, 90% { fill: var(--tuwa-text-accent); }
  }
  /* In place: the default box is the whole SVG, and a star scaled from its center would fly across the panel */
  .tuwa-star-dot, .tuwa-star-sparkle, .tuwa-star-nova {
    transform-box: fill-box;
    transform-origin: center;
    animation-iteration-count: infinite;
  }
  .tuwa-star-dot { animation-name: tuwa-stars-pulse; animation-timing-function: ease-in-out; }
  .tuwa-star-sparkle { animation-name: tuwa-stars-twinkle; animation-timing-function: ease-in-out; }
  .tuwa-star-nova { animation-name: tuwa-stars-supernova; animation-timing-function: ease-out; }
  .tuwa-star-px { animation-name: tuwa-stars-px; animation-timing-function: step-end; animation-iteration-count: infinite; }
  /* The heart of a large pixel star lights up in the accent, on the timing of its star */
  .tuwa-star-px-heart { animation-name: tuwa-stars-px-heart; animation-timing-function: step-end; animation-iteration-count: infinite; animation-duration: inherit; animation-delay: inherit; }
  @media (prefers-reduced-motion: reduce) {
    .tuwa-star-dot, .tuwa-star-sparkle, .tuwa-star-nova, .tuwa-star-px, .tuwa-star-px-heart {
      animation: none;
    }
  }
`;

/**
 * An animated background of twinkling stars. It fills its positioned parent (`absolute`, `inset-0`); the stars are placed at
 * random inside it after mount, so nothing is rendered on the server. Two looks: `classic`, small round stars with four-pointed
 * ones among them, and `pixel`, stars of a few crisp pixels that step through their brightness. Nova Connect uses it in the
 * "about wallets" and "get a wallet" screens of the connect modal. It holds still with `prefers-reduced-motion`.
 *
 * Side effect: a `ResizeObserver` on its element, which places the pixel stars on whole pixels when the field changes size.
 *
 * @param props - The background props.
 * @param props.starsCount - Number of stars. Defaults to `200`.
 * @param props.look - `pixel` or `classic`. Defaults to the look of the icon set of the closest `NovaIconsProvider` (pixel
 * without one).
 * @returns The background element.
 */
export function StarsBackground({ starsCount, look }: { starsCount?: number; look?: NovaLook }) {
  const setLook = useNovaIcons().look;
  const isPixel = (look ?? setLook) === 'pixel';
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const count = starsCount ?? 200;
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: count }, () => {
        const roll = Math.random();
        const kind = roll < 0.05 ? 'nova' : roll < 0.22 ? 'sparkle' : 'dot';
        return {
          fx: Math.random(),
          fy: Math.random(),
          kind,
          size:
            kind === 'dot'
              ? Math.random() * 1 + 0.5
              : kind === 'sparkle'
                ? Math.random() * 1.6 + 2
                : Math.random() + 3.2,
          delay: Math.random() * 10,
          duration: (kind === 'dot' ? 5 : 7) + Math.random() * 5,
        };
      }),
    [count],
  );

  const timing = (star: Star): CSSProperties => ({
    animationDelay: `${star.delay}s`,
    animationDuration: `${star.duration}s`,
  });

  return (
    <div
      ref={ref}
      className="novacore:absolute novacore:inset-0 novacore:z-1 novacore:h-full novacore:w-full novacore:overflow-hidden"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering={isPixel ? 'crispEdges' : undefined}
      >
        <defs>
          <style>{STYLES}</style>
        </defs>
        {box &&
          stars.map((star, index) => {
            if (isPixel) {
              const sprite = PIXEL_STARS[star.kind];
              // On a grid of two pixels, and inside the field, so that every star keeps its crisp edges
              const x = Math.min(Math.floor((star.fx * box.width) / 2) * 2, Math.max(0, box.width - sprite.size));
              const y = Math.min(Math.floor((star.fy * box.height) / 2) * 2, Math.max(0, box.height - sprite.size));
              return (
                <svg key={index} className="tuwa-star-px" x={x} y={y} overflow="visible" style={timing(star)}>
                  {sprite.cells.map(([cx, cy]) => (
                    <rect key={`${cx}-${cy}`} x={cx} y={cy} width={2} height={2} fill={STAR_COLOR} />
                  ))}
                  {star.kind === 'nova' && (
                    <rect className="tuwa-star-px-heart" x={4} y={4} width={2} height={2} fill={STAR_COLOR} />
                  )}
                </svg>
              );
            }
            if (star.kind === 'dot') {
              return (
                <circle
                  key={index}
                  className="tuwa-star-dot"
                  cx={`${star.fx * 100}%`}
                  cy={`${star.fy * 100}%`}
                  r={star.size}
                  fill={STAR_COLOR}
                  style={timing(star)}
                />
              );
            }
            return (
              <svg key={index} x={`${star.fx * 100}%`} y={`${star.fy * 100}%`} overflow="visible">
                <path
                  className={star.kind === 'nova' ? 'tuwa-star-sparkle tuwa-star-nova' : 'tuwa-star-sparkle'}
                  d={sparklePath(star.size)}
                  fill={STAR_COLOR}
                  style={timing(star)}
                />
              </svg>
            );
          })}
      </svg>
    </div>
  );
}
