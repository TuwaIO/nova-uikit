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
  useNovaTransactionsError: () => ({ showPreSubmitErrorToast: vi.fn() }),
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
      tracker: TransactionTracker.ERC4337,
      requiredConfirmations: 3,
      bundlerUrl: 'https://bundler.example',
      pimlicoApiKey: 'key',
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
        // Without these a retried UserOperation went through the wrong tracker and lost its bundler
        tx: expect.objectContaining({
          desiredChainID: 1,
          actionFunction,
          tracker: TransactionTracker.ERC4337,
          requiredConfirmations: 3,
          bundlerUrl: 'https://bundler.example',
          pimlicoApiKey: 'key',
        }),
      }),
    );
  });
});

describe('TrackingTxModal actions', () => {
  const WALLET = '0x1234567890123456789012345678901234567890';
  const OLD = '0xold';
  const base = {
    txKey: OLD,
    adapter: OrbitAdapter.EVM,
    tracker: TransactionTracker.Ethereum,
    chainId: 1,
    from: WALLET,
    type: 'SWAP',
    connectorType: 'evm:metamask',
    localTimestamp: 1,
    isTrackedModalOpen: true,
  };
  const adapter = {
    key: OrbitAdapter.EVM,
    speedUpTxAction: vi.fn(),
    cancelTxAction: vi.fn(),
    retryTxAction: vi.fn(),
    getExplorerUrl: () => undefined,
  } as unknown as TxAdapter<EvmTransaction>;
  const initialTx = {
    lastTxKey: OLD,
    withTrackedModal: true,
    actionFunction: async () => OLD,
    adapter: OrbitAdapter.EVM,
    desiredChainID: 1,
    type: 'SWAP',
    localTimestamp: 1,
    isInitializing: false,
  } as unknown as InitialTransaction;
  const render = (tx: Partial<EvmTransaction>, connectedWalletAddress = WALLET) =>
    TrackingTxModal({
      adapter,
      initialTx,
      connectedWalletAddress,
      transactionsPool: { [OLD]: { ...base, ...tx } } as never,
      executeTxAction: vi.fn(),
      onClose: vi.fn(),
      onOpenAllTransactions: vi.fn(),
    });
  const footerProps = (tree: ReactNode) =>
    (findElement(tree, (props) => 'canReplace' in props) as ReactElement<Record<string, unknown>>).props;

  it('offers no Retry when the tracker only gave up: it could send the operation a second time', () => {
    const tree = render({
      pending: false,
      status: TransactionStatus.Failed,
      isError: true,
      error: { message: 'x' } as never,
    });

    expect(findRetryHandler(tree)).toBeUndefined();
  });

  it('offers Retry for a revert, which surely did not go through', () => {
    const tree = render({ pending: false, status: TransactionStatus.Failed, isError: true });

    expect(findRetryHandler(tree)).toEqual(expect.any(Function));
  });

  it('offers speed-up and cancel only to the account that sent it', () => {
    const pending = { pending: true, nonce: 7, maxFeePerGas: '1000', maxPriorityFeePerGas: '100' };

    expect(footerProps(render(pending)).onSpeedUp).toBeDefined();
    expect(footerProps(render(pending)).onCancel).toBeDefined();
    expect(footerProps(render(pending, '0x9999999999999999999999999999999999999999')).onSpeedUp).toBeUndefined();
  });

  it('lets the footer close during a long wait, whichever wallet sent the transaction: it may never end', () => {
    expect(footerProps(render({ pending: true })).canReplace).toBe(true);
    expect(footerProps(render({ pending: true, confirmations: 1 })).canReplace).toBe(false);
  });

  it('does not offer them before the tracker has read the nonce', () => {
    expect(footerProps(render({ pending: true })).onSpeedUp).toBeUndefined();
  });
});
