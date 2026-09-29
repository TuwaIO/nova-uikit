import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionStatus, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useMemo: (fn: () => unknown) => fn(),
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
