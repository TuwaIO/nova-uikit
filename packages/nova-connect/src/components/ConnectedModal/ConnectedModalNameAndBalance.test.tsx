import { isValidElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: (fn: unknown) => fn,
}));

let copyResult: { copied: true } | { copied: false; error: Error } = { copied: true };
const copy = vi.fn(async () => copyResult);

vi.mock('@tuwaio/nova-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/nova-core')>()),
  useCopyToClipboard: () => ({ copy, isCopied: false, error: null }),
}));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
}));

const address = '0x1234567890123456789012345678901234567890';

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection: { address, connectorType: 'evm:metamask', isConnected: true, chainId: 1 } }),
}));

import { ConnectedModalNameAndBalance, type ConnectedModalNameAndBalanceProps } from './ConnectedModalNameAndBalance';

/** Finds the first `onCopy` prop in the element tree (children and props). */
function findOnCopy(node: ReactNode | unknown): (() => Promise<void>) | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findOnCopy(child);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (typeof props.onCopy === 'function') return props.onCopy as () => Promise<void>;
  for (const value of Object.values(props)) {
    const found = findOnCopy(value);
    if (found) return found;
  }
  return undefined;
}

function renderOnCopy(handlers: { onCopySuccess: () => void; onCopyError: () => void }) {
  const render = (
    ConnectedModalNameAndBalance as unknown as {
      render: (props: ConnectedModalNameAndBalanceProps, ref: null) => unknown;
    }
  ).render;
  const onCopy = findOnCopy(
    render(
      {
        balance: null,
        ensNameAbbreviated: undefined,
        balanceLoading: false,
        refetch: vi.fn(),
        customization: { handlers, config: { disableAnimation: true } },
      },
      null,
    ),
  );
  expect(onCopy).toBeDefined();
  return onCopy!;
}

describe('ConnectedModalNameAndBalance', () => {
  beforeEach(() => {
    copy.mockClear();
  });

  it('calls onCopySuccess after the address is copied', async () => {
    copyResult = { copied: true };
    const handlers = { onCopySuccess: vi.fn(), onCopyError: vi.fn() };

    await renderOnCopy(handlers)();

    expect(copy).toHaveBeenCalledWith(address);
    expect(handlers.onCopySuccess).toHaveBeenCalledWith(address);
    expect(handlers.onCopyError).not.toHaveBeenCalled();
  });

  it('calls onCopyError, not onCopySuccess, when the clipboard write fails', async () => {
    const error = new Error('Clipboard permission denied');
    copyResult = { copied: false, error };
    const handlers = { onCopySuccess: vi.fn(), onCopyError: vi.fn() };

    await renderOnCopy(handlers)();

    expect(handlers.onCopyError).toHaveBeenCalledWith(error, address);
    expect(handlers.onCopySuccess).not.toHaveBeenCalled();
  });
});
