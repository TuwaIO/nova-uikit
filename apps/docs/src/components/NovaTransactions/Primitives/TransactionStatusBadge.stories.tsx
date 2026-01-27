import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionStatusBadge } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';

import { createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof TransactionStatusBadge> = {
  title: 'Nova Transactions/Primitives/TransactionStatusBadge',
  component: TransactionStatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    // Default to the 'Pending' state for the main component view
    tx: createMockTx(OrbitAdapter.EVM, { pending: true, status: undefined }),
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object whose status will be displayed.',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the badge container.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The `pending` state is shown when a transaction has been submitted but not yet finalized.
 */
export const Pending: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, { pending: true, status: undefined }),
  },
};

/**
 * The `Success` state is shown for a successfully completed transaction.
 */
export const Success: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, { pending: false, status: TransactionStatus.Success }),
  },
};

/**
 * The `Failed` state is shown for a reverted or failed transaction.
 */
export const Failed: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, { pending: false, status: TransactionStatus.Failed, isError: true }),
  },
};

/**
 * The `Replaced` state is shown when a transaction has been replaced (e.g., sped up or cancelled).
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, { pending: false, status: TransactionStatus.Replaced }),
  },
};
