import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionHistoryItem } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';

import { iso } from '../../../utils/customization/isometric';
import { withIsometricTheme } from '../../../utils/customization/IsometricFrame';
import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionHistoryItem> = {
  title: 'Nova Transactions/History/TransactionHistoryItem',
  component: TransactionHistoryItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
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
 * A pending transaction: the status badge shows the Quasar loader in the pending colors.
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
      error: { message: 'Transaction failed due to an unexpected error.', raw: {} },
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * The record that goes on after a speed-up, with the hash it replaced.
 */
export const AfterSpeedUp: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      pending: false,
      status: TransactionStatus.Success,
      hash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      replaces: '0x4444444444444444444444444444444444444444444444444444444444444444',
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A cancelled transaction: replaced by something else than a speed-up, as a sped-up record has no row of its own.
 * The `TransactionKey` component displays both the original and the replacing hash.
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Replaced,
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      replacedReason: 'cancelled',
      title: ['Swapping tokens...', 'Swap successful!', 'Swap failed', 'Swap cancelled'],
      description: [
        'Processing your token swap',
        'Your tokens have been swapped',
        'Token swap failed',
        'The swap was cancelled',
      ],
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
 * A transaction with a custom title and timestamp, replacing the default components.
 */
export const WithCustomization: Story = {
  name: 'With Custom Components',
  decorators: [withIsometricTheme],
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Success,
      pending: false,
    }),
    customization: {
      components: {
        Title: (props) => <div className={`text-sm ${iso.text.strong} ${iso.text.primary}`}>{props.fallback}</div>,
        Timestamp: ({ timestamp }) => (
          <div className={`mb-1 ${iso.sectionTitle}`}>{dayjs.unix(timestamp!).format('HH:mm:ss')}</div>
        ),
      },
    },
    adapter: [mockEvmAdapter],
  },
};
