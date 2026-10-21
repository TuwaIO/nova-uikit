import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, Transaction, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { describe, expect, it, vi } from 'vitest';

import { canReplaceTx } from './canReplaceTx';

const pendingTx = {
  txKey: '0xdef',
  adapter: OrbitAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  chainId: 1,
  from: '0x1234567890123456789012345678901234567890',
  pending: true,
  type: 'TRANSFER',
  connectorType: 'evm:metamask',
  localTimestamp: 1,
} as unknown as EvmTransaction;

const adapter = {
  key: OrbitAdapter.EVM,
  speedUpTxAction: vi.fn(),
  cancelTxAction: vi.fn(),
} as unknown as TxAdapter<Transaction>;

describe('canReplaceTx', () => {
  it('allows a pending, unconfirmed ethereum-tracker transaction sent with MetaMask', () => {
    expect(canReplaceTx(pendingTx, adapter)).toBe(true);
    expect(canReplaceTx({ ...pendingTx, confirmations: 0 }, adapter)).toBe(true);
  });

  it('refuses other wallets, confirmed or finished transactions and other trackers', () => {
    expect(canReplaceTx({ ...pendingTx, connectorType: 'evm:walletConnect' }, adapter)).toBe(false);
    expect(canReplaceTx({ ...pendingTx, confirmations: 1 }, adapter)).toBe(false);
    expect(canReplaceTx({ ...pendingTx, pending: false }, adapter)).toBe(false);
    expect(canReplaceTx({ ...pendingTx, tracker: TransactionTracker.Safe }, adapter)).toBe(false);
  });

  it('refuses when the adapter cannot speed up and cancel', () => {
    expect(canReplaceTx(pendingTx, { key: OrbitAdapter.EVM } as unknown as TxAdapter<Transaction>)).toBe(false);
    expect(canReplaceTx(pendingTx, undefined)).toBe(false);
    expect(canReplaceTx(undefined, adapter)).toBe(false);
  });
});
