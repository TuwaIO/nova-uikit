import { createPixelIcon } from '../pixelIcon';

/**
 * A puzzle piece. The solid variant, for `24/solid`, `20/solid` and `16/solid`. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const PuzzlePieceIcon = /* @__PURE__ */ createPixelIcon('PuzzlePieceIcon', [
  '......####......',
  '.....######.....',
  '.....######.....',
  '..############..',
  '..############..',
  '..##############',
  '..##############',
  '..##############',
  '..##############',
  '..############..',
  '..############..',
  '..############..',
  '..############..',
  '...##########...',
  '................',
  '................',
]);
