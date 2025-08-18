import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsHistory } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { ComponentType } from 'react';
import { zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// --- Mocks and Helpers ---

/**
 * A helper function to create mock transaction objects for stories.
 */
const createMockTx = (overrides: Partial<Transaction<unknown>>): Transaction<unknown> => ({
  tracker: TransactionTracker.Ethereum,
  adapter: TransactionAdapter.EVM,
  txKey: `tx_${Math.random().toString(36).substr(2, 9)}`,
  type: 'Token Swap',
  chainId: mainnet.id,
  from: zeroAddress,
  pending: false,
  localTimestamp: dayjs().subtract(5, 'minutes').unix(),
  walletType: 'injected',
  status: TransactionStatus.Success,
  hash: `0x${Math.random().toString(16).padStart(64, '0')}`,
  title: ['Processing...', 'Success!', 'Failed', 'Replaced'],
  description: ['Processing transaction', 'Transaction completed', 'Transaction failed', 'Transaction replaced'],
  ...overrides,
});

/**
 * Creates a mock transactions pool with multiple transactions for the wallet.
 */
const createMockTransactionsPool = (walletAddress: string, txs: Transaction<unknown>[]) => {
  const pool: Record<string, Transaction<unknown>> = {};

  txs.forEach((tx) => {
    // Ensure all transactions are from the same wallet
    const txWithWallet = { ...tx, from: walletAddress };
    pool[tx.txKey] = txWithWallet;
    if (tx.adapter === TransactionAdapter.EVM && tx.hash && tx.hash !== tx.txKey) {
      pool[tx.hash] = txWithWallet;
    }
  });

  return pool;
};

/**
 * Creates a list of mock transactions with various states and types.
 */
const createMockTransactionsList = (): Transaction<unknown>[] => [
  createMockTx({
    type: 'Token Swap',
    status: TransactionStatus.Success,
    localTimestamp: dayjs().subtract(2, 'minutes').unix(),
    title: ['Swapping tokens...', 'Swap successful!', 'Swap failed', 'Swap replaced'],
    description: ['Processing token swap', 'Tokens swapped successfully', 'Swap failed', 'Swap was replaced'],
  }),
  createMockTx({
    tracker: TransactionTracker.Gelato,
    txKey: 'gelato_task_12345',
    type: 'Gasless Transfer',
    status: TransactionStatus.Success,
    chainId: sepolia.id,
    localTimestamp: dayjs().subtract(15, 'minutes').unix(),
    title: ['Processing transfer...', 'Transfer completed!', 'Transfer failed', 'Transfer replaced'],
    description: ['Processing gasless transfer', 'Transfer completed', 'Transfer failed', 'Transfer replaced'],
  }),
  createMockTx({
    type: 'NFT Mint',
    status: TransactionStatus.Failed,
    localTimestamp: dayjs().subtract(1, 'hour').unix(),
    title: ['Minting NFT...', 'NFT minted!', 'Mint failed', 'Mint replaced'],
    description: ['Minting your NFT', 'NFT minted successfully', 'Minting failed', 'Mint was replaced'],
  }),
  createMockTx({
    tracker: TransactionTracker.Safe,
    txKey: 'safe_tx_67890',
    type: 'Multi-sig Approval',
    status: undefined,
    pending: true,
    hash: undefined,
    localTimestamp: dayjs().subtract(30, 'seconds').unix(),
    title: ['Awaiting signatures...', 'Approved!', 'Rejected', 'Replaced'],
    description: ['Waiting for signatures', 'All signatures collected', 'Transaction rejected', 'Transaction replaced'],
  }),
  createMockTx({
    type: 'Token Transfer',
    status: TransactionStatus.Replaced,
    localTimestamp: dayjs().subtract(3, 'days').unix(),
    hash: '0x4444444444444444444444444444444444444444444444444444444444444444',
    replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    title: 'Old transfer (replaced)',
    description: 'This transfer was replaced by a faster one',
  }),
];

const mockWalletAddress = '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionsHistory> = {
  title: 'UI Components/TransactionsHistory/TransactionsHistory',
  component: TransactionsHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    walletAddress: mockWalletAddress,
    appChains: [mainnet, sepolia],
    transactionsPool: {},
  },
  argTypes: {
    walletAddress: {
      control: 'text',
      description: 'The connected wallet address',
    },
    transactionsPool: {
      control: 'object',
      description: 'The entire pool of transactions from the store',
    },
    appChains: {
      control: 'object',
      description: 'Array of all chains supported by the application',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes',
    },
    customization: {
      control: 'object',
      description: 'Customization options for the component',
      table: {
        type: {
          summary: 'TransactionsHistoryCustomization<TR, T>',
          detail: `{
  classNames?: {
    listWrapper?: string;
  };
  components?: {
    placeholder?: (props: { title: string; message: string }) => ReactNode;
    HistoryItem?: ComponentType<TransactionHistoryItemProps<TR, T>>;
  };
}`,
        },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Shows the component when no wallet is connected.
 */
export const NoWalletConnected: Story = {
  args: {
    walletAddress: undefined,
    transactionsPool: {},
  },
};

/**
 * Shows the component when wallet is connected but has no transactions.
 */
export const NoTransactions: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: {},
  },
};

/**
 * Shows the component with multiple transactions in various states.
 */
export const WithTransactions: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: createMockTransactionsPool(mockWalletAddress, createMockTransactionsList()),
  },
};

/**
 * Shows the component with only successful transactions.
 */
export const OnlySuccessful: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: createMockTransactionsPool(mockWalletAddress, [
      createMockTx({
        type: 'Token Swap',
        status: TransactionStatus.Success,
        localTimestamp: dayjs().subtract(5, 'minutes').unix(),
      }),
      createMockTx({
        type: 'NFT Purchase',
        status: TransactionStatus.Success,
        localTimestamp: dayjs().subtract(1, 'hour').unix(),
      }),
      createMockTx({
        type: 'Staking Reward',
        status: TransactionStatus.Success,
        localTimestamp: dayjs().subtract(1, 'day').unix(),
      }),
    ]),
  },
};

/**
 * Shows the component with only pending transactions.
 */
export const OnlyPending: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: createMockTransactionsPool(mockWalletAddress, [
      createMockTx({
        type: 'Token Approval',
        status: undefined,
        pending: true,
        hash: undefined,
        localTimestamp: dayjs().subtract(1, 'minute').unix(),
      }),
      createMockTx({
        type: 'Swap Transaction',
        status: undefined,
        pending: true,
        hash: undefined,
        localTimestamp: dayjs().subtract(30, 'seconds').unix(),
      }),
    ]),
  },
};

/**
 * Shows the component with many transactions to demonstrate scrolling.
 */
export const ManyTransactions: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: createMockTransactionsPool(
      mockWalletAddress,
      Array.from({ length: 15 }, (_, i) =>
        createMockTx({
          type: `Transaction ${i + 1}`,
          status: [TransactionStatus.Success, TransactionStatus.Failed, undefined][i % 3],
          pending: i % 3 === 2,
          hash: i % 3 === 2 ? undefined : `0x${i.toString().repeat(64)}`,
          localTimestamp: dayjs()
            .subtract(i * 10, 'minutes')
            .unix(),
          title: `Transaction ${i + 1} title`,
          description: `Description for transaction ${i + 1}`,
        }),
      ),
    ),
  },
};

/**
 * Demonstrates custom placeholder components.
 */
export const WithCustomPlaceholder: Story = {
  args: {
    walletAddress: undefined,
    transactionsPool: {},
    customization: {
      components: {
        placeholder: ({ title, message }) => (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-dashed border-purple-300 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h4 className="text-xl font-bold text-purple-600 mb-2">{title}</h4>
            <p className="text-purple-500 italic">{message}</p>
            <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Custom Connect Button
            </button>
          </div>
        ),
      },
    },
  },
};

/**
 * Demonstrates custom history item component.
 */
export const WithCustomHistoryItem: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: createMockTransactionsPool(mockWalletAddress, [
      createMockTx({
        type: 'Custom Transaction',
        status: TransactionStatus.Success,
        localTimestamp: dayjs().subtract(5, 'minutes').unix(),
      }),
    ]),
    customization: {
      components: {
        HistoryItem: ((props) => (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-l-4 border-green-500 p-4 m-2 rounded-r-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-semibold text-green-700">Custom: {props.tx.type}</div>
                <div className="text-sm text-green-600">
                  {props.tx.localTimestamp ? dayjs.unix(props.tx.localTimestamp).format('MMM DD, HH:mm') : 'No time'}
                </div>
              </div>
            </div>
          </div>
        )) as ComponentType<any>,
      },
    },
  },
};

/**
 * Demonstrates custom list wrapper styling.
 */
export const WithCustomStyling: Story = {
  args: {
    walletAddress: mockWalletAddress,
    transactionsPool: createMockTransactionsPool(mockWalletAddress, createMockTransactionsList().slice(0, 3)),
    customization: {
      classNames: {
        listWrapper: 'border-2 border-blue-300 bg-blue-50/50 rounded-xl shadow-lg',
      },
    },
    className: 'bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl',
  },
};
