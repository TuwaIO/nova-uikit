import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastTransaction } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import { Config } from '@wagmi/core';
import dayjs from 'dayjs';
import { zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// --- Mocks and Helpers ---

/**
 * A helper function to create mock transaction objects for stories.
 */
const createMockTx = (overrides: Partial<Transaction<unknown>>): Transaction<unknown> => ({
  tracker: TransactionTracker.Ethereum,
  adapter: TransactionAdapter.EVM,
  txKey: '0x_storybook_tx_hash',
  type: 'Token Swap',
  chainId: mainnet.id,
  from: zeroAddress,
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
 * Creates a mock transactions pool that includes the transaction.
 */
const createMockTransactionsPool = (tx: Transaction<unknown>) => ({
  [tx.txKey]: tx,
  ...(tx.adapter === TransactionAdapter.EVM && tx.hash && tx.hash !== tx.txKey ? { [tx.hash]: tx } : {}),
});

/**
 * Mock wagmi config for testing Speed Up/Cancel functionality.
 * For Storybook purposes, we only need a minimal mock that passes type checking.
 */
const mockConfig = {
  // Only include the minimal properties needed for the component logic
  chains: [mainnet, sepolia],
} as unknown as Config;

// --- Storybook Meta Configuration ---

const meta: Meta<typeof ToastTransaction> = {
  title: 'UI Components/Toast/ToastTransaction',
  component: ToastTransaction,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    tx: createMockTx({}),
    appChains: [mainnet, sepolia],
    transactionsPool: createMockTransactionsPool(createMockTx({})),
    openWalletInfoModal: (open: boolean) => console.log('Open wallet modal:', open),
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display in the toast',
    },
    openWalletInfoModal: {
      control: false,
      description: 'Function to open the main wallet info modal',
    },
    appChains: {
      control: 'object',
      description: 'Array of supported chain objects',
    },
    transactionsPool: {
      control: 'object',
      description: 'The entire pool of transactions from the store',
    },
    icon: {
      control: false,
      description: 'Optional custom icon to display instead of the default chain icon',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the toast container',
    },
    config: {
      control: 'object',
      description: 'The wagmi config object, required for Speed Up and Cancel functionality',
    },
    customization: {
      control: 'object',
      description: 'Object to customize and override the default internal components',
      table: {
        type: {
          summary: 'ToastTransactionCustomization<TR, T>',
          detail: `{
  components?: {
    statusAwareText?: (props: StatusAwareTextProps) => ReactNode;
    transactionKey?: (props: ToastTransactionKeyProps) => ReactNode;
    statusBadge?: (props: TransactionStatusBadgeProps) => ReactNode;
    walletInfoButton?: (props: { onClick: () => void; children: ReactNode }) => ReactNode;
    speedUpButton?: (props: { onClick: () => void; children: ReactNode }) => ReactNode;
    cancelButton?: (props: { onClick: () => void; children: ReactNode }) => ReactNode;
  };
}`,
        },
      },
    },
    closeToast: {
      control: false,
      description: 'Function to close the toast (from react-toastify)',
    },
    toastProps: {
      control: false,
      description: 'Props from react-toastify to control the toast itself',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Displays a successful transaction toast with the wallet info button.
 */
export const Default: Story = {
  args: {},
};

/**
 * Shows a pending transaction that can be sped up or cancelled.
 */
export const PendingWithActions: Story = {
  args: {
    tx: createMockTx({
      pending: true,
      status: undefined,
      hash: undefined,
      nonce: 42,
      maxFeePerGas: '0x12345',
      maxPriorityFeePerGas: '0x6789',
      localTimestamp: dayjs().subtract(30, 'seconds').unix(),
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        pending: true,
        status: undefined,
        hash: undefined,
        nonce: 42,
        maxFeePerGas: '0x12345',
        maxPriorityFeePerGas: '0x6789',
        localTimestamp: dayjs().subtract(30, 'seconds').unix(),
      }),
    ),
    config: mockConfig,
  },
};

/**
 * Shows a pending transaction without the ability to replace (no config).
 */
export const PendingWithoutActions: Story = {
  args: {
    tx: createMockTx({
      pending: true,
      status: undefined,
      hash: undefined,
      nonce: 42,
      maxFeePerGas: '0x12345',
      maxPriorityFeePerGas: '0x6789',
      localTimestamp: dayjs().subtract(30, 'seconds').unix(),
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        pending: true,
        status: undefined,
        hash: undefined,
        nonce: 42,
        maxFeePerGas: '0x12345',
        maxPriorityFeePerGas: '0x6789',
        localTimestamp: dayjs().subtract(30, 'seconds').unix(),
      }),
    ),
    config: undefined,
  },
};

/**
 * Shows a failed transaction with error styling.
 */
export const FailedTransaction: Story = {
  args: {
    tx: createMockTx({
      status: TransactionStatus.Failed,
      errorMessage: 'Insufficient gas fee',
      localTimestamp: dayjs().subtract(2, 'hours').unix(),
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        status: TransactionStatus.Failed,
        errorMessage: 'Insufficient gas fee',
        localTimestamp: dayjs().subtract(2, 'hours').unix(),
      }),
    ),
  },
};

/**
 * Shows a replaced transaction.
 */
export const ReplacedTransaction: Story = {
  args: {
    tx: createMockTx({
      status: TransactionStatus.Replaced,
      hash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      localTimestamp: dayjs().subtract(1, 'hour').unix(),
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        status: TransactionStatus.Replaced,
        hash: '0x4444444444444444444444444444444444444444444444444444444444444444',
        replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
        localTimestamp: dayjs().subtract(1, 'hour').unix(),
      }),
    ),
  },
};

/**
 * Shows a Gelato gasless transaction.
 */
export const GelatoTransaction: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
      type: 'Gasless Transfer',
      title: [
        'Processing gasless transfer...',
        'Gasless transfer completed!',
        'Gasless transfer failed',
        'Transfer replaced',
      ],
      description: [
        'Your gasless transaction is being processed',
        'Transfer completed successfully',
        'Gasless transfer failed',
        'Transfer was replaced',
      ],
      chainId: sepolia.id,
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        tracker: TransactionTracker.Gelato,
        txKey: 'gelato_task_id_abcdef123456',
        type: 'Gasless Transfer',
        title: [
          'Processing gasless transfer...',
          'Gasless transfer completed!',
          'Gasless transfer failed',
          'Transfer replaced',
        ],
        description: [
          'Your gasless transaction is being processed',
          'Transfer completed successfully',
          'Gasless transfer failed',
          'Transfer was replaced',
        ],
        chainId: sepolia.id,
      }),
    ),
  },
};

/**
 * Shows a Safe multisig transaction.
 */
export const SafeTransaction: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Safe,
      txKey: 'safe_0xabc...def_nonce_123',
      type: 'Multi-sig Approval',
      title: ['Awaiting signatures...', 'Multi-sig approved!', 'Multi-sig rejected', 'Transaction replaced'],
      description: [
        'Waiting for required signatures',
        'All required signatures collected',
        'Transaction was rejected',
        'Transaction was replaced',
      ],
      localTimestamp: dayjs().subtract(15, 'minutes').unix(),
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        tracker: TransactionTracker.Safe,
        txKey: 'safe_0xabc...def_nonce_123',
        type: 'Multi-sig Approval',
        title: ['Awaiting signatures...', 'Multi-sig approved!', 'Multi-sig rejected', 'Transaction replaced'],
        description: [
          'Waiting for required signatures',
          'All required signatures collected',
          'Transaction was rejected',
          'Transaction was replaced',
        ],
        localTimestamp: dayjs().subtract(15, 'minutes').unix(),
      }),
    ),
  },
};

/**
 * Shows a transaction with simple string title and description.
 */
export const SimpleText: Story = {
  args: {
    tx: createMockTx({
      type: 'NFT Mint',
      title: 'Mint Awesome NFT',
      description: 'Minting your unique digital collectible',
      localTimestamp: dayjs().subtract(10, 'minutes').unix(),
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        type: 'NFT Mint',
        title: 'Mint Awesome NFT',
        description: 'Minting your unique digital collectible',
        localTimestamp: dayjs().subtract(10, 'minutes').unix(),
      }),
    ),
  },
};

/**
 * Shows a toast without the wallet info modal function (no button).
 */
export const WithoutWalletModal: Story = {
  args: {
    openWalletInfoModal: undefined,
  },
};

/**
 * Demonstrates a custom icon instead of the default chain icon.
 */
export const WithCustomIcon: Story = {
  args: {
    icon: (
      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
        🎯
      </div>
    ),
  },
};

/**
 * Demonstrates extensive customization of all components.
 */
export const FullyCustomized: Story = {
  name: 'With All Custom Components',
  args: {
    tx: createMockTx({
      pending: true,
      status: undefined,
      hash: undefined,
      nonce: 42,
      maxFeePerGas: '0x12345',
      maxPriorityFeePerGas: '0x6789',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        pending: true,
        status: undefined,
        hash: undefined,
        nonce: 42,
        maxFeePerGas: '0x12345',
        maxPriorityFeePerGas: '0x6789',
      }),
    ),
    config: mockConfig,
    customization: {
      components: {
        statusAwareText: (props) => (
          <div
            className={`${props.variant === 'title' ? 'text-lg font-bold text-purple-600' : 'text-sm text-purple-500 italic'}`}
          >
            ✨ Custom: {props.source || props.fallback}
          </div>
        ),
        statusBadge: () => (
          <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full text-xs font-bold">
            🔥 Custom Status
          </div>
        ),
        walletInfoButton: ({ onClick, children }) => (
          <button
            onClick={onClick}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
          >
            🚀 {children}
          </button>
        ),
        speedUpButton: ({ onClick, children }) => (
          <button
            onClick={onClick}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-semibold"
          >
            ⚡ {children}
          </button>
        ),
        cancelButton: ({ onClick, children }) => (
          <button
            onClick={onClick}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold"
          >
            ❌ {children}
          </button>
        ),
      },
    },
  },
};

/**
 * Shows a toast in a container with custom styling.
 */
export const WithCustomStyling: Story = {
  args: {
    className: 'border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl',
  },
};

/**
 * Shows multiple toast states side by side for comparison.
 */
export const StateComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 max-w-4xl">
      <div className="text-center font-semibold text-gray-700 mb-2">Transaction Toast States</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-2">Successful</div>
          <ToastTransaction
            tx={createMockTx({ status: TransactionStatus.Success })}
            appChains={[mainnet, sepolia]}
            transactionsPool={createMockTransactionsPool(createMockTx({ status: TransactionStatus.Success }))}
            openWalletInfoModal={() => {}}
          />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Failed</div>
          <ToastTransaction
            tx={createMockTx({ status: TransactionStatus.Failed })}
            appChains={[mainnet, sepolia]}
            transactionsPool={createMockTransactionsPool(createMockTx({ status: TransactionStatus.Failed }))}
            openWalletInfoModal={() => {}}
          />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Pending with Actions</div>
          <ToastTransaction
            tx={createMockTx({
              pending: true,
              status: undefined,
              hash: undefined,
              nonce: 42,
              maxFeePerGas: '0x12345',
              maxPriorityFeePerGas: '0x6789',
            })}
            appChains={[mainnet, sepolia]}
            transactionsPool={createMockTransactionsPool(
              createMockTx({
                pending: true,
                status: undefined,
                hash: undefined,
                nonce: 42,
                maxFeePerGas: '0x12345',
                maxPriorityFeePerGas: '0x6789',
              }),
            )}
            config={mockConfig}
          />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Replaced</div>
          <ToastTransaction
            tx={createMockTx({ status: TransactionStatus.Replaced })}
            appChains={[mainnet, sepolia]}
            transactionsPool={createMockTransactionsPool(createMockTx({ status: TransactionStatus.Replaced }))}
            openWalletInfoModal={() => {}}
          />
        </div>
      </div>
    </div>
  ),
};
