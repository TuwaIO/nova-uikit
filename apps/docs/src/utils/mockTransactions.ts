import {
  EvmTransaction,
  InitialTransaction,
  SolanaTransaction,
  TransactionAdapter,
  TransactionTracker,
} from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { action } from 'storybook/actions';
import { zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';

/**
 * Creates a mock EVM or Solana transaction object for stories.
 * Dynamically adjusts fields based on the adapter.
 */
export const createMockTx = (
  adapterKey: TransactionAdapter,
  overrides: Partial<EvmTransaction | SolanaTransaction>,
): EvmTransaction | SolanaTransaction => {
  const baseTx = {
    adapter: adapterKey,
    tracker: adapterKey === TransactionAdapter.SOLANA ? TransactionTracker.Solana : TransactionTracker.Ethereum,
    txKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'storybook-action',
    chainId: mainnet.id,
    from: zeroAddress,
    pending: true,
    localTimestamp: dayjs().subtract(5, 'minutes').unix(),
    walletType: 'injected',
    status: undefined,
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
    title: ['Swapping tokens...', 'Swap successful!', 'Swap failed', 'Swap replaced'],
    description: [
      'Processing your token swap',
      'Your tokens have been swapped',
      'Token swap failed',
      'Swap was replaced',
    ],
    ...overrides,
  };
  return adapterKey === TransactionAdapter.EVM
    ? (baseTx as EvmTransaction)
    : ({
        ...baseTx,
        slot: 12345,
        recentBlockhash: 'mocked-recent-blockhash',
        confirmations: 3,
      } as SolanaTransaction);
};

/**
 * Creates a mock InitialTransaction object for stories.
 * Dynamically adjusts fields based on the adapter.
 */
export const createInitialTx = (
  adapterKey: TransactionAdapter,
  overrides: Partial<InitialTransaction> = {},
): InitialTransaction => {
  const baseInitialTx = {
    adapter: adapterKey,
    desiredChainID: adapterKey === TransactionAdapter.SOLANA ? 'devnet' : mainnet.id,
    type: 'Token Swap',
    title: 'Preparing Swap...',
    description: 'Please confirm in your wallet',
    withTrackedModal: true,
    isInitializing: true,
    localTimestamp: dayjs().unix(),
    actionFunction: async () => {
      action('retryAction')();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return undefined;
    },
    ...overrides,
  };
  return baseInitialTx;
};

// This is no longer necessary as it is being handled by the main createMockTx function
export const createMockSolanaTx = (overrides: Partial<SolanaTransaction> = {}): SolanaTransaction => {
  return createMockTx(TransactionAdapter.SOLANA, overrides) as SolanaTransaction;
};
