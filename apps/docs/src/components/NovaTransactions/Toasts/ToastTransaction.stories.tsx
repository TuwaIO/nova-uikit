import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastTransaction } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { action } from 'storybook/actions';

import { iso, isoTransactions } from '../../../utils/customization/isometric';
import { IsoCube, withIsometricTheme } from '../../../utils/customization/IsometricFrame';
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
  decorators: [withIsometricTheme],
  args: {
    icon: <IsoCube className={`h-10 w-10 ${iso.text.primary}`} />,
  },
};

/**
 * An example of customization: the status badge, the Open transaction button and the Speed up button are replaced.
 */
export const FullyCustomized: Story = {
  name: 'With Full Customization',
  decorators: [withIsometricTheme],
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      pending: true,
      tracker: TransactionTracker.Ethereum,
      connectorType: 'evm:metamask',
      sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      nonce: 7,
      maxFeePerGas: '1000',
      maxPriorityFeePerGas: '100',
    }),
    customization: {
      ...isoTransactions.toast,
      components: {
        StatusBadge: () => <span className={`px-2 py-1 ${iso.surface.border} ${iso.sectionTitle}`}>Waiting</span>,
        TxInfoButton: ({ onClick, children }) => (
          <button type="button" onClick={onClick} className={iso.button.outline}>
            {children}
          </button>
        ),
        SpeedUpButton: ({ onClick, children }) => (
          <button type="button" onClick={onClick} className={iso.button.primary}>
            {children}
          </button>
        ),
      },
    },
  },
};
