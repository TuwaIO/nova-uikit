import { createPixelIcon } from '../pixelIcon';

/**
 * A banknote over another: cash, a payment, fiat money. A Nova icon on a 16 × 16 pixel grid, named as in Heroicons.
 *
 * @param props - The props of the SVG element, `title` to name it for a screen reader, `motion` to play a motion once
 * (`NovaIconProps`).
 */
// prettier-ignore
export const BanknotesIcon = /* @__PURE__ */ createPixelIcon('BanknotesIcon', [
  '................',
  '....############',
  '....############',
  '..............##',
  '.############.##',
  '################',
  '##..........####',
  '##....##....####',
  '##...#..#...####',
  '##...#..#...####',
  '##....##....####',
  '##..........##..',
  '##..........##..',
  '##############..',
  '.############...',
  '................',
]);
