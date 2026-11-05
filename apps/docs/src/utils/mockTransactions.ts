import { OrbitAdapter, SOLANA_CHAIN_IDS } from '@tuwaio/orbit-core';
import { EvmTransaction, InitialTransaction, SolanaTransaction, TransactionTracker } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { action } from 'storybook/actions';
import { mainnet } from 'viem/chains';

/** A transaction of a Solana wallet is known by its base58 signature and has no hash. */
const SOLANA_SIGNATURE = '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW';

/**
 * Creates a mock EVM or Solana transaction object for stories.
 * Dynamically adjusts fields based on the adapter.
 */
export function createMockTx(adapterKey: OrbitAdapter, overrides: Record<string, any> = {}): any {
  const isSolana = adapterKey === OrbitAdapter.SOLANA;
  const baseTx = {
    adapter: adapterKey,
    tracker: isSolana ? TransactionTracker.Solana : TransactionTracker.Ethereum,
    txKey: isSolana ? SOLANA_SIGNATURE : '0x1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'storybook-action',
    chainId: isSolana ? SOLANA_CHAIN_IDS.mainnet : mainnet.id,
    from: isSolana ? '7Kx5wQ8P3nZ29vL1mY4x6tR0sB8vC3dE9fG1hJ2kL3mN' : '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    // A result ends the wait: a story that sets only the status would show a pending badge over a success title
    pending: overrides.status === undefined,
    localTimestamp: dayjs().subtract(5, 'minutes').unix(),
    connectorType: isSolana ? 'phantom' : 'injected',
    walletType: isSolana ? 'phantom' : 'injected',
    status: undefined,
    ...(isSolana
      ? { slot: 12345, recentBlockhash: 'GXRyAk5hqGFKPEpxUUAypCUcHXanCzCxECfu11jQe9nd', confirmations: 3 }
      : { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef' }),
    title: ['Swapping tokens...', 'Swap successful!', 'Swap failed', 'Swap replaced'],
    description: [
      'Processing your token swap',
      'Your tokens have been swapped',
      'Token swap failed',
      'Swap was replaced',
    ],
    ...overrides,
  };
  return baseTx as unknown as EvmTransaction | SolanaTransaction;
}

/**
 * Creates a mock InitialTransaction object for stories.
 * Dynamically adjusts fields based on the adapter.
 */
export const createInitialTx = (
  adapterKey: OrbitAdapter,
  overrides: Partial<InitialTransaction> = {},
): InitialTransaction => {
  const baseInitialTx = {
    adapter: adapterKey,
    desiredChainID: adapterKey === OrbitAdapter.SOLANA ? 'devnet' : mainnet.id,
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
  return createMockTx(OrbitAdapter.SOLANA, overrides) as SolanaTransaction;
};
