import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastTransaction } from '@tuwaio/nova-transactions';
import { TransactionAdapter, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';

import { mockEvmAdapter, mockSolanaAdapter } from '../utils/mockAdapters';
import { createMockTx } from '../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof ToastTransaction> = {
  title: 'Components/Toast/ToastTransaction',
  component: ToastTransaction,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
      status: TransactionStatus.Success,
      pending: false,
    }),
    adapter: [mockEvmAdapter],
    connectedWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    openWalletInfoModal: () => console.log('openWalletInfoModal called'),
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display in the toast.',
    },
    adapter: {
      control: false,
      description: 'An array of configured adapters.',
    },
    connectedWalletAddress: {
      control: 'text',
      description: 'The address of the currently connected wallet, used to show/hide actions.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * A successfully completed EVM transaction. This is the default state.
 */
export const Success: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, { status: TransactionStatus.Success }),
  },
};

/**
 * A pending EVM transaction that can be sped up or cancelled. These actions are visible
 * because the transaction tracker is 'ethereum' and it belongs to the `connectedWalletAddress`.
 */
export const PendingWithActions: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      pending: true,
      status: undefined,
      tracker: TransactionTracker.Ethereum,
    }),
  },
};

/**
 * A pending Gelato transaction. The "Speed Up" and "Cancel" actions are correctly hidden
 * because the tracker is not 'ethereum'.
 */
export const PendingGelato: Story = {
  name: 'Pending (Gelato)',
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      pending: true,
      status: undefined,
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_12345',
      hash: undefined,
      title: 'Processing Gasless Tx...',
    }),
  },
};

/**
 * A failed EVM transaction, showing error styling.
 */
export const Failed: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      status: TransactionStatus.Failed,
      errorMessage: 'Transaction failed due to an unexpected error. Please try again.',
    }),
  },
};

/**
 * A transaction that was replaced (e.g., by a speed-up).
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      status: TransactionStatus.Replaced,
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
  },
};

/**
 * An example of a Solana transaction displayed in the toast.
 */
export const Solana: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.SOLANA, { pending: true, status: undefined }),
    adapter: [mockSolanaAdapter],
  },
};

/**
 * A transaction with a custom icon provided, overriding the default chain icon.
 */
export const WithCustomIcon: Story = {
  args: {
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-white">
        🦄
      </div>
    ),
  },
};

/**
 * An example of extensive customization, replacing all major sub-components of the toast.
 */
export const FullyCustomized: Story = {
  name: 'With Full Customization',
  args: {
    tx: createMockTx(TransactionAdapter.EVM, { pending: true, tracker: TransactionTracker.Ethereum }),
    customization: {
      components: {
        StatusBadge: () => (
          <div className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">CUSTOM</div>
        ),
        WalletInfoButton: ({ onClick, children }) => (
          <button onClick={onClick} className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
            {children}
          </button>
        ),
        SpeedUpButton: ({ onClick, children }) => (
          <button onClick={onClick} className="font-bold text-green-500">
            {children}
          </button>
        ),
      },
    },
  },
};
