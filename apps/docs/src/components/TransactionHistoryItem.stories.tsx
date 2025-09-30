import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionHistoryItem } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';

import { mockEvmAdapter, mockSolanaAdapter } from '../utils/mockAdapters';
import { createMockTx } from '../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionHistoryItem> = {
  title: 'Components/History/TransactionHistoryItem',
  component: TransactionHistoryItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  // The render function automatically creates the transactionsPool based on the tx arg.
  // This simplifies individual story definitions.
  render: (args) => {
    return <TransactionHistoryItem {...args} />;
  },
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Success,
      pending: false,
    }),
    adapter: [mockEvmAdapter],
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display.',
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
 * The default view for a successfully completed transaction.
 */
export const Success: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, { status: TransactionStatus.Success }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A pending transaction, showing the spinning icon in the status badge.
 */
export const Pending: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      pending: true,
      status: undefined,
      hash: undefined,
      localTimestamp: dayjs().subtract(30, 'seconds').unix(),
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A failed transaction, showing error styling.
 */
export const Failed: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Failed,
      errorMessage: 'Transaction failed due to an unexpected error.',
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A transaction that was replaced (e.g., sped up or cancelled).
 * The `TransactionKey` component will display both the original and replacing hashes.
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Replaced,
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A Gelato transaction, demonstrating how `TransactionKey` shows the `txKey` as a "Task ID".
 */
export const Gelato: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
      hash: '0x_on_chain_hash_from_gelato',
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * An example of a Solana transaction in the history view.
 */
export const Solana: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.SOLANA, { pending: true, status: undefined }),
    adapter: [mockSolanaAdapter],
  },
};

/**
 * A transaction with a custom title and description, replacing the default components.
 */
export const WithCustomization: Story = {
  name: 'With Custom Components',
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Success,
      pending: false,
    }),
    customization: {
      components: {
        Title: (props) => <div className="font-bold text-purple-600">✨ Custom Title: {props.fallback}</div>,
        Timestamp: ({ timestamp }) => (
          <div className="font-mono text-xs text-orange-500">⏰ {dayjs.unix(timestamp!).format('HH:mm:ss')}</div>
        ),
      },
    },
    adapter: [mockEvmAdapter],
  },
};
