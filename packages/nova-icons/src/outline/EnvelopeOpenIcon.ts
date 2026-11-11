import { createPixelIcon } from '../pixelIcon';

/**
 * An open envelope: a read message, an email sent. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const EnvelopeOpenIcon = /* @__PURE__ */ createPixelIcon('EnvelopeOpenIcon', [
  '................',
  '.......##.......',
  '......####......',
  '.....######.....',
  '....###..###....',
  '...###....###...',
  '..###......###..',
  '.###........###.',
  '.##..........##.',
  '.####.......###.',
  '.#####.....####.',
  '.##.###...#####.',
  '.##############.',
  '.##############.',
  '................',
  '................',
]);
