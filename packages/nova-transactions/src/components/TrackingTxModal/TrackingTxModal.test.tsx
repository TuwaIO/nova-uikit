import { OrbitAdapter } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  InitialTransaction,
  Transaction,
  TransactionStatus,
  TransactionTracker,
  TxAdapter,
} from '@tuwaio/pulsar-core';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('../../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TrackingTxModal } from './TrackingTxModal';

/** Finds the first element props (at any depth of element props) that have a function `onRetry`. */
function findRetryHandler(node: ReactNode): (() => void) | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findRetryHandler(child);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (typeof props.onRetry === 'function') return props.onRetry as () => void;
  for (const value of Object.values(props)) {
    const found = findRetryHandler(value as ReactNode);
    if (found) return found;
  }
  return undefined;
}

/** Finds the first element (at any depth of element props) whose props match. */
function findElement(node: ReactNode, match: (props: Record<string, unknown>) => boolean): ReactElement | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, match);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (match(props)) return node;
  for (const value of Object.values(props)) {
    const found = findElement(value as ReactNode, match);
    if (found) return found;
  }
  return undefined;
}

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
  isTrackedModalOpen: true,
} as unknown as EvmTransaction;

describe('TrackingTxModal', () => {
  it('applies motionProps to the content and keeps the default classes of the dialog panel', () => {
    const element = TrackingTxModal({
      adapter: { key: OrbitAdapter.EVM } as unknown as TxAdapter<Transaction>,
      transactionsPool: { '0xdef': pendingTx },
      initialTx: {
        adapter: OrbitAdapter.EVM,
        lastTxKey: '0xdef',
        withTrackedModal: true,
      } as unknown as InitialTransaction,
      executeTxAction: vi.fn(),
      onClose: vi.fn(),
      onOpenAllTransactions: vi.fn(),
      customization: {
        modalProps: { className: 'custom-panel' },
        motionProps: { initial: { opacity: 0 }, animate: { opacity: 1 } },
      },
    });

    const content = findElement(element, (props) => props.initial !== undefined);
    expect(content?.props).toMatchObject({ initial: { opacity: 0 }, animate: { opacity: 1 } });

    const panel = findElement(
      element,
      (props) => typeof props.className === 'string' && props.className.includes('custom-panel'),
    );
    expect(panel?.props).toMatchObject({ className: expect.stringContaining('novatx:w-full') });
  });

  it('retries a failed EVM transaction without an RPC URL', () => {
    const retryTxAction = vi.fn();
    const adapter = { key: OrbitAdapter.EVM, retryTxAction } as unknown as TxAdapter<EvmTransaction>;
    const actionFunction = vi.fn();
    const executeTxAction = vi.fn();
    const failedTx = {
      txKey: '0xabc',
      adapter: OrbitAdapter.EVM,
      tracker: TransactionTracker.Ethereum,
      chainId: 1,
      from: '0x1234567890123456789012345678901234567890',
      pending: false,
      isError: true,
      status: TransactionStatus.Failed,
      type: 'TRANSFER',
      connectorType: 'evm:metamask',
      localTimestamp: 1,
      isTrackedModalOpen: true,
    } as unknown as EvmTransaction;
    const initialTx = {
      adapter: OrbitAdapter.EVM,
      type: 'TRANSFER',
      desiredChainID: 1,
      actionFunction,
      lastTxKey: '0xabc',
      localTimestamp: 1,
      withTrackedModal: true,
    } as unknown as InitialTransaction;

    const element = TrackingTxModal({
      adapter,
      initialTx,
      executeTxAction,
      transactionsPool: { '0xabc': failedTx },
      onClose: vi.fn(),
      onOpenAllTransactions: vi.fn(),
    });
    const onRetry = findRetryHandler(element);

    expect(onRetry).toBeDefined();
    expect(() => onRetry!()).not.toThrow();
    expect(retryTxAction).toHaveBeenCalledWith(
      expect.objectContaining({
        txKey: '0xabc',
        executeTxAction,
        tx: expect.objectContaining({ desiredChainID: 1, actionFunction, rpcUrl: undefined }),
      }),
    );
  });
});
