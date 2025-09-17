import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsHistory } from '@tuwaio/nova-transactions';
import { TransactionAdapter, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';

import { mockEvmAdapter, mockSolanaAdapter } from '../utils/mockAdapters';
import { createMockTx } from '../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionsHistory> = {
  title: 'Components/History/TransactionsHistory',
  component: TransactionsHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  // The render function automatically creates the transactionsPool based on the tx arg.
  // This simplifies individual story definitions.
  render: (args) => {
    const transactionsPool = args.transactionsPool;
    return <TransactionsHistory {...args} transactionsPool={transactionsPool} />;
  },
  args: {
    connectedWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    transactionsPool: {
      ...[
        createMockTx(TransactionAdapter.EVM, {
          status: TransactionStatus.Success,
          localTimestamp: dayjs().subtract(2, 'minutes').unix(),
        }),
      ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    },
    adapter: [mockEvmAdapter],
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
    adapter: {
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
    connectedWalletAddress: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
    transactionsPool: {
      ...[
        createMockTx(TransactionAdapter.EVM, {
          status: TransactionStatus.Success,
          localTimestamp: dayjs().subtract(2, 'minutes').unix(),
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
        }),
        createMockTx(TransactionAdapter.EVM, {
          pending: true,
          status: undefined,
          hash: undefined,
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
          localTimestamp: dayjs().subtract(30, 'seconds').unix(),
        }),
        createMockTx(TransactionAdapter.EVM, {
          status: TransactionStatus.Failed,
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
          localTimestamp: dayjs().subtract(1, 'hour').unix(),
        }),
        createMockTx(TransactionAdapter.EVM, {
          tracker: TransactionTracker.Gelato,
          txKey: 'gelato_task_123',
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
          localTimestamp: dayjs().subtract(15, 'minutes').unix(),
        }),
        createMockTx(TransactionAdapter.SOLANA, {
          from: 'mockedSolanaWalletAddress',
          localTimestamp: dayjs().subtract(5, 'minutes').unix(),
        }),
      ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    },
    adapter: [mockEvmAdapter, mockSolanaAdapter],
  },
};

/**
 * Shows the placeholder when a wallet is connected but the transaction history is empty.
 */
export const NoTransactions: Story = {
  args: {
    connectedWalletAddress: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
    transactionsPool: {},
    adapter: [mockEvmAdapter],
  },
};

/**
 * Shows the placeholder when no wallet is connected. The component prompts the user to connect.
 */
export const NoWalletConnected: Story = {
  args: {
    connectedWalletAddress: undefined,
    transactionsPool: {},
    adapter: [mockEvmAdapter],
  },
};

/**
 * Demonstrates the list with a large number of transactions to verify scroll behavior.
 */
export const WithScrolling: Story = {
  args: {
    connectedWalletAddress: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
    transactionsPool: Array.from({ length: 15 }, (_, i) =>
      createMockTx(TransactionAdapter.EVM, {
        from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
        localTimestamp: dayjs()
          .subtract(i * 10, 'minutes')
          .unix(),
        type: `Transaction ${15 - i}`,
        status: [TransactionStatus.Success, TransactionStatus.Failed, undefined][i % 3],
        pending: i % 3 === 2,
      }),
    ).reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    adapter: [mockEvmAdapter],
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
    adapter: [mockEvmAdapter],
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
    adapter: [mockEvmAdapter],
  },
};
