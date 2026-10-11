import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/contrast';

const css = readFileSync(new URL('./variables.css', import.meta.url), 'utf8');
const colors = createRequire(import.meta.url)('tailwindcss/colors') as Record<string, string | Record<string, string>>;

/** The `--tuwa-*` declarations of one rule of `variables.css`. */
const declarations = (selector: string) => {
  const body = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css)?.[1] ?? '';
  return Object.fromEntries([...body.matchAll(/(--tuwa-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value]));
};
const THEMES = {
  light: declarations(':root'),
  dark: { ...declarations(':root'), ...declarations('.dark') },
};

/** An `oklch(L% C H)` color of Tailwind 4 as sRGB hex, clamped to the gamut. */
const oklchToHex = (value: string) => {
  const [l, c, h] = (/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/.exec(value) ?? []).slice(1).map(Number);
  const [a, b] = [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
  const L = l / 100;
  const lms = [
    L + 0.3963377774 * a + 0.2158037573 * b,
    L - 0.1055613458 * a - 0.0638541728 * b,
    L - 0.0894841775 * a - 1.291485548 * b,
  ].map((x) => x ** 3);
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
  return `#${linear
    .map((x) => {
      const v = Math.min(1, Math.max(0, x));
      const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
      return Math.round(srgb * 255)
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
};

/** A token's color in a theme: `theme('colors.…')`, `var(--tuwa-…)` or a hex value. */
const color = (theme: keyof typeof THEMES, token: string): string => {
  const value = THEMES[theme][`--tuwa-${token}`];
  if (!value) throw new Error(`--tuwa-${token} is not defined for ${theme}`);
  const reference = /var\(--tuwa-([\w-]+)\)/.exec(value);
  if (reference) return color(theme, reference[1]);
  const path = /theme\('colors\.([\w.]+)'\)/.exec(value)?.[1];
  if (path) {
    const [hue, shade] = path.split('.');
    const raw = shade ? (colors[hue] as Record<string, string>)[shade] : (colors[hue] as string);
    return raw.startsWith('#') ? raw : oklchToHex(raw);
  }
  return value.trim();
};

/** Text that carries meaning (WCAG 1.4.3, AA): 4.5:1 in both themes. */
const TEXT_PAIRS: [string, string][] = [
  ['text-primary', 'bg-primary'],
  ['text-primary', 'bg-secondary'],
  ['text-primary', 'bg-muted'],
  ['text-secondary', 'bg-primary'],
  ['text-secondary', 'bg-secondary'],
  ['text-accent', 'bg-primary'],
  ['text-accent', 'bg-secondary'],
  ['text-on-accent', 'button-primary-bg'],
  ['text-on-accent', 'button-primary-bg-hover'],
  ['success-text', 'success-bg'],
  ['error-text', 'error-bg'],
  ['pending-text', 'pending-bg'],
  ['info-text', 'info-bg'],
];

describe('theme variables', () => {
  it.each(Object.keys(THEMES) as (keyof typeof THEMES)[])('keep text readable in the %s theme', (theme) => {
    for (const [text, background] of TEXT_PAIRS) {
      const ratio = contrastRatio(color(theme, text), color(theme, background));
      expect(ratio, `${text} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(Object.keys(THEMES) as (keyof typeof THEMES)[])(
    'set the main button apart from the page in the %s theme (WCAG 1.4.11)',
    (theme) => {
      expect(contrastRatio(color(theme, 'button-primary-bg'), color(theme, 'bg-primary'))).toBeGreaterThanOrEqual(3);
    },
  );

  it('fill the main button with one solid color, which follows a brand color set on the legacy gradient start', () => {
    expect(THEMES.light['--tuwa-button-primary-bg']).toBe('var(--tuwa-button-gradient-from)');
    expect(THEMES.light['--tuwa-button-primary-bg-hover']).toBe('var(--tuwa-button-gradient-from-hover)');
  });
});
