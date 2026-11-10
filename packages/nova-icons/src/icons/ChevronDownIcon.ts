import { createPixelIcon } from '../pixelIcon';

/**
 * A chevron that points down: opens what is below, or a menu. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader (`NovaIconProps`).
 */
// prettier-ignore
export const ChevronDownIcon = createPixelIcon('ChevronDownIcon', [
  '................',
  '................',
  '................',
  '................',
  '................',
  '.##..........##.',
  '.###........###.',
  '..###......###..',
  '...###....###...',
  '....###..###....',
  '.....######.....',
  '......####......',
  '.......##.......',
  '................',
  '................',
  '................',
]);
