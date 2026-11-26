import { isValidElement, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import type { NovaConnectLabels } from '../../i18n/types';
import { ukrainianLabels } from '../../i18n/ua';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

let labels: NovaConnectLabels = defaultLabels;
vi.mock('../../hooks', () => ({ useNovaConnectLabels: () => labels }));
vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => labels }));

import { Disclaimer } from './Disclaimer';

const renderDisclaimer = ((Disclaimer as { type?: unknown }).type ?? Disclaimer) as {
  render: (props: object, ref?: null) => unknown;
};

const text = (node: unknown): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  return isValidElement(node) ? text((node as ReactElement<{ children?: unknown }>).props.children) : '';
};

/** Every element of the tree. */
const elements = (node: unknown): ReactElement<Record<string, unknown>>[] => {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement(node)) return [];
  const element = node as ReactElement<Record<string, unknown>>;
  return [element, ...Object.values(element.props).flatMap(elements)];
};

/** The hidden line of a disclaimer for screen readers. */
function summary(title: string, language: NovaConnectLabels = defaultLabels): string {
  labels = language;
  const tree = render(renderDisclaimer.render, { title, description: 'Text.' });
  const hidden = elements(tree).find((element) => String(element.props.className ?? '').includes('sr-only'));
  return text(hidden);
}

afterEach(() => unmount());

// The disclaimers of the connect modal are questions ("What is a network?"), and a screen reader read "a network?."
describe('the hidden line of a disclaimer', () => {
  it('ends with the question mark of its title, with no full stop after it', () => {
    expect(summary('What is a network?')).toBe('Disclaimer about what is a network? Text.');
    expect(summary('Що таке мережа?', ukrainianLabels)).toBe('Застереження: що таке мережа? Text.');
  });

  it('ends with a full stop after any other title', () => {
    expect(summary('Networks')).toBe('Disclaimer about networks. Text.');
  });
});
