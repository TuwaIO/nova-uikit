import { SparklesIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxInfoBlock } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { monad, monadTestnet } from 'viem/chains';

import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';
import { createInitialTx, createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof TxInfoBlock> = {
  title: 'Nova Transactions/Modals/TxInfoBlock',
  component: TxInfoBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: (args) => {
    return <TxInfoBlock {...args} adapter={args.adapter} />;
  },
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
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
    tx: createMockTx(OrbitAdapter.EVM, {
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
    tx: createInitialTx(OrbitAdapter.EVM),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A transaction tracked by Gelato. The underlying `TransactionKey` component will
 * display the "Task ID".
 */
export const GelatoTransaction: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
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
    tx: createMockTx(OrbitAdapter.EVM, {
      chainId: monadTestnet.id,
    }),
    adapter: [mockEvmAdapter],
  },
};

/**
 * A transaction on a different network (Sepolia) to demonstrate correct chain info display.
 */
export const DifferentNetworkMonad: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      chainId: monad.id,
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
          <div className="flex items-center justify-between rounded-[var(--tuwa-rounded-corners)] bg-purple-500/10 p-2">
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
    tx: createMockTx(OrbitAdapter.SOLANA, { pending: true, chainId: 'solana:mainnet' }),
    adapter: [mockSolanaAdapter],
  },
};

/**
 * An ERC-4337 UserOperation in TxInfoBlock, showing UserOp Hash and on-chain Tx Hash.
 */
export const UserOpTransaction: Story = {
  name: 'ERC-4337 UserOp Transaction',
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      tracker: TransactionTracker.ERC4337,
      txKey: '0x1faf8bda15b6e7abc620db9b23af8af286545142ba973ab318ac4d46980920ce',
      hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      status: TransactionStatus.Success,
      pending: false,
    }),
    adapter: [mockEvmAdapter],
  },
};
