import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsHistory } from '@tuwaio/nova-transactions';
import { EvmTransaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';

// --- Mocks and Helpers ---

const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: `0x_tx_${Math.random().toString(16).slice(2)}`,
  type: 'Token Swap',
  chainId: mainnet.id,
  from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
  pending: false,
  localTimestamp: dayjs().unix(),
  walletType: 'injected',
  status: TransactionStatus.Success,
  hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
  title: 'Swap Tokens',
  ...overrides,
});

const mockEvmAdapter = {
  key: TransactionAdapter.EVM,
  getExplorerTxUrl: (pool: any, txKey: string) => `https://etherscan.io/tx/${pool[txKey]?.hash}`,
  // ... other required adapter methods
  getWalletInfo: () => ({ walletAddress: zeroAddress, walletType: 'injected' }),
  checkChainForTx: async () => {},
  checkTransactionsTracker: () => ({ txKey: 'mock', tracker: TransactionTracker.Ethereum }),
  checkAndInitializeTrackerInStore: async () => {},
  getExplorerUrl: () => 'https://etherscan.io',
};

const mockWalletAddress = '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionsHistory> = {
  title: 'Components/History/TransactionsHistory',
  component: TransactionsHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    adapters: [mockEvmAdapter as any],
  },
  argTypes: {
    connectedWalletAddress: {
      control: 'text',
      description: 'The address of the currently connected wallet.',
    },
    transactionsPool: {
      control: 'object',
      description: 'The entire pool of transactions from the store.',
    },
    adapters: {
      control: false,
      description: 'An array of configured adapters.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default state, showing a variety of transactions for the connected wallet.
 * The list is automatically sorted with the newest transactions first.
 */
export const Default: Story = {
  args: {
    connectedWalletAddress: mockWalletAddress,
    transactionsPool: {
      ...[
        createMockTx({ status: TransactionStatus.Success, localTimestamp: dayjs().subtract(2, 'minutes').unix() }),
        createMockTx({ pending: true, status: undefined, localTimestamp: dayjs().subtract(30, 'seconds').unix() }),
        createMockTx({ status: TransactionStatus.Failed, localTimestamp: dayjs().subtract(1, 'hour').unix() }),
        createMockTx({
          tracker: TransactionTracker.Gelato,
          txKey: 'gelato_task_123',
          localTimestamp: dayjs().subtract(15, 'minutes').unix(),
        }),
      ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    },
  },
};

/**
 * Shows the placeholder when a wallet is connected but the transaction history is empty.
 */
export const NoTransactions: Story = {
  args: {
    connectedWalletAddress: mockWalletAddress,
    transactionsPool: {},
  },
};

/**
 * Shows the placeholder when no wallet is connected. The component prompts the user to connect.
 */
export const NoWalletConnected: Story = {
  args: {
    connectedWalletAddress: undefined,
    transactionsPool: {},
  },
};

/**
 * Demonstrates the list with a large number of transactions to verify scroll behavior.
 */
export const WithScrolling: Story = {
  args: {
    connectedWalletAddress: mockWalletAddress,
    transactionsPool: Array.from({ length: 15 }, (_, i) =>
      createMockTx({
        localTimestamp: dayjs()
          .subtract(i * 10, 'minutes')
          .unix(),
        type: `Transaction ${15 - i}`,
        status: [TransactionStatus.Success, TransactionStatus.Failed, undefined][i % 3],
        pending: i % 3 === 2,
      }),
    ).reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
  },
};

/**
 * An example of customizing the placeholder component for the "Connect Wallet" state.
 */
export const WithCustomPlaceholder: Story = {
  args: {
    ...NoWalletConnected.args,
    customization: {
      components: {
        Placeholder: ({ title, message }) => (
          <div className="rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-12 text-center">
            <div className="mb-4 text-6xl">🔗</div>
            <h4 className="mb-2 text-xl font-bold text-purple-600">{title}</h4>
            <p className="italic text-purple-500">{message}</p>
          </div>
        ),
      },
    },
  },
};

/**
 * An example of replacing the default `TransactionHistoryItem` with a completely custom component.
 */
export const WithCustomHistoryItem: Story = {
  args: {
    ...Default.args,
    customization: {
      components: {
        HistoryItem: ({ tx }) => (
          <div className="m-2 rounded-r-lg border-l-4 border-green-500 bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4">
            <div className="font-semibold text-green-700">Custom Item: {tx.type}</div>
          </div>
        ),
      },
    },
  },
};
