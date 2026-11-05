import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionStatus, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useMemo: (fn: () => unknown) => fn(),
  useEffect: () => {},
  useState: (initial: () => unknown) => [initial(), () => {}],
}));

vi.mock('../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TransactionDetails } from './TransactionDetails';

/** Whether a string that contains `text` is anywhere in the element tree (children and props). */
function containsText(node: ReactNode | unknown, text: string): boolean {
  if (typeof node === 'string') return node.includes(text);
  if (Array.isArray(node)) return node.some((child) => containsText(child, text));
  if (isValidElement(node))
    return Object.values(node.props as Record<string, unknown>).some((v) => containsText(v, text));
  return false;
}

describe('TransactionDetails', () => {
  it('does not show the RPC URL of the transaction, which may contain an API key', () => {
    const tx = {
      txKey: '0xabc',
      adapter: OrbitAdapter.EVM,
      tracker: TransactionTracker.Ethereum,
      chainId: 1,
      from: '0x1234567890123456789012345678901234567890',
      pending: false,
      status: TransactionStatus.Success,
      type: 'TRANSFER',
      connectorType: 'evm:metamask',
      localTimestamp: 1,
      rpcUrl: 'https://rpc.example/v2/secret-api-key',
    } as unknown as EvmTransaction;

    const element = TransactionDetails({
      tx,
      onBack: vi.fn(),
      adapter: { key: OrbitAdapter.EVM } as unknown as TxAdapter<EvmTransaction>,
    });

    expect(containsText(element, tx.txKey)).toBe(true);
    expect(containsText(element, 'secret-api-key')).toBe(false);
  });
});

describe('TransactionDetails of a replaced transaction', () => {
  const OLD = '0x1111111111111111111111111111111111111111111111111111111111111111';
  const NEW = '0x2222222222222222222222222222222222222222222222222222222222222222';
  const evmTx = (fields: Partial<EvmTransaction>) =>
    ({
      txKey: OLD,
      hash: OLD,
      adapter: OrbitAdapter.EVM,
      tracker: TransactionTracker.Ethereum,
      chainId: 1,
      from: '0x1234567890123456789012345678901234567890',
      pending: false,
      type: 'TRANSFER',
      connectorType: 'evm:metamask',
      localTimestamp: 1,
      ...fields,
    }) as EvmTransaction;
  const adapter = {
    key: OrbitAdapter.EVM,
    getExplorerTxUrl: (tx: EvmTransaction) => `https://scan/tx/${tx.replacedTxHash || tx.hash}`,
  } as unknown as TxAdapter<EvmTransaction>;
  const render = (tx: EvmTransaction, extra: Record<string, unknown> = {}) =>
    TransactionDetails({ tx, adapter, onBack: () => {}, ...extra });
  /** The EVM section is a component of its own, so it is rendered here by hand. */
  const evmSection = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(evmSection).find(Boolean);
    if (!isValidElement(node)) return undefined;
    const props = node.props as Record<string, unknown>;
    if (typeof props.linkOf === 'function') return (node.type as (p: unknown) => unknown)(props);
    return Object.values(props).map(evmSection).find(Boolean);
  };

  it('links the hash shown to that hash, and the replacing hash to its own', () => {
    const tree = render(evmTx({ status: TransactionStatus.Replaced, replacedTxHash: NEW }));

    expect(containsText(tree, `https://scan/tx/${OLD}`)).toBe(true);
    expect(containsText(evmSection(tree), `https://scan/tx/${NEW}`)).toBe(true);
  });

  it('the record that goes on names the one it replaced, with a link', () => {
    const tree = render(evmTx({ txKey: NEW, hash: NEW, pending: true, replaces: OLD }));

    const section = evmSection(tree);
    expect(containsText(section, defaultLabels.transactionDetails.replaces)).toBe(true);
    expect(containsText(section, `https://scan/tx/${OLD}`)).toBe(true);
  });

  const longPending = () => evmTx({ pending: true, localTimestamp: Math.floor(Date.now() / 1000) - 11 * 60 });

  it('offers to stop tracking a transaction pending for a long time', () => {
    const tree = render(longPending(), { onStopTracking: () => {} });

    expect(containsText(tree, defaultLabels.actions.stopTracking)).toBe(true);
    expect(containsText(tree, defaultLabels.transactionDetails.stopTrackingHint)).toBe(true);
  });

  it('does not offer it on a recent one: a slow transaction should simply be waited for', () => {
    const tree = render(evmTx({ pending: true, localTimestamp: Math.floor(Date.now() / 1000) - 60 }), {
      onStopTracking: () => {},
    });

    expect(containsText(tree, defaultLabels.actions.stopTracking)).toBe(false);
  });

  it('does not offer it on a finished one, or without the action', () => {
    expect(
      containsText(
        render(evmTx({ status: TransactionStatus.Success }), { onStopTracking: () => {} }),
        defaultLabels.actions.stopTracking,
      ),
    ).toBe(false);
    expect(containsText(render(longPending()), defaultLabels.actions.stopTracking)).toBe(false);
  });
});
