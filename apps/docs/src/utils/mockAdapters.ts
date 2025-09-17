import { Transaction, TransactionAdapter, TransactionTracker } from '@tuwaio/pulsar-core';
import { action } from 'storybook/actions';
import { zeroAddress } from 'viem';

/**
 * A mock EVM adapter with a full set of default implementations for all possible methods.
 * @template T The specific EVM transaction type.
 */
export const mockEvmAdapter = {
  key: TransactionAdapter.EVM,

  /**
   * Get transaction explorer URL based on pool and transaction key.
   * @template T The specific transaction type.
   */
  getExplorerTxUrl: (tx: Transaction): string => {
    return `https://etherscan.io/tx/${tx.adapter === TransactionAdapter.EVM ? tx?.hash : tx.txKey}`;
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
    txKey: 'mock',
    tracker: TransactionTracker.Ethereum,
  }),

  /**
   * Mock method for initializing a transaction tracker in the store.
   */
  checkAndInitializeTrackerInStore: async () => {
    // No-op in the mock adapter
  },

  /**
   * Returns a URL pointing to the chain explorer's home page.
   */
  getExplorerUrl: () => 'https://etherscan.io',

  /**
   * Mock method to handle speeding up a transaction.
   */
  speedUpTxAction: async (tx: Transaction) => {
    console.log('Speed Up Transaction:', tx);
    return '0x_mock_speed_up_hash';
  },

  /**
   * Mock method to handle canceling a transaction.
   */
  cancelTxAction: async (tx: Transaction) => {
    console.log('Cancel Transaction:', tx);
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
  key: TransactionAdapter.SOLANA,

  /**
   * Returns the explorer URL for a specific transaction based on the pool.
   * @template T The specific transaction type.
   */
  getExplorerTxUrl: (tx: Transaction): string => {
    return `https://solscan.io/tx/${tx.adapter === TransactionAdapter.EVM ? tx?.hash : tx.txKey}`;
  },

  /**
   * Returns the explorer root URL for the Solana blockchain.
   */
  getExplorerUrl: () => 'https://solscan.io',

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
    txKey: 'mock_solana_tx_key',
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

  // Solana-specific mock methods.
  getSlotUrl: (slot: number) => `https://solscan.io/block/${slot}`,
  speedUpTxAction: async (tx: Transaction) => {
    console.log('Speeding up Solana transaction:', tx);
    return 'mock_sol_speed_up_tx_hash';
  },

  cancelTxAction: async (tx: Transaction) => {
    console.log('Canceling Solana transaction:', tx);
    return 'mock_sol_cancel_tx_hash';
  },
} as any;
