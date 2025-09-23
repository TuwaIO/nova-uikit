import { SparklesIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxInfoBlock } from '@tuwaio/nova-transactions';
import { TransactionAdapter, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { sepolia } from 'viem/chains';

import { mockEvmAdapter, mockSolanaAdapter } from '../../utils/mockAdapters';
import { createInitialTx, createMockTx } from '../../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxInfoBlock> = {
  title: 'Components/Modal/TxInfoBlock',
  component: TxInfoBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: (args) => {
    const transactionsPool = 'txKey' in args.tx ? { [args.tx.txKey]: args.tx } : {};
    return <TxInfoBlock {...args} transactionsPool={transactionsPool} adapter={args.adapter} />;
  },
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      status: TransactionStatus.Success,
      pending: false,
    }),
    adapter: [mockEvmAdapter],
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display (can be a full or initial transaction).',
    },
    adapter: {
      control: false,
      description: 'Adapters to be used for retrieving chain-specific data.',
    },
    transactionsPool: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default view for a standard, completed EVM transaction.
 */
export const Default: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      status: TransactionStatus.Success,
      pending: false,
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * The view for an `InitialTransaction`, before it has been submitted to the network.
 * It correctly displays the `desiredChainID` and does not show the `TransactionKey` component yet.
 */
export const InitialState: Story = {
  args: {
    tx: createInitialTx(),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A transaction tracked by Gelato. The underlying `TransactionKey` component will
 * display the "Task ID".
 */
export const GelatoTransaction: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A transaction on a different network (Sepolia) to demonstrate correct chain info display.
 */
export const DifferentNetwork: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.EVM, {
      chainId: sepolia.id,
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * An example of customizing the `InfoRow` and `transactionKey` components via render props.
 */
export const WithCustomization: Story = {
  args: {
    ...Default.args,
    customization: {
      components: {
        InfoRow: ({ label, value }) => (
          <div className="flex items-center justify-between rounded-lg bg-purple-500/10 p-2">
            <div className="flex items-center gap-2 font-medium text-purple-700">
              <SparklesIcon className="h-4 w-4" />
              {label}
            </div>
            <div className="font-bold text-purple-800">{value}</div>
          </div>
        ),
      },
    },
    adapter: [mockEvmAdapter],
  },
};

/**
 * An example of a Solana transaction's info block.
 */
export const SolanaTransaction: Story = {
  args: {
    tx: createMockTx(TransactionAdapter.SOLANA, { pending: true, chainId: 'solana:mainnet' }),
    adapter: [mockSolanaAdapter],
  },
};
