/**
 * @file The pixel check mark of "Remember this wallet" and how its pixels fly in.
 */

/**
 * The pixel check mark of the box: a grid of 7, each pixel two screen pixels at 14 px, its line two pixels thick (one pixel
 * was too thin to read). It assembles from its pixels when the box is ticked.
 *
 * @internal
 */
export const PIXEL_CHECK = [
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 4],
  [2, 5],
  [3, 5],
  [3, 4],
  [3, 3],
  [4, 3],
  [4, 2],
  [5, 2],
  [5, 1],
  [6, 1],
] as const;

/**
 * How the pixels of the check mark fly in (`pixelFlight`): closer than those of an icon, as its grid is small.
 *
 * @internal
 */
export const CHECK_FLIGHT = { spread: 0.6, stagger: 160 } as const;
