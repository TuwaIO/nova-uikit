import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { lockPageScroll } from './pageScrollLock';

const element = () => {
  const classes = new Set<string>();
  return {
    dataset: {} as Record<string, string | undefined>,
    classList: {
      add: (name: string) => classes.add(name),
      remove: (...names: string[]) => names.forEach((name) => classes.delete(name)),
    },
    has: (name: string) => classes.has(name),
  };
};

const page = () => {
  const documentElement = element();
  const body = element();
  vi.stubGlobal('document', { documentElement, body });
  vi.stubGlobal('window', { innerWidth: 1000 });
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

  // A gutter on the page of a host all the time is not Nova's to choose. It is kept only for a dialog, and only
  // for a scrollbar that takes room, or the page would jump the other way
  it('keeps the width of a scrollbar that takes room, while the dialog is open', () => {
    const { documentElement } = page();
    Object.assign(documentElement, { clientWidth: 985 });

    const release = lockPageScroll();
    expect(documentElement.has('NovaModalGutter')).toBe(true);

    release();
    expect(documentElement.has('NovaModalGutter')).toBe(false);
  });

  it('keeps no gutter for an overlay scrollbar, or for a page with none', () => {
    const { documentElement } = page();
    Object.assign(documentElement, { clientWidth: 1000 });

    lockPageScroll();
    expect(documentElement.has('NovaModalGutter')).toBe(false);
  });

  it('the stylesheet stops scrolling for that class, on any element', () => {
    const css = readFileSync(new URL('../styles/variables.css', import.meta.url), 'utf8');
    expect(css).toMatch(/^\.NovaModalOpen \{\s*overflow: hidden;/m);
  });
});
