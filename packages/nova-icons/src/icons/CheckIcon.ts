import { createPixelIcon } from '../pixelIcon';

/**
 * A check mark: done, chosen or right. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader (`NovaIconProps`).
 */
// prettier-ignore
export const CheckIcon = createPixelIcon('CheckIcon', [
  '................',
  '................',
  '................',
  '.............##.',
  '............###.',
  '...........###..',
  '..........###...',
  '.##......###....',
  '.###....###.....',
  '..###..###......',
  '...######.......',
  '....####........',
  '.....##.........',
  '................',
  '................',
  '................',
]);
