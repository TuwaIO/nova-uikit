import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionHistoryItem } from '@tuwaio/nova-transactions';
import { EvmTransaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// --- Mocks and Helpers ---

const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: '0x123abcdeef',
  type: 'Token Swap',
  chainId: mainnet.id,
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
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

const mockEvmAdapter = {
  key: TransactionAdapter.EVM,
  getExplorerTxUrl: (pool: any, txKey: string, replacedTxHash?: string) =>
    `https://etherscan.io/tx/${replacedTxHash || pool[txKey]?.hash}`,
  // Add other required adapter methods as mocks
  getWalletInfo: () => ({ walletAddress: zeroAddress, walletType: 'injected' }),
  checkChainForTx: async () => {},
  checkTransactionsTracker: () => ({ txKey: 'mock', tracker: TransactionTracker.Ethereum }),
  checkAndInitializeTrackerInStore: async () => {},
  getExplorerUrl: () => 'https://etherscan.io',
};

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
    const transactionsPool = { [args.tx.txKey]: args.tx };
    return <TransactionHistoryItem {...args} transactionsPool={transactionsPool} />;
  },
  args: {
    tx: createMockTx({}),
    adapters: [mockEvmAdapter as any],
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display.',
    },
    adapters: {
      control: false,
      description: 'An array of configured adapters.',
    },
    transactionsPool: {
      control: false, // Controlled by the custom render function
      description: 'The entire pool of transactions from the store.',
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
    tx: createMockTx({ status: TransactionStatus.Success }),
  },
};

/**
 * A pending transaction, showing the spinning icon in the status badge.
 */
export const Pending: Story = {
  args: {
    tx: createMockTx({
      pending: true,
      status: undefined,
      hash: undefined,
      localTimestamp: dayjs().subtract(30, 'seconds').unix(),
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
      errorMessage: 'Transaction failed due to an unexpected error.',
    }),
  },
};

/**
 * A transaction that was replaced (e.g., sped up or cancelled).
 * The `TransactionKey` component will display both the original and replaced hashes.
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
 * A Gelato transaction, demonstrating how `TransactionKey` shows the `txKey` as a "Task ID".
 */
export const Gelato: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
      chainId: sepolia.id,
      hash: '0x_on_chain_hash_from_gelato',
    }),
  },
};

/**
 * A transaction with a custom title and description, replacing the default components.
 */
export const WithCustomization: Story = {
  name: 'With Custom Components',
  args: {
    customization: {
      components: {
        Title: (props) => <div className="font-bold text-purple-600">✨ Custom Title: {props.fallback}</div>,
        Timestamp: ({ timestamp }) => (
          <div className="font-mono text-xs text-orange-500">⏰ {dayjs.unix(timestamp!).format('HH:mm:ss')}</div>
        ),
      },
    },
  },
};
