import { OrbitAdapter } from '@tuwaio/orbit-core';
import { type SolanaTransaction, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TransactionStatusBadge } from './TransactionStatusBadge';

/** The text of the label span of the badge. */
function labelOf(node: ReactNode): string | undefined {
  if (!isValidElement(node)) return undefined;
  const { children } = (node as ReactElement<{ children?: ReactNode }>).props;
  if (typeof children === 'string') return children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = labelOf(child);
    if (found) return found;
  }
  return undefined;
}

const solanaTx = (fields: Partial<SolanaTransaction>): SolanaTransaction => ({
  adapter: OrbitAdapter.SOLANA,
  tracker: TransactionTracker.Solana,
  txKey: 'signature',
  chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  from: 'address',
  type: 'transfer',
  connectorType: 'solana:phantom',
  localTimestamp: 1,
  pending: true,
  ...fields,
});

describe('TransactionStatusBadge', () => {
  it('shows a pending transaction as pending', () => {
    expect(labelOf(TransactionStatusBadge({ tx: solanaTx({}) }))).toBe(defaultLabels.statuses.pending);
    expect(labelOf(TransactionStatusBadge({ tx: solanaTx({ confirmationStatus: 'processed' }) }))).toBe(
      defaultLabels.statuses.pending,
    );
  });

  it('shows a pending transaction that reached the confirmed commitment as confirmed', () => {
    expect(labelOf(TransactionStatusBadge({ tx: solanaTx({ confirmationStatus: 'confirmed' }) }))).toBe(
      defaultLabels.statuses.confirmed,
    );
  });

  it('shows a finalized transaction as a success', () => {
    const tx = solanaTx({ pending: false, status: TransactionStatus.Success, confirmationStatus: 'finalized' });

    expect(labelOf(TransactionStatusBadge({ tx }))).toBe(defaultLabels.statuses.success);
  });
});
