import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastTransaction } from '@tuwaio/nova-transactions';
import { EvmTransaction, Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { action } from 'storybook/actions';
import { zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';

// --- Mocks and Helpers ---

/**
 * A helper function to create mock transaction objects for stories.
 */
const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: '0x123abcdeef',
  type: 'Token Swap',
  chainId: mainnet.id,
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Example address
  pending: false,
  localTimestamp: dayjs().subtract(5, 'minutes').unix(),
  walletType: 'injected',
  status: TransactionStatus.Success,
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  title: ['Swapping tokens...', 'Swap successful!', 'Swap failed', 'Swap replaced'],
  description: [
    'Processing your token swap',
    'Your tokens have been swapped',
    'Token swap failed',
    'Swap was replaced',
  ],
  ...overrides,
});

/**
 * A mock EVM adapter for Storybook. It includes action handlers to demonstrate
 * the "Speed Up" and "Cancel" buttons.
 */
const mockEvmAdapter = {
  key: TransactionAdapter.EVM,
  getExplorerTxUrl: () => 'https://etherscan.io/tx/mock_hash',
  speedUpTxAction: async (tx: Transaction<any>) => {
    action('speedUpTxAction')(tx);
    return '0x_speed_up_hash';
  },
  cancelTxAction: async (tx: Transaction<any>) => {
    action('cancelTxAction')(tx);
    return '0x_cancel_hash';
  },
  // Add other required adapter methods as mocks
  getWalletInfo: () => ({ walletAddress: zeroAddress, walletType: 'injected' }),
  checkChainForTx: async () => {},
  checkTransactionsTracker: () => ({ txKey: 'mock', tracker: TransactionTracker.Ethereum }),
  checkAndInitializeTrackerInStore: async () => {},
  getExplorerUrl: () => 'https://etherscan.io',
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof ToastTransaction> = {
  title: 'Components/Toast/ToastTransaction',
  component: ToastTransaction,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    tx: createMockTx({}),
    transactionsPool: {},
    adapters: [mockEvmAdapter as any],
    connectedWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    openWalletInfoModal: action('openWalletInfoModal'),
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display in the toast.',
    },
    adapters: {
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
 * A successfully completed transaction. This is the default state.
 */
export const Success: Story = {
  args: {
    tx: createMockTx({ status: TransactionStatus.Success }),
  },
};

/**
 * A pending transaction that can be sped up or cancelled. These actions are visible
 * because the transaction tracker is 'ethereum' and it belongs to the `connectedWalletAddress`.
 */
export const PendingWithActions: Story = {
  args: {
    tx: createMockTx({
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
    tx: createMockTx({
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
 * A failed transaction, showing error styling.
 */
export const Failed: Story = {
  args: {
    tx: createMockTx({
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
    tx: createMockTx({
      status: TransactionStatus.Replaced,
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
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
    tx: createMockTx({ pending: true, tracker: TransactionTracker.Ethereum }),
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
