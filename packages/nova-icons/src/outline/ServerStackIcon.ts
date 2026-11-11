import { createPixelIcon } from '../pixelIcon';

/**
 * A rack of three servers: infrastructure, nodes. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const ServerStackIcon = /* @__PURE__ */ createPixelIcon('ServerStackIcon', [
  '................',
  '..############..',
  '.##############.',
  '.##.......##.##.',
  '.##.......##.##.',
  '.##############.',
  '.##############.',
  '.##.......##.##.',
  '.##.......##.##.',
  '.##############.',
  '.##############.',
  '.##.......##.##.',
  '.##.......##.##.',
  '.##############.',
  '..############..',
  '................',
]);
