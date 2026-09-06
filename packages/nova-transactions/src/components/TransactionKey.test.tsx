import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TransactionKey } from './TransactionKey';

describe('TransactionKey component', () => {
  const mockAdapterConfig = {
    key: OrbitAdapter.EVM,
    getExplorerUrl: (url?: string) => url,
    getExplorerTxUrl: (tx: EvmTransaction) => `https://etherscan.io/tx/${tx.hash}`,
  } as unknown as TxAdapter<EvmTransaction>;

  const baseTx: EvmTransaction = {
    txKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    adapter: OrbitAdapter.EVM,
    tracker: TransactionTracker.Ethereum,
    chainId: 1,
    from: '0x1234567890123456789012345678901234567890',
    pending: true,
    type: 'TRANSFER',
    connectorType: 'injected',
    localTimestamp: Date.now(),
  };

  it('returns null if matching adapter cannot be found', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = TransactionKey({
      tx: baseTx,
      adapter: [], // Empty adapters array -> selectAdapterByKey returns undefined
    });

    expect(el).toBeNull();
    errorSpy.mockRestore();
  });

  it('renders hash container when valid adapter and hash are present', () => {
    const txWithHash: EvmTransaction = {
      ...baseTx,
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    };

    const el = TransactionKey({
      tx: txWithHash,
      adapter: mockAdapterConfig,
      variant: 'toast',
    }) as ReactElement<{ className: string; children: unknown }>;

    expect(el).not.toBeNull();
    expect(el.props.className).toContain('novatx:flex');
  });

  it('displays confirmation counter when confirmations count is provided', () => {
    const txWithHash: EvmTransaction = {
      ...baseTx,
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    };

    const el = TransactionKey({
      tx: txWithHash,
      adapter: mockAdapterConfig,
      confirmations: 3,
    }) as ReactElement<{ children: unknown[] }>;

    expect(el).not.toBeNull();
    const confirmationEl = el.props.children[2] as ReactElement<{ children: unknown[] }>;
    expect(confirmationEl).toBeDefined();
    expect(confirmationEl.props.children).toContain(3);
  });
});
