import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('../providers/NovaTransactionsLabelsProvider', () => ({ useLabels: () => defaultLabels }));
vi.mock('@tuwaio/nova-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/nova-core')>()),
  useCopyToClipboard: () => ({ isCopied: false, copy: vi.fn() }),
}));

import { HashLink } from './HashLink';

/** The name of the first button (at any depth of the element props), which copies. */
function copyButtonName(node: ReactNode): unknown {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = copyButtonName(child);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (node.type === 'button') return props['aria-label'];
  for (const value of Object.values(props)) {
    const found = copyButtonName(value as ReactNode);
    if (found !== undefined) return found;
  }
  return undefined;
}

// The copy button of a transaction hash was named "Copy address", in a toast and in the details, in every language
describe('HashLink', () => {
  it('names its copy button by what it copies: a hash unless told otherwise', () => {
    expect(copyButtonName(HashLink({ hash: '0x8f3c2d' }))).toBe('Copy hash');
    expect(copyButtonName(HashLink({ hash: '412118903', copyLabel: 'Copy slot' }))).toBe('Copy slot');
  });
});
