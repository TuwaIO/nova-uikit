/**
 * @file How much of the strip of a `StatusEdge` is filled. Apart from it so that the helper is not an export of the package.
 */

import type { StatusTone } from './StatusEdge';

/**
 * How much of the strip is filled.
 *
 * @internal
 * @param tone - The state.
 * @param progress - The share done, if it is known.
 * @param reduceMotion - Whether the viewer asked for less motion: then the glint cannot say that work goes on.
 * @returns The share of the strip to fill, from 0 to 1.
 */
export function stripFill(tone: StatusTone, progress: number | undefined, reduceMotion: boolean): number {
  if (tone !== 'pending') return 1;
  if (progress !== undefined) return Math.min(1, Math.max(0, progress));
  return reduceMotion ? 1 : 0;
}
