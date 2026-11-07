import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { lockPageScroll } from './pageScrollLock';

const element = () => {
  const classes = new Set<string>();
  return {
    dataset: {} as Record<string, string | undefined>,
    classList: { add: (name: string) => classes.add(name), remove: (name: string) => classes.delete(name) },
    has: (name: string) => classes.has(name),
  };
};

const page = () => {
  const documentElement = element();
  const body = element();
  vi.stubGlobal('document', { documentElement, body });
  return { documentElement, body };
};

describe('lockPageScroll', () => {
  afterEach(() => vi.unstubAllGlobals());

  // `overflow` on `body` reaches the viewport only while `html` leaves its own visible: with `html { overflow-x: clip }`
  // on the page, as on our website, a class on `body` alone left the page scrolling behind the dialog
  it('holds both html and body', () => {
    const { documentElement, body } = page();
    const release = lockPageScroll();
    expect(documentElement.has('NovaModalOpen')).toBe(true);
    expect(body.has('NovaModalOpen')).toBe(true);
    release();
    expect(documentElement.has('NovaModalOpen')).toBe(false);
    expect(body.has('NovaModalOpen')).toBe(false);
  });

  // The details of a transaction open over the wallet window: closing them must not free the page under it
  it('keeps the hold until the last dialog closes', () => {
    const { documentElement, body } = page();
    const lower = lockPageScroll();
    const upper = lockPageScroll();
    upper();
    expect(documentElement.has('NovaModalOpen')).toBe(true);
    expect(body.has('NovaModalOpen')).toBe(true);
    lower();
    expect(documentElement.has('NovaModalOpen')).toBe(false);
    expect(documentElement.dataset.novaModalsOpen).toBeUndefined();
  });

  it('the stylesheet stops scrolling for that class, on any element', () => {
    const css = readFileSync(new URL('../styles/variables.css', import.meta.url), 'utf8');
    expect(css).toMatch(/^\.NovaModalOpen \{\s*overflow: hidden;/m);
  });
});
