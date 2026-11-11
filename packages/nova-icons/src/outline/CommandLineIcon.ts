import { createPixelIcon } from '../pixelIcon';

/**
 * A terminal with a prompt and a lit cursor: a command, the API, a script. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const CommandLineIcon = /* @__PURE__ */ createPixelIcon('CommandLineIcon', [
  '................',
  '................',
  '..############..',
  '.##############.',
  '.##..........##.',
  '.##..........##.',
  '.##.##.......##.',
  '.##.###......##.',
  '.##..###.....##.',
  '.##..###.....##.',
  '.##.###.oooo.##.',
  '.##.##..oooo.##.',
  '.##############.',
  '..############..',
  '................',
  '................',
]);
