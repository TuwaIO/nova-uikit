import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionKey } from '@tuwaio/nova-transactions';
import { TransactionAdapter, TransactionTracker } from '@tuwaio/pulsar-core';

import { mockEvmAdapter, mockSolanaAdapter } from '../utils/mockAdapters';
import { createMockTx } from '../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionKey> = {
  title: 'Components/Shared/TransactionKey',
  component: TransactionKey,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: (args) => {
    const transactionsPool = { [args.tx.txKey]: args.tx };
    return <TransactionKey {...args} transactionsPool={transactionsPool} adapter={args.adapter} />;
  },
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {}),
    adapter: mockEvmAdapter,
    variant: 'toast',
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display identifiers for.',
    },
    adapter: {
      control: false,
      description: 'The adapter used to fetch transaction-specific behavior and URLs.',
    },
    variant: {
      control: 'radio',
      options: ['toast', 'history'],
      description: 'The visual variant, which applies different container styles.',
    },
    renderHashLink: {
      control: false,
      description: 'An optional render prop to customize the rendering of the hash link.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * A standard EVM transaction displaying only the on-chain transaction hash.
 */
export const DefaultEVM: Story = {
  name: 'Default (EVM)',
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {}),
    adapter: mockEvmAdapter,
  },
};

/**
 * Showcases a Solana transaction with slot, confirmations, and recent blockhash details.
 */
export const DefaultSolana: Story = {
  name: 'Default (Solana)',
  args: {
    tx: createMockTx(TransactionAdapter.SOLANA, {}),
    adapter: mockSolanaAdapter,
  },
};

/**
 * Showcases Gelato transaction details with both Task ID and on-chain hash.
 */
export const Gelato: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
    }),
    adapter: mockEvmAdapter,
  },
};

/**
 * Displays the Safe transaction hash combined with the on-chain hash.
 */
export const Safe: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      tracker: TransactionTracker.Safe,
      txKey: 'safe_0xabc...def_nonce_123',
    }),
    adapter: mockEvmAdapter,
  },
};

/**
 * Demonstrates a "replaced" transaction, showing both original and replacing hashes.
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
    adapter: mockEvmAdapter,
  },
};

/**
 * The 'history' variant that uses a different container style for the transaction key.
 */
export const HistoryVariant: Story = {
  args: {
    variant: 'history',
    adapter: mockEvmAdapter,
  },
};

/**
 * Customizes the rendering of the hash link to showcase additional styling or content.
 */
export const WithCustomRender: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
    }),
    renderHashLink: (props) => (
      <div className="rounded bg-purple-500/30 px-2 py-1 text-purple-900">
        Custom ✨{' '}
        <a href={props.explorerUrl} target="_blank" rel="noopener noreferrer">
          {props.label}
        </a>
      </div>
    ),
    adapter: mockEvmAdapter,
  },
};
