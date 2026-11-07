import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const core = read('./variables.css');
const connect = read('../../../nova-connect/src/styles/app.css');
const fonts = read('./fonts.css');
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Owner, 2026-11-07: Nova keeps to its own parts. These reached the whole page of the host
describe('the styles of Nova on the page of a host', () => {
  it.each([
    ['the font of the page', /(^|[\s,}])body\s*\{/],
    ['the scrollbar gutter of the page', /(^|[\s,}])html\s*\{/],
    ['the line height of any monospace element', /\[class\*='font-mono'\]/],
    ['the headings of the page', /:lang\(uk\)\s+h[1-6]/],
    ['the toasts of the host', /\.Toastify__toast/],
    ['every toast container', /\.Toastify\s*\{/],
  ])('leaves alone %s', (_name, pattern) => {
    expect(withoutComments(core)).not.toMatch(pattern);
  });

  it('leaves alone the poppers of the host', () => {
    expect(withoutComments(connect)).not.toMatch(/div\[data-radix-popper-content-wrapper\]\s*\{/);
  });

  it('gives its animations names of their own', () => {
    for (const name of [...(withoutComments(core) + withoutComments(connect)).matchAll(/@keyframes\s+([\w-]+)/g)].map(
      (m) => m[1],
    )) {
      expect(name).toMatch(/^(nova|tuwa)/);
    }
  });

  // The raw data of a transaction has several lines, and its line height had no effect
  it('lets a part of its own set its line height', () => {
    expect(core).toContain(":not([class*=':leading-'])");
  });
});

describe('the fonts', () => {
  const files = [...fonts.matchAll(/url\(\.\/(fonts\/[\w.-]+)\)/g)].map((match) => match[1]);

  // Embedded, they added 180 KB of render-blocking CSS to a first load, Cyrillic on an English page included
  it('are files, not data in the stylesheet', () => {
    expect(fonts).not.toContain('data:');
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s is there', (file) => {
    expect(existsSync(new URL(`./${file}`, import.meta.url))).toBe(true);
  });

  // Owner, 2026-11-07: the SIL Open Font License asks for its text to go with the fonts
  it('come with their license', () => {
    expect(readFileSync(new URL('./fonts/OFL-Geist.txt', import.meta.url), 'utf8')).toContain('SIL OPEN FONT LICENSE');
  });

  it('come with the package', () => {
    const manifest = JSON.parse(read('../../package.json')) as { scripts: { build: string } };
    expect(manifest.scripts.build).toContain('cp -R ./src/styles/fonts ./dist/fonts');
  });
});
