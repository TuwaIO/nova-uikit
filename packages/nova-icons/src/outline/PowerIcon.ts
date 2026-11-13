import { createPixelIcon } from '../pixelIcon';

/**
 * A power button, a ring open at the top with its bar lit: on and off, a session. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const PowerIcon = /* @__PURE__ */ createPixelIcon('PowerIcon', [
  '................',
  '.......oo.......',
  '...##..oo..##...',
  '..###..oo..###..',
  '.###...oo...###.',
  '.##....oo....##.',
  '.##....oo....##.',
  '.##....oo....##.',
  '.##..........##.',
  '.##..........##.',
  '.##..........##.',
  '.###........###.',
  '..###......###..',
  '...##########...',
  '.....######.....',
  '................',
]);
