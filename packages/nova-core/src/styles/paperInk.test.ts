import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { primaryButtonClasses } from '../utils/classes';

// Nova takes the look of paper and ink (the manner of getartcraft.com): square corners, the circles
// made squares, lines of 1 px instead of soft shadows, no gradients, solid buttons. These guards read the sources of every
// Nova package, so that a rounded, shadowed or graded part does not come back unnoticed.

const PACKAGES = join(__dirname, '../../..');
const SOURCES = ['nova-core', 'nova-connect', 'nova-transactions'].map((name) => join(PACKAGES, name, 'src'));

/** The component sources of the packages: every .ts and .tsx but the tests. */
const sourcesOf = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourcesOf(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });

const files = SOURCES.flatMap(sourcesOf).map((path) => ({
  path: relative(PACKAGES, path),
  text: readFileSync(path, 'utf8'),
}));

/** Every match of a pattern in the sources, as `file: match`. */
const findAll = (pattern: RegExp) =>
  files.flatMap(({ path, text }) => [...text.matchAll(pattern)].map(([match]) => `${path}: ${match}`));

describe('paper and ink', () => {
  it('marks the main button as filled, so the icons in it keep their color under the pointer', () => {
    expect(primaryButtonClasses.split(' ')).toContain('tuwa-solid');
  });

  it('reads the sources of the three packages', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('has no circle as a class: what was round takes --tuwa-rounded-full, square by default', () => {
    expect(findAll(/(?:novacore|novacon|novatx):(?:[\w-]+:)*rounded-full\b/g)).toEqual([]);
  });

  it('has no soft shadow: parts are drawn with lines of 1 px', () => {
    expect(findAll(/(?:novacore|novacon|novatx):(?:[\w-]+:)*!?shadow-(?:xs|sm|md|lg|xl|2xl|inner)\b/g)).toEqual([]);
  });

  it('has no gradient in its classes', () => {
    expect(findAll(/(?:bg-gradient-to|bg-\[(?:linear|radial|conic)-gradient)/g)).toEqual([]);
  });

  // `bg-opacity-*` and the like are Tailwind 3: Tailwind 4 does not make them, and a light tint became a solid fill (the
  // frame of a connecting wallet, the copy button of an error under its own text)
  it('has no opacity utility of Tailwind 3', () => {
    expect(findAll(/(?:bg|ring|text|border)-opacity-\d+/g)).toEqual([]);
  });

  it('is square and uses no circles by default', () => {
    const css = readFileSync(join(__dirname, 'variables.css'), 'utf8');
    const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
    expect(root).toMatch(/--tuwa-rounded-corners: 0px;/);
    expect(root).toMatch(/--tuwa-rounded-full: 0px;/);
  });

  // A monospace label in capitals with spacing (a button, a chip, the label of a section) keeps its tracking: the base rule
  // of Nova tightens monospace text with !important, and a tracking class lost to it
  it('lets a monospace part with a tracking class keep its spacing', () => {
    const css = readFileSync(join(__dirname, 'variables.css'), 'utf8');
    const tightening = css.slice(0, css.indexOf('letter-spacing: -0.025em !important'));
    expect(tightening.slice(tightening.lastIndexOf(':is('))).toContain(":not([class*=':tracking-'])");
  });
});
