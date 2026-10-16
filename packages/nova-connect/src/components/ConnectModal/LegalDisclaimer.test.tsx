import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const legal = vi.hoisted(() => ({ value: {} as { termsUrl?: string; privacyUrl?: string } }));
vi.mock('../../hooks', () => ({
  useNovaConnect: () => ({ legal: legal.value }),
  useNovaConnectLabels: () => defaultLabels,
}));

import { LegalDisclaimer } from './LegalDisclaimer';

type Node = { type?: unknown; props?: Record<string, unknown> & { children?: unknown } };

// The elements of the rendered tree (the harness renders one component, without a DOM)
const flatten = (node: unknown): Node[] => {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(flatten);
  const element = node as Node;
  return [element, ...flatten(element.props?.children)];
};
// The words of the line in order: plain text and the texts of the links
const sentence = () => {
  const words: string[] = [];
  const walk = (node: unknown) => {
    if (typeof node === 'string') words.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') walk((node as Node).props?.children);
  };
  walk(render(LegalDisclaimer, {}));
  return words.join('').replace(/\s+/g, ' ').trim();
};

// The legal line under the wallet list. Connecting is agreement to the terms of service only: the privacy policy is
// an information to read, not something the user agrees to, so it has a sentence of its own (lawyer of TUWA, 2026-10-16).
describe('LegalDisclaimer', () => {
  afterEach(() => {
    unmount();
    legal.value = {};
  });

  it('asks to agree to the terms of service and only points to the privacy policy', () => {
    legal.value = { termsUrl: '/terms', privacyUrl: '/privacy' };

    expect(sentence()).toBe('By connecting your wallet, you agree to our Terms of Service. See our Privacy Policy.');
  });

  it('names only the terms of service when there is no privacy policy', () => {
    legal.value = { termsUrl: '/terms' };

    expect(sentence()).toBe('By connecting your wallet, you agree to our Terms of Service.');
  });

  it('never asks to agree to a privacy policy alone', () => {
    legal.value = { privacyUrl: '/privacy' };

    expect(sentence()).toBe('See our Privacy Policy.');
  });

  it('links each document', () => {
    legal.value = { termsUrl: '/terms', privacyUrl: '/privacy' };
    const hrefs = flatten(render(LegalDisclaimer, {}))
      .map((n) => n.props?.href)
      .filter(Boolean);

    expect(hrefs).toEqual(['/terms', '/privacy']);
  });

  it('renders nothing without links', () => {
    expect(render(LegalDisclaimer, {})).toBeNull();
  });
});
