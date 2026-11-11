import { createPixelIcon } from '../pixelIcon';

/**
 * Three bars in a square: a report, an overview. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const ChartBarSquareIcon = /* @__PURE__ */ createPixelIcon('ChartBarSquareIcon', [
  '................',
  '..############..',
  '.##############.',
  '.##..........##.',
  '.##....##....##.',
  '.##....##....##.',
  '.##....##.##.##.',
  '.##....##.##.##.',
  '.##.##.##.##.##.',
  '.##.##.##.##.##.',
  '.##.##.##.##.##.',
  '.##.##.##.##.##.',
  '.##..........##.',
  '.##############.',
  '..############..',
  '................',
]);
