import { createPixelIcon } from '../pixelIcon';

/**
 * A server with two units and their lights lit: a server, self-hosting. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const ServerIcon = /* @__PURE__ */ createPixelIcon('ServerIcon', [
  '................',
  '..############..',
  '.##############.',
  '.##..........##.',
  '.##.......oo.##.',
  '.##.......oo.##.',
  '.##..........##.',
  '.##############.',
  '.##############.',
  '.##..........##.',
  '.##.......oo.##.',
  '.##.......oo.##.',
  '.##..........##.',
  '.##############.',
  '..############..',
  '................',
]);
