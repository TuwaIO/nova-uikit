import { OrbitAdapter, SOLANA_CHAIN_IDS } from '@tuwaio/orbit-core';
import { EvmTransaction, Transaction, TransactionTracker } from '@tuwaio/pulsar-core';
import { action } from 'storybook/actions';
import { zeroAddress } from 'viem';
import { mainnet, monad, monadTestnet, polygon, sepolia } from 'viem/chains';

const EVM_CHAINS = [mainnet, monad, monadTestnet, polygon, sepolia];

/** The explorer of a chain the stories use. Etherscan for other chains. */
const evmExplorerOf = (chainId?: number | string) =>
  EVM_CHAINS.find((chain) => chain.id === Number(chainId))?.blockExplorers?.default.url ?? 'https://etherscan.io';

/** The query of a Solana explorer link: a devnet signature does not exist on mainnet. */
const solanaClusterOf = (chainId?: number | string) =>
  chainId === SOLANA_CHAIN_IDS.devnet || chainId === 'devnet' ? '?cluster=devnet' : '';

/**
 * A mock EVM adapter with a full set of default implementations for all possible methods.
 * @template T The specific EVM transaction type.
 */
export const mockEvmAdapter = {
  key: OrbitAdapter.EVM,

  /**
   * Get transaction explorer URL based on pool and transaction key.
   * @template T The specific transaction type.
   */
  getExplorerTxUrl: (tx: Transaction): string => {
    const hash = (tx.adapter === OrbitAdapter.EVM ? (tx as unknown as EvmTransaction)?.hash : undefined) || tx.txKey;
    return `${evmExplorerOf(tx.chainId)}/tx/${hash}`;
  },

  /**
   * Mock method to retrieve basic wallet information.
   */
  getWalletInfo: () => ({
    walletAddress: zeroAddress,
    walletType: 'injected',
  }),

  /**
   * Mock method to check the chain for a transaction.
   */
  checkChainForTx: async (): Promise<void> => {
    // No-op in the mock adapter
  },

  /**
   * Mock method to check transaction tracker data.
   */
  checkTransactionsTracker: () => ({
    txKey: '0x_mock_tx_key',
    tracker: TransactionTracker.Ethereum,
  }),

  /**
   * Mock method for initializing a transaction tracker in the store.
   */
  checkAndInitializeTrackerInStore: async () => {
    // No-op in the mock adapter
  },

  /**
   * Returns a URL of the explorer of the chain, with an optional path.
   */
  getExplorerUrl: (path = '', chainId?: number | string) => `${evmExplorerOf(chainId)}${path}`,

  /**
   * Mock method to handle speeding up a transaction: the call is reported in the Actions panel.
   */
  speedUpTxAction: async (tx: Transaction) => {
    action('speedUpTxAction')(tx);
    return '0x_mock_speed_up_hash';
  },

  /**
   * Mock method to handle canceling a transaction: the call is reported in the Actions panel.
   */
  cancelTxAction: async (tx: Transaction) => {
    action('cancelTxAction')(tx);
    return '0x_mock_cancel_hash';
  },

  /**
   * Optional retry method for transactions.
   */
  retryTxAction: async () => {
    action('retryAction')();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return undefined;
  },
} as any;

/**
 * A mock Solana adapter with a full set of default implementations for all possible methods.
 * @template T The specific Solana transaction type.
 */
export const mockSolanaAdapter = {
  key: OrbitAdapter.SOLANA,

  /**
   * Returns the explorer URL for a specific transaction based on the pool.
   * @template T The specific transaction type.
   */
  getExplorerTxUrl: (tx: Transaction): string => `https://solscan.io/tx/${tx.txKey}${solanaClusterOf(tx.chainId)}`,

  /**
   * Returns a URL of the explorer, with an optional path.
   */
  getExplorerUrl: (path = '', chainId?: number | string) => `https://solscan.io${path}${solanaClusterOf(chainId)}`,

  /**
   * Mock method to fetch basic wallet information (address).
   */
  getWalletInfo: () => ({
    walletAddress: 'mockedSolanaWalletAddress',
    walletType: 'solana',
  }),

  /**
   * Mock method to check the chain for details of a transaction.
   */
  checkChainForTx: async () => {
    // No-op for mock
  },

  /**
   * Mock method to check if a transaction tracker is available on Solana.
   */
  checkTransactionsTracker: () => ({
    txKey: '0x_mock_solana_tx_key',
    tracker: TransactionTracker.Solana,
  }),

  /**
   * Mock method to initialize transaction trackers in the store.
   */
  checkAndInitializeTrackerInStore: async () => {
    // No-op for mock
  },

  /**
   * Mock method to handle rerunning or retrying a transaction.
   */
  retryTxAction: async () => {
    action('retryAction')();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return undefined;
  },

  speedUpTxAction: async (tx: Transaction) => {
    action('speedUpTxAction')(tx);
    return 'mock_sol_speed_up_tx_hash';
  },

  cancelTxAction: async (tx: Transaction) => {
    action('cancelTxAction')(tx);
    return 'mock_sol_cancel_tx_hash';
  },
} as any;
