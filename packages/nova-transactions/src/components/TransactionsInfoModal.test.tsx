import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionStatus, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('react', async () => ({
  ...(await vi.importActual<object>('react')),
  ...(await import('../testing/hookHarness')).hooks,
}));

vi.mock('../providers', () => ({
  useLabels: () => defaultLabels,
}));

const { render, unmount } = await import('../testing/hookHarness');
const { TransactionsInfoModal } = await import('./TransactionsInfoModal');
const { TransactionDetails } = await import('./TransactionDetails');
const { TransactionsHistory } = await import('./TransactionsHistory');

/** Finds the first element (at any depth of element props) that matches. */
function findElement(node: unknown, match: (element: ReactElement) => boolean): ReactElement | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, match);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  if (match(node)) return node;
  for (const value of Object.values(node.props as Record<string, unknown>)) {
    const found = findElement(value, match);
    if (found) return found;
  }
  return undefined;
}

/** Whether a string that contains `text` is anywhere in the element tree (children and props). */
function containsText(node: ReactNode | unknown, text: string): boolean {
  if (typeof node === 'string') return node.includes(text);
  if (Array.isArray(node)) return node.some((child) => containsText(child, text));
  if (isValidElement(node))
    return Object.values(node.props as Record<string, unknown>).some((v) => containsText(v, text));
  return false;
}

const address = '0x9c1E000000000000000000000000000000004F02';
const tx = {
  txKey: '0xaaa',
  hash: '0xaaa',
  adapter: OrbitAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  chainId: 1,
  from: address,
  pending: false,
  status: TransactionStatus.Success,
  type: 'transfer',
  connectorType: 'evm:metamask',
  localTimestamp: 1,
} as unknown as EvmTransaction;
const otherWalletTx = { ...tx, txKey: '0xbbb', hash: '0xbbb', from: '0x1111111111111111111111111111111111111111' };

const baseProps = {
  adapter: { key: OrbitAdapter.EVM } as unknown as TxAdapter<EvmTransaction>,
  connectedWalletAddress: address,
  transactionsPool: { [tx.txKey]: tx, [otherWalletTx.txKey]: otherWalletTx },
  setIsOpen: vi.fn(),
};
type Props = Parameters<typeof TransactionsInfoModal<EvmTransaction>>[0];
const renderModal = (props: Partial<Props>) =>
  render(TransactionsInfoModal<EvmTransaction>, { ...baseProps, isOpen: true, ...props } as Props);

const details = (element: unknown) => findElement(element, (e) => e.type === TransactionDetails);
const history = (element: unknown) => findElement(element, (e) => e.type === TransactionsHistory);
const header = (element: unknown) =>
  findElement(element, (e) => (e.props as { backLabel?: string }).backLabel !== undefined);

afterEach(() => unmount());

describe('TransactionsInfoModal', () => {
  it('shows the details of the selected transaction under one header with back, title and close', () => {
    const element = renderModal({ selectedTxKey: tx.txKey });

    expect(details(element)?.props).toMatchObject({ tx, hideHeader: true });
    expect(history(element)).toBeUndefined();
    expect(header(element)?.props).toMatchObject({ onBack: expect.any(Function) });
    expect(containsText(header(element), defaultLabels.transactionDetails.title)).toBe(true);
    expect(containsText(element, defaultLabels.transactionsModal.history.title)).toBe(false);
  });

  it('goes back to the list, and opens the details of a transaction selected there', () => {
    let element = renderModal({ selectedTxKey: tx.txKey });
    (header(element)?.props as { onBack: () => void }).onBack();

    element = renderModal({ selectedTxKey: tx.txKey });
    expect(details(element)).toBeUndefined();
    expect(header(element)?.props).toMatchObject({ onBack: undefined });
    expect(containsText(element, defaultLabels.transactionsModal.history.title)).toBe(true);

    (history(element)?.props as { onSelectTx: (txKey: string) => void }).onSelectTx(tx.txKey);
    expect(details(renderModal({ selectedTxKey: tx.txKey }))?.props).toMatchObject({ tx });
  });

  it('opens on the list after it was closed with the details open', () => {
    renderModal({ selectedTxKey: tx.txKey });
    renderModal({ isOpen: false, selectedTxKey: null });

    expect(details(renderModal({ selectedTxKey: null }))).toBeUndefined();
  });

  it('shows only transactions of the connected wallet', () => {
    expect(details(renderModal({ selectedTxKey: otherWalletTx.txKey }))).toBeUndefined();
  });
});
