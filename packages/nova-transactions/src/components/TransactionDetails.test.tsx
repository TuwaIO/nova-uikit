import { OrbitAdapter } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  SolanaTransaction,
  Transaction,
  TransactionStatus,
  TransactionTracker,
  TxAdapter,
} from '@tuwaio/pulsar-core';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useMemo: (fn: () => unknown) => fn(),
}));

vi.mock('../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TransactionDetails, TransactionDetailsProps } from './TransactionDetails';

/** Whether a string that contains `text` is anywhere in the element tree (children and props). */
function containsText(node: ReactNode | unknown, text: string): boolean {
  if (typeof node === 'string') return node.includes(text);
  if (Array.isArray(node)) return node.some((child) => containsText(child, text));
  if (isValidElement(node))
    return Object.values(node.props as Record<string, unknown>).some((v) => containsText(v, text));
  return false;
}

/** The props the tests read from the found elements. */
type ElementProps = { onClick?: () => void; onBack?: () => void; href?: string; label?: string };

/** Finds the first element (at any depth of element props) whose props match. */
function findElement(
  node: ReactNode | unknown,
  match: (props: Record<string, unknown>) => boolean,
): ReactElement<ElementProps> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, match);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (match(props)) return node as ReactElement<ElementProps>;
  for (const value of Object.values(props)) {
    const found = findElement(value, match);
    if (found) return found;
  }
  return undefined;
}

const byLabel = (label: string) => (props: Record<string, unknown>) => props['aria-label'] === label;
/** The header parts (`HeaderContent`, not rendered by this shallow test) with this back button label. */
const byBackLabel = (label: string) => (props: Record<string, unknown>) => props.backLabel === label;
const byText = (text: string) => (props: Record<string, unknown>) =>
  typeof props.onClick === 'function' || typeof props.href === 'string' ? containsText(props.children, text) : false;

const evmTx = {
  txKey: '0x8f3c2d00000000000000000000000000000000000000000000000000007b10a91e',
  hash: '0x8f3c2d00000000000000000000000000000000000000000000000000007b10a91e',
  adapter: OrbitAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  chainId: 84532,
  from: '0x9c1E000000000000000000000000000000004F02',
  to: '0x5A3f00000000000000000000000000000000E1c9',
  pending: false,
  status: TransactionStatus.Success,
  type: 'transfer',
  connectorType: 'evm:metamask',
  localTimestamp: 1_791_796_438,
  finishedTimestamp: 1_791_796_446,
} as unknown as EvmTransaction;

const solanaTx = {
  txKey: '5Kd9tR2w',
  adapter: OrbitAdapter.SOLANA,
  tracker: TransactionTracker.Solana,
  chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  from: '7xKXgAsU',
  pending: false,
  status: TransactionStatus.Success,
  type: 'transfer',
  connectorType: 'solana:phantom',
  localTimestamp: 1_791_796_438,
  fee: 5000,
  slot: 412_118_903,
} as unknown as SolanaTransaction;

const explorerUrl = 'https://sepolia.basescan.org/tx/0x8f3c';

function renderDetails<T extends Transaction>(
  tx: T,
  props: Partial<TransactionDetailsProps<T>> = {},
  adapterFields: Record<string, unknown> = {},
) {
  const adapter = {
    key: tx.adapter,
    getExplorerTxUrl: () => explorerUrl,
    ...adapterFields,
  } as unknown as TxAdapter<T>;
  return TransactionDetails({ tx, onBack: vi.fn(), adapter, ...props });
}

describe('TransactionDetails', () => {
  it('does not show the RPC URL of the transaction, which may contain an API key', () => {
    const element = renderDetails({ ...evmTx, rpcUrl: 'https://rpc.example/v2/secret-api-key' } as EvmTransaction);

    expect(containsText(element, evmTx.txKey)).toBe(true);
    expect(containsText(element, 'secret-api-key')).toBe(false);
  });

  it('has one header with the back button, the title and, in a modal, the close button', () => {
    const onBack = vi.fn();
    const onClose = vi.fn();
    const element = renderDetails(evmTx, { onBack, onClose });

    findElement(element, byBackLabel(defaultLabels.transactionDetails.back))?.props.onBack?.();
    findElement(element, byLabel(defaultLabels.actions.close))?.props.onClick?.();
    expect(onBack).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(containsText(element, defaultLabels.transactionDetails.title)).toBe(true);

    expect(findElement(renderDetails(evmTx), byLabel(defaultLabels.actions.close))).toBeUndefined();
    const withoutHeader = renderDetails(evmTx, { hideHeader: true });
    expect(findElement(withoutHeader, byBackLabel(defaultLabels.transactionDetails.back))).toBeUndefined();
    expect(containsText(withoutHeader, defaultLabels.transactionDetails.title)).toBe(false);
  });

  it('links a finished transaction to the explorer and offers no speed-up', () => {
    const element = renderDetails(evmTx, {}, { speedUpTxAction: vi.fn(), cancelTxAction: vi.fn() });

    expect(findElement(element, byText(defaultLabels.actions.viewOnExplorer))?.props.href).toBe(explorerUrl);
    expect(findElement(element, byText(defaultLabels.actions.speedUp))).toBeUndefined();
  });

  it('offers speed-up and cancel for a pending transaction sent with MetaMask, as the tracking modal does', () => {
    const speedUpTxAction = vi.fn();
    const cancelTxAction = vi.fn();
    const pendingTx = { ...evmTx, pending: true, status: undefined, finishedTimestamp: undefined } as EvmTransaction;
    const element = renderDetails(pendingTx, {}, { speedUpTxAction, cancelTxAction });

    findElement(element, byText(defaultLabels.actions.speedUp))?.props.onClick?.();
    findElement(element, byText(defaultLabels.actions.cancel))?.props.onClick?.();
    expect(speedUpTxAction).toHaveBeenCalledWith(pendingTx);
    expect(cancelTxAction).toHaveBeenCalledWith(pendingTx);
    expect(findElement(element, byText(defaultLabels.actions.viewOnExplorer))).toBeUndefined();

    const walletConnect = renderDetails(
      { ...pendingTx, connectorType: 'evm:walletConnect' },
      {},
      { speedUpTxAction, cancelTxAction },
    );
    expect(findElement(walletConnect, byText(defaultLabels.actions.speedUp))).toBeUndefined();
  });

  it('shows the TX key only when it differs from the hash (Safe, Gelato)', () => {
    expect(containsText(renderDetails(evmTx), defaultLabels.transactionDetails.txKey)).toBe(false);

    const safeTx = { ...evmTx, txKey: '0xsafe', tracker: TransactionTracker.Safe } as EvmTransaction;
    const element = renderDetails(safeTx);
    expect(containsText(element, defaultLabels.transactionDetails.txKey)).toBe(true);
    expect(containsText(element, '0xsafe')).toBe(true);
  });

  it('shows the confirmations only while the transaction is pending', () => {
    const pending = { ...evmTx, pending: true, status: undefined, confirmations: 1, requiredConfirmations: 3 };
    expect(containsText(renderDetails(pending as EvmTransaction), '1 / 3')).toBe(true);

    const finished = { ...evmTx, confirmations: 5, requiredConfirmations: 3 } as EvmTransaction;
    expect(containsText(renderDetails(finished), defaultLabels.transactionDetails.confirmations)).toBe(false);
  });

  it('shows the fees of EVM transactions in gwei and of Solana transactions in SOL', () => {
    const evmElement = renderDetails({
      ...evmTx,
      nonce: 12,
      maxFeePerGas: '1200000000',
      maxPriorityFeePerGas: '100000000',
      value: '0',
    } as EvmTransaction);
    expect(containsText(evmElement, defaultLabels.transactionDetails.evmTitle)).toBe(true);
    expect(containsText(evmElement, '1.2 gwei')).toBe(true);
    expect(containsText(evmElement, '0.1 gwei')).toBe(true);

    const solanaElement = renderDetails(solanaTx);
    expect(containsText(solanaElement, defaultLabels.transactionDetails.solanaTitle)).toBe(true);
    expect(containsText(solanaElement, '0.000005 SOL')).toBe(true);
  });

  it('shows the title and description of the status and the error in the context card', () => {
    const failedTx = {
      ...evmTx,
      status: TransactionStatus.Failed,
      title: ['Paying order #1042', 'Paid order #1042', 'Order #1042 not paid', 'Payment replaced'],
      description: 'Cosmos hoodie',
      error: { message: 'execution reverted' },
    } as unknown as EvmTransaction;
    const element = renderDetails(failedTx);

    expect(containsText(element, defaultLabels.transactionDetails.contextTitle)).toBe(true);
    expect(containsText(element, 'Order #1042 not paid')).toBe(true);
    expect(containsText(element, 'Paying order #1042')).toBe(false);
    expect(containsText(element, 'Cosmos hoodie')).toBe(true);
    expect(
      findElement(element, (props) => props.label === defaultLabels.transactionDetails.errorContext),
    ).toBeDefined();
  });

  it('leaves out the cards without data', () => {
    const element = renderDetails(evmTx);

    expect(containsText(element, defaultLabels.transactionDetails.metadata)).toBe(true);
    expect(containsText(element, defaultLabels.transactionDetails.evmTitle)).toBe(false);
    expect(containsText(element, defaultLabels.transactionDetails.contextTitle)).toBe(false);
  });
});
