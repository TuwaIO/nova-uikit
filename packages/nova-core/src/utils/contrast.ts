/**
 * @file WCAG 2 contrast of colors, for text on a color the app or a merchant chooses (for example an accent).
 */

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Reads a `#rgb` or `#rrggbb` color.
 *
 * @param color - The color.
 * @returns Its red, green and blue channels (0–255), or `null` when it is not a hex color.
 */
export function parseHexColor(color: string): [number, number, number] | null {
  const match = HEX.exec(color.trim());
  if (!match) return null;
  const digits =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : match[1];
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG 2 relative luminance of sRGB channels (0–255). */
const luminance = ([r, g, b]: [number, number, number]) => {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

/**
 * The WCAG 2 contrast ratio of two hex colors, from 1 to 21. Text needs 4.5 (AA), large text and the parts of
 * controls 3.
 *
 * @param foreground - A `#rgb` or `#rrggbb` color.
 * @param background - A `#rgb` or `#rrggbb` color.
 * @returns The ratio; `NaN` when either is not a hex color.
 */
export function contrastRatio(foreground: string, background: string): number {
  const a = parseHexColor(foreground);
  const b = parseHexColor(background);
  if (!a || !b) return NaN;
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * The text color that reads better on a background: the light one unless the dark one has more contrast.
 *
 * @param background - A `#rgb` or `#rrggbb` color; anything else gets the light text.
 * @param colors - The two candidates.
 * @param colors.light - Light text (default `#ffffff`).
 * @param colors.dark - Dark text (default `#111827`, gray-900).
 * @returns `colors.light` or `colors.dark`.
 */
export function readableTextColor(background: string, colors: { light?: string; dark?: string } = {}): string {
  const light = colors.light ?? '#ffffff';
  const dark = colors.dark ?? '#111827';
  if (!parseHexColor(background)) return light;
  return contrastRatio(dark, background) > contrastRatio(light, background) ? dark : light;
}
