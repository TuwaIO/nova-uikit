import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

import { contrastRatio, parseHexColor } from '../utils/contrast';

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
  // Paper and ink: the sunken layer carries labels and links too
  ['text-secondary', 'bg-muted'],
  ['text-accent', 'bg-primary'],
  ['text-accent', 'bg-secondary'],
  ['text-accent', 'bg-muted'],
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

  // The brand of TUWA: orange in the light theme, the cyan of the dark logo in the dark one. Text and thin lines take a
  // deep shade that holds AA on paper; the fills (the main button, lit pixels, illustrations) a bright one, with ink
  it('are the TUWA orange in the light theme and the cyan of the logo in the dark one, with ink on the fills', () => {
    expect(color('light', 'text-accent')).toBe('#b93b0a');
    expect(color('light', 'button-primary-bg')).toBe('#f05a14');
    expect(color('dark', 'text-accent')).toBe('#3ed2ec');
    expect(color('dark', 'button-primary-bg')).toBe('#22c3e6');
    for (const theme of ['light', 'dark'] as const) expect(color(theme, 'text-on-accent')).toBe('#101014');
    expect(THEMES.light['--tuwa-icon-accent']).toBe('var(--tuwa-button-primary-bg)');
    expect(css).not.toMatch(/#0052ff|#60a5fa/i);
  });

  // A part with no focus style of its own (the close button of a dialog) showed the blue ring of the browser, off the
  // brand: Nova draws the keyboard focus of its parts in the accent
  it('draw the keyboard focus of the parts of Nova in the accent', () => {
    expect(css).toMatch(
      /:is\(\[class\*='novacore:'\], \[class\*='novacon:'\], \[class\*='novatx:'\], \[class\*='novapay:'\]\):focus-visible \{\s*outline: var\(--tuwa-ring-width, 2px\) solid var\(--tuwa-text-accent\);/,
    );
  });

  it('fill the main button with one solid color, which follows a brand color set on the legacy gradient start', () => {
    expect(THEMES.light['--tuwa-button-primary-bg']).toBe('var(--tuwa-button-gradient-from)');
    expect(THEMES.light['--tuwa-button-primary-bg-hover']).toBe('var(--tuwa-button-gradient-from-hover)');
  });
});

// At half strength the veil left the page behind a dialog readable (its text at 4.4:1 in the dark theme, 5.2:1 in the
// light one), so two texts competed. Light text shows through more than ink does, so the dark theme has its own veil
describe('the veil behind an open dialog', () => {
  /** A color seen through the veil of a theme. */
  const veiled = (theme: keyof typeof THEMES, token: string) => {
    const veil = /rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/.exec(THEMES[theme]['--tuwa-backdrop']);
    if (!veil) throw new Error(`--tuwa-backdrop of ${theme} is not rgb(r g b / a)`);
    const alpha = Number(veil[4]);
    const below = parseHexColor(color(theme, token)) ?? [0, 0, 0];
    return `#${below
      .map((channel, index) =>
        Math.round(channel * (1 - alpha) + Number(veil[index + 1]) * alpha)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  };

  it.each(Object.keys(THEMES) as (keyof typeof THEMES)[])('lets the page step back in the %s theme', (theme) => {
    for (const surface of ['bg-primary', 'bg-secondary']) {
      const ratio = contrastRatio(veiled(theme, 'text-primary'), veiled(theme, surface));
      // Still there, so a person knows where they are, and no longer a text to read
      expect(ratio, `text on ${surface}`).toBeLessThan(3);
      expect(ratio, `text on ${surface}`).toBeGreaterThan(1.3);
    }
  });

  it('is the one veil of every dialog', () => {
    const modal = readFileSync(new URL('../components/Modal.tsx', import.meta.url), 'utf8');
    expect(modal).toContain('novacore:bg-[var(--tuwa-backdrop)]');
    expect(modal).not.toMatch(/bg-\[rgb\(/);
  });
});

// `NetworkIcon` draws a testnet as a white mark on a tile of this color, chosen by eye. With the colored marks of
// before, this grey made the list of networks read too dark, and #c4bfb8 stood for a while; a white mark needs this one
describe('the color of testnet icons', () => {
  it('is the grey of the circle behind the white mark, in both themes', () => {
    const testnet = [...css.matchAll(/--tuwa-testnet-icons:\s*(#[0-9a-f]{6})/gi)].map((match) => match[1]);
    expect(testnet).toEqual(['#6b655e', '#6b655e']);
  });
});

// Each package builds its classes on the monospace font of Tailwind, the font of the system, unless it is told otherwise: the wallet
// window and the transactions read in another font than Nova Core itself
describe('the monospace font of the packages of Nova', () => {
  const rules = {
    ':root': css.slice(css.indexOf(':root {'), css.indexOf(':lang(uk),')),
    Ukrainian: css.slice(css.indexOf(':lang(uk),'), css.indexOf('.dark {')),
  };

  it.each(Object.entries(rules))('is the font of TUWA in %s', (_name, rule) => {
    for (const prefix of ['novacon', 'novatx', 'novapay']) {
      expect(rule).toContain(`--${prefix}-font-mono: var(--tuwa-font-mono);`);
    }
  });
});
