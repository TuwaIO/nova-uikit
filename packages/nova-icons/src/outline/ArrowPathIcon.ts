import { createPixelIcon } from '../pixelIcon';

/**
 * Two arrows chasing round a circle: refresh, retry, sync, a replaced transaction. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const ArrowPathIcon = /* @__PURE__ */ createPixelIcon('ArrowPathIcon', [
  '................',
  '................',
  '.....######.....',
  '....########....',
  '...###....###...',
  '...........###..',
  '..##........##..',
  '.####.....######',
  '######.....####.',
  '..##........##..',
  '..###...........',
  '...###....###...',
  '....########....',
  '.....######.....',
  '................',
  '................',
]);
