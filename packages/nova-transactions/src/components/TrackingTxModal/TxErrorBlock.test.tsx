import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useMemo: (fn: () => unknown) => fn(),
}));
vi.mock('../../providers/NovaTransactionsLabelsProvider', () => ({ useLabels: () => defaultLabels }));
vi.mock('@tuwaio/nova-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/nova-core')>()),
  useCopyToClipboard: () => ({ isCopied: false, copy: vi.fn() }),
}));

import { TxErrorBlock } from './TxErrorBlock';

/** The name of the first button (at any depth of the element props). */
function buttonName(node: ReactNode): unknown {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = buttonName(child);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (node.type === 'button') return props['aria-label'];
  for (const value of Object.values(props)) {
    const found = buttonName(value as ReactNode);
    if (found !== undefined) return found;
  }
  return undefined;
}

// The button that copies the text of an error was named "Copy address"
describe('TxErrorBlock', () => {
  it('names its copy button as the copy of the error', () => {
    expect(buttonName(TxErrorBlock({ error: 'execution reverted' }))).toBe('Copy error');
  });
});
