import { OrbitAdapter } from '@tuwaio/orbit-core';
import { SolanaTransaction, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('../../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TxInfoBlock } from './TxInfoBlock';

/** Finds the props of the first element (at any depth of `children` and element props) with the given `hash` prop. */
function findHashLinkProps(node: ReactNode, hash: string): Record<string, unknown> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findHashLinkProps(child, hash);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (props.hash === hash) return props;
  for (const value of Object.values(props)) {
    const found = findHashLinkProps(value as ReactNode, hash);
    if (found) return found;
  }
  return undefined;
}

describe('TxInfoBlock', () => {
  it('links the Solana slot to the explorer of the transaction cluster', () => {
    const getExplorerUrl = vi.fn((url?: string, chainId?: string | number) => `explorer${url}?cluster=${chainId}`);
    const adapter = { key: OrbitAdapter.SOLANA, getExplorerUrl } as unknown as TxAdapter<SolanaTransaction>;
    const tx = {
      txKey: 'signature',
      adapter: OrbitAdapter.SOLANA,
      tracker: TransactionTracker.Solana,
      chainId: 'devnet',
      from: 'address',
      pending: false,
      type: 'TRANSFER',
      connectorType: 'solana:phantom',
      localTimestamp: 1,
      slot: 42,
    } as unknown as SolanaTransaction;

    const element = TxInfoBlock({ tx, adapter });

    expect(getExplorerUrl).toHaveBeenCalledWith('/block/42', 'devnet');
    expect(findHashLinkProps(element, '42')?.explorerUrl).toBe('explorer/block/42?cluster=devnet');
  });
});
