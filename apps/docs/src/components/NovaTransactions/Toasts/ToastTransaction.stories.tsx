import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastTransaction } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { action } from 'storybook/actions';

import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof ToastTransaction> = {
  title: 'Nova Transactions/Toasts/ToastTransaction',
  component: ToastTransaction,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
      status: TransactionStatus.Success,
      pending: false,
    }),
    adapter: [mockEvmAdapter],
    connectedWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    openTxInfoModal: action('openTxInfoModal'),
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
    tx: createMockTx(OrbitAdapter.EVM, { status: TransactionStatus.Success }),
  },
};

/**
 * A pending EVM transaction that can be sped up or cancelled: its tracker is 'ethereum', MetaMask sent it from the
 * `connectedWalletAddress`, and the tracker has read its nonce and fees.
 */
export const PendingWithActions: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      pending: true,
      status: undefined,
      tracker: TransactionTracker.Ethereum,
      connectorType: 'evm:metamask',
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      nonce: 7,
      maxFeePerGas: '1000',
      maxPriorityFeePerGas: '100',
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
    tx: createMockTx(OrbitAdapter.EVM, {
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
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Failed,
      error: { message: 'Transaction failed due to an unexpected error. Please try again.', raw: {} },
    }),
  },
};

/**
 * A transaction replaced by something else than a speed-up. The toast stays on its record and shows both hashes: only after a
 * speed-up it goes on with the record of the new hash.
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Replaced,
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      replacedReason: 'replaced',
    }),
  },
};

/**
 * An example of a Solana transaction displayed in the toast.
 */
export const Solana: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.SOLANA, { pending: true, status: undefined }),
    adapter: [mockSolanaAdapter],
    connectedWalletAddress: '7Kx5wQ8P3nZ29vL1mY4x6tR0sB8vC3dE9fG1hJ2kL3mN',
  },
};

/**
 * A transaction with a custom icon provided, overriding the default chain icon.
 */
export const WithCustomIcon: Story = {
  args: {
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#0052ff] via-[#1d4ed8] to-[#0284c7] font-bold text-white dark:from-[#2563eb] dark:via-[#3b82f6] dark:to-[#38bdf8]">
        🦄
      </div>
    ),
  },
};

/**
 * An example of customization: the status badge, the Open transaction button and the Speed up button are replaced.
 */
export const FullyCustomized: Story = {
  name: 'With Full Customization',
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      pending: true,
      tracker: TransactionTracker.Ethereum,
      connectorType: 'evm:metamask',
      sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      nonce: 7,
      maxFeePerGas: '1000',
      maxPriorityFeePerGas: '100',
    }),
    customization: {
      components: {
        StatusBadge: () => (
          <div className="rounded-full bg-[#0052ff] px-3 py-1 text-xs font-bold text-white dark:bg-[#2563eb]">
            CUSTOM
          </div>
        ),
        TxInfoButton: ({ onClick, children }) => (
          <button
            onClick={onClick}
            className="rounded-[var(--tuwa-rounded-corners)] bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
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
