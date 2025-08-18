import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionHistoryItem } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// --- Mocks and Helpers ---

/**
 * A helper function to create mock transaction objects for stories.
 * This simplifies creating different states for the component.
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
 * Creates a mock transactions pool that includes the transaction,
 * which is necessary for the selectTxExplorerLink function to work.
 */
const createMockTransactionsPool = (tx: Transaction<unknown>) => ({
  [tx.txKey]: tx,
  ...(tx.adapter === TransactionAdapter.EVM && tx.hash && tx.hash !== tx.txKey ? { [tx.hash]: tx } : {}),
});

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionHistoryItem> = {
  title: 'UI Components/TransactionsHistory/TransactionHistoryItem',
  component: TransactionHistoryItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    tx: createMockTx({}),
    appChains: [mainnet, sepolia],
    transactionsPool: createMockTransactionsPool(createMockTx({})),
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display',
    },
    appChains: {
      control: 'object',
      description: 'Array of supported chain objects',
    },
    transactionsPool: {
      control: 'object',
      description: 'The entire pool of transactions from the store',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container',
    },
    customization: {
      control: 'object',
      description: 'Object to customize and override the default internal components',
      table: {
        type: {
          summary: 'TransactionHistoryItemCustomization<TR, T>',
          detail: `{
  components?: {
    icon?: (props: { chainId: number }) => ReactNode;
    title?: (props: StatusAwareTextProps) => ReactNode;
    description?: (props: StatusAwareTextProps) => ReactNode;
    timestamp?: (props: { timestamp?: number }) => ReactNode;
    statusBadge?: (props: { tx: Transaction }) => ReactNode;
    transactionKey?: (props: ToastTransactionKeyProps) => ReactNode;
  };
}`,
        },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Displays a successful transaction with all default components.
 */
export const Default: Story = {
  args: {},
};

/**
 * Shows a pending transaction that is still being processed.
 */
export const PendingTransaction: Story = {
  args: {
    tx: createMockTx({
      pending: true,
      status: undefined,
      localTimestamp: dayjs().subtract(30, 'seconds').unix(),
      hash: undefined,
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        pending: true,
        status: undefined,
        localTimestamp: dayjs().subtract(30, 'seconds').unix(),
        hash: undefined,
      }),
    ),
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
 * Shows a replaced transaction (e.g., sped up).
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
 * Shows a Gelato transaction with a task ID.
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
 * Shows a transaction with simple string title and description instead of arrays.
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
 * Shows a very old transaction to demonstrate timestamp formatting.
 */
export const OldTransaction: Story = {
  args: {
    tx: createMockTx({
      type: 'Legacy Transfer',
      localTimestamp: dayjs().subtract(30, 'days').unix(),
      title: 'Old transfer completed',
      description: 'This is a very old transaction',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        type: 'Legacy Transfer',
        localTimestamp: dayjs().subtract(30, 'days').unix(),
        title: 'Old transfer completed',
        description: 'This is a very old transaction',
      }),
    ),
  },
};

/**
 * Demonstrates how to customize components within the transaction history item.
 */
export const WithCustomization: Story = {
  name: 'With Custom Components',
  args: {
    customization: {
      components: {
        title: (props) => (
          <div className="text-lg font-bold text-purple-600">🎯 Custom: {props.fallback || 'Transaction'}</div>
        ),
        timestamp: (props) => (
          <div className="text-xs text-orange-500 font-mono">
            ⏰ {props.timestamp ? `Custom time: ${dayjs.unix(props.timestamp).format('HH:mm:ss')}` : 'No time'}
          </div>
        ),
        description: (props) => (
          <div className="text-sm text-blue-600 italic">
            ✨ Enhanced: {props.source || props.fallback || 'Custom description'}
          </div>
        ),
      },
    },
  },
};
