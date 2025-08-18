import { CalendarIcon, ClockIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionTracker } from '@tuwaio/evm-transactions-tracking/src';
import { Transaction, TransactionPool } from '@tuwaio/web3-transactions-tracking-core';
import { TransactionStatus } from '@tuwaio/web3-transactions-tracking-core/src';
import dayjs from 'dayjs';
import { Address } from 'viem';
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains';

import { TxInfoBlock } from './TxInfoBlock';

// --- Mock Transaction Type ---
interface MockTransaction extends Transaction<TransactionTracker> {
  title: string;
  desiredChainID?: number;
}

// --- Mock Data ---
const mockTransaction: MockTransaction = {
  txKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  tracker: TransactionTracker.Ethereum,
  type: 'swap',
  chainId: 1,
  from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
  pending: false,
  walletType: 'metamask',
  status: TransactionStatus.Success,
  localTimestamp: dayjs().subtract(2, 'minute').unix(),
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  title: 'Swap ETH for USDC',
};

const mockTransactionWithGelato: MockTransaction = {
  ...mockTransaction,
  tracker: TransactionTracker.Gelato,
  txKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  title: 'Gasless Swap via Gelato',
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  localTimestamp: dayjs().subtract(5, 'minute').unix(),
};

const mockTransactionWithSafe: MockTransaction = {
  ...mockTransaction,
  tracker: TransactionTracker.Safe,
  txKey: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  title: 'Multisig Transaction',
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  localTimestamp: dayjs().subtract(10, 'minute').unix(),
};

const mockPolygonTransaction: MockTransaction = {
  ...mockTransaction,
  txKey: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  chainId: 137,
  title: 'Bridge to Polygon',
  localTimestamp: dayjs().subtract(1, 'hour').unix(),
};

const mockTransactionWithDesiredChain: MockTransaction = {
  ...mockTransaction,
  txKey: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  desiredChainID: 42161, // Arbitrum
  title: 'Cross-chain Swap',
  localTimestamp: dayjs().subtract(30, 'minute').unix(),
};

const mockTransactionsPool: TransactionPool<TransactionTracker, MockTransaction> = {
  [mockTransaction.txKey]: mockTransaction,
  [mockTransactionWithGelato.txKey]: mockTransactionWithGelato,
  [mockTransactionWithSafe.txKey]: mockTransactionWithSafe,
  [mockPolygonTransaction.txKey]: mockPolygonTransaction,
  [mockTransactionWithDesiredChain.txKey]: mockTransactionWithDesiredChain,
};

const appChains = [mainnet, polygon, arbitrum, optimism, base];

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxInfoBlock> = {
  title: 'UI Components/TrackingTxModal/TxInfoBlock',
  component: TxInfoBlock,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  tags: ['autodocs'],
  args: {
    tx: mockTransaction,
    appChains,
    transactionsPool: mockTransactionsPool,
  },
  argTypes: {
    tx: {
      control: false,
      description: 'The transaction object to display information for',
    },
    appChains: {
      control: false,
      description: 'Array of supported chains',
    },
    transactionsPool: {
      control: false,
      description: 'The transaction pool from the store',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container',
    },
    customization: {
      control: false,
      description: 'Customization options for the component',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Basic Stories ---

export const Default: Story = {};

// --- Different Transaction Types ---

export const GelatoTransaction: Story = {
  args: {
    tx: mockTransactionWithGelato,
  },
};

export const SafeMultisigTransaction: Story = {
  args: {
    tx: mockTransactionWithSafe,
  },
};

// --- Customization Examples ---

export const CustomInfoRow: Story = {
  args: {
    tx: mockTransaction,
    customization: {
      components: {
        infoRow: ({ label, value }) => (
          <div className="flex items-center justify-between p-2 bg-[var(--tuwa-bg-muted)] rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--tuwa-text-primary)]">
              <SparklesIcon className="h-4 w-4 text-[var(--tuwa-text-accent)]" />
              {label}
            </div>
            <div className="text-sm font-bold text-[var(--tuwa-text-primary)]">{value}</div>
          </div>
        ),
      },
    },
  },
};

export const CustomTransactionKey: Story = {
  args: {
    tx: mockTransaction,
    customization: {
      components: {
        transactionKey: ({ label, explorerUrl }) => (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-[var(--tuwa-accent)]/10 to-[var(--tuwa-primary)]/10 rounded-lg border border-[var(--tuwa-accent)]/20">
            <GlobeAltIcon className="h-4 w-4 text-[var(--tuwa-accent)]" />
            <div className="flex-1">
              <div className="text-xs font-medium text-[var(--tuwa-text-secondary)] mb-1">{label}</div>
              <div className="font-mono text-sm text-[var(--tuwa-text-primary)]">
                {explorerUrl ? (
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    View on Explorer
                  </a>
                ) : (
                  'Custom transaction display'
                )}
              </div>
            </div>
          </div>
        ),
      },
    },
  },
};

// --- Layout Variations ---

export const InContainer: Story = {
  render: (args) => (
    <div className="max-w-2xl space-y-4 p-6">
      <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)]">Transaction Details</h2>
      <TxInfoBlock {...args} />
      <div className="flex gap-2">
        <button className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 bg-[var(--tuwa-accent)] text-[var(--tuwa-accent-foreground)]">
          View on Explorer
        </button>
        <button className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 text-[var(--tuwa-text-secondary)] hover:bg-[var(--tuwa-bg-muted)]">
          Speed Up
        </button>
      </div>
    </div>
  ),
  args: {
    tx: mockTransaction,
  },
};

// --- Multiple Network Comparison ---

export const NetworkComparison: Story = {
  render: (args) => {
    const transactions = [
      { ...mockTransaction, title: 'Ethereum Mainnet' },
      { ...mockPolygonTransaction, title: 'Polygon Network' },
      { ...mockTransactionWithDesiredChain, title: 'Arbitrum Network' },
      {
        ...mockTransaction,
        chainId: 10,
        txKey: 'optimism-tx',
        title: 'Optimism Network',
        localTimestamp: dayjs().subtract(15, 'minute').unix(),
      },
      {
        ...mockTransaction,
        chainId: 8453,
        txKey: 'base-tx',
        title: 'Base Network',
        localTimestamp: dayjs().subtract(45, 'minute').unix(),
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 max-w-6xl">
        {transactions.map((tx) => (
          <div key={tx.txKey} className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--tuwa-text-secondary)]">{tx.title}</h3>
            <TxInfoBlock
              {...args}
              tx={tx}
              transactionsPool={{
                ...args.transactionsPool,
                [tx.txKey]: tx,
              }}
            />
          </div>
        ))}
      </div>
    );
  },
};

// --- Time Variations ---

export const TimeVariations: Story = {
  render: (args) => {
    const timeVariations = [
      {
        ...mockTransaction,
        txKey: 'recent-tx',
        title: 'Just now',
        localTimestamp: dayjs().subtract(5, 'second').unix(),
      },
      {
        ...mockTransaction,
        txKey: 'minute-tx',
        title: '5 minutes ago',
        localTimestamp: dayjs().subtract(5, 'minute').unix(),
      },
      {
        ...mockTransaction,
        txKey: 'hour-tx',
        title: '2 hours ago',
        localTimestamp: dayjs().subtract(2, 'hour').unix(),
      },
      {
        ...mockTransaction,
        txKey: 'day-tx',
        title: 'Yesterday',
        localTimestamp: dayjs().subtract(1, 'day').unix(),
      },
      {
        ...mockTransaction,
        txKey: 'week-tx',
        title: 'Last week',
        localTimestamp: dayjs().subtract(1, 'week').unix(),
      },
    ];

    return (
      <div className="space-y-4 p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Time Variations</h2>
        {timeVariations.map((tx) => (
          <div key={tx.txKey} className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--tuwa-text-secondary)]">{tx.title}</h3>
            <TxInfoBlock
              {...args}
              tx={tx}
              transactionsPool={{
                ...args.transactionsPool,
                [tx.txKey]: tx,
              }}
            />
          </div>
        ))}
      </div>
    );
  },
};

// --- Theme Variations ---
export const ThemeComparison: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Light Theme</h3>
        <TxInfoBlock {...args} />
      </div>
      <div className="dark space-y-4 rounded-lg bg-[var(--tuwa-bg-primary)] p-4">
        <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Dark Theme</h3>
        <TxInfoBlock {...args} />
      </div>
    </div>
  ),
  args: {
    tx: mockTransaction,
  },
};

// --- Fully Customized Example ---

export const FullyCustomized: Story = {
  args: {
    tx: mockTransaction,
    className:
      'border-2 border-dashed border-[var(--tuwa-accent)] bg-gradient-to-br from-[var(--tuwa-accent)]/5 to-[var(--tuwa-primary)]/5',
    customization: {
      components: {
        infoRow: ({ label, value }) => (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] rounded-xl border border-[var(--tuwa-border-secondary)]">
            <div className="flex items-center gap-2">
              {typeof label === 'string' && label.includes('Network') ? (
                <GlobeAltIcon className="h-5 w-5 text-[var(--tuwa-accent)]" />
              ) : (
                <ClockIcon className="h-5 w-5 text-[var(--tuwa-text-secondary)]" />
              )}
              <span className="text-sm font-medium text-[var(--tuwa-text-primary)]">{label}</span>
            </div>
            <div className="text-sm font-bold text-[var(--tuwa-text-primary)]">{value}</div>
          </div>
        ),
        transactionKey: ({ label, explorerUrl }) => (
          <div className="relative p-4 bg-gradient-to-r from-[var(--tuwa-success-bg)] to-[var(--tuwa-info-bg)] rounded-xl border-2 border-[var(--tuwa-success-icon)]/30">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-[var(--tuwa-success-icon)] rounded-full flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[var(--tuwa-success-text)] mb-1 uppercase tracking-wide">
                  {label}
                </div>
                <div className="font-mono text-sm text-[var(--tuwa-text-primary)] break-all">
                  {explorerUrl ? (
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      View on Explorer
                    </a>
                  ) : (
                    'Custom transaction'
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <SparklesIcon className="h-5 w-5 text-[var(--tuwa-success-icon)]" />
            </div>
          </div>
        ),
      },
    },
  },
};

// --- Interactive Demo ---

export const InteractiveDemo: Story = {
  render: (args) => {
    const transactions = [
      mockTransaction,
      mockTransactionWithGelato,
      mockTransactionWithSafe,
      mockPolygonTransaction,
      mockTransactionWithDesiredChain,
    ];

    return (
      <div className="space-y-6 p-6 max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--tuwa-text-primary)] mb-2">Transaction Info Block Demo</h2>
          <p className="text-[var(--tuwa-text-secondary)]">
            Различные типы транзакций с разными сетями и временными метками
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx, index) => (
            <div key={tx.txKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--tuwa-text-primary)]">{tx.title}</h3>
                <span className="text-xs bg-[var(--tuwa-bg-muted)] px-2 py-1 rounded-full text-[var(--tuwa-text-secondary)]">
                  Example {index + 1}
                </span>
              </div>
              <TxInfoBlock
                {...args}
                tx={tx}
                transactionsPool={{
                  ...args.transactionsPool,
                  [tx.txKey]: tx,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// --- Edge Cases ---

export const EdgeCases: Story = {
  render: (args) => {
    const edgeCaseTransactions: Partial<MockTransaction>[] = [
      {
        ...mockTransaction,
        txKey: 'no-timestamp',
        title: 'No Timestamp',
        localTimestamp: undefined,
      },
      {
        ...mockTransaction,
        txKey: 'unknown-chain',
        title: 'Unknown Chain',
        chainId: 999999,
        desiredChainID: undefined,
      },
      {
        ...mockTransaction,
        txKey: 'no-chain',
        title: 'No Chain Info',
        chainId: undefined,
        desiredChainID: undefined,
      },
    ];

    return (
      <div className="space-y-4 p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Edge Cases</h2>
        {edgeCaseTransactions.map((tx) => (
          <div key={tx.txKey} className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--tuwa-text-secondary)]">{tx.title}</h3>
            <TxInfoBlock
              {...args}
              tx={tx as MockTransaction}
              transactionsPool={{
                ...args.transactionsPool,
                [tx.txKey!]: tx as MockTransaction,
              }}
            />
          </div>
        ))}
      </div>
    );
  },
};
