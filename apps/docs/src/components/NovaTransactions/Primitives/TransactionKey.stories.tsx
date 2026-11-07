import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionKey } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionTracker } from '@tuwaio/pulsar-core';

import { iso } from '../../../utils/customization/isometric';
import { withIsometricTheme } from '../../../utils/customization/IsometricFrame';
import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof TransactionKey> = {
  title: 'Nova Transactions/Primitives/TransactionKey',
  component: TransactionKey,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: (args) => {
    return <TransactionKey {...args} adapter={args.adapter} />;
  },
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {}),
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
    tx: createMockTx(OrbitAdapter.EVM, {}),
    adapter: mockEvmAdapter,
  },
};

/**
 * A Solana transaction: its signature, linked to the explorer, and its confirmations.
 */
export const DefaultSolana: Story = {
  name: 'Default (Solana)',
  args: {
    tx: createMockTx(OrbitAdapter.SOLANA, {}),
    adapter: mockSolanaAdapter,
    confirmations: 3,
  },
};

/**
 * Displays the Safe transaction hash combined with the on-chain hash.
 */
export const Safe: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
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
    tx: createMockTx(OrbitAdapter.EVM, {
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
    adapter: mockEvmAdapter,
  },
};

/**
 * The record that goes on after a speed-up: its own hash, and the hash it replaced.
 */
export const AfterSpeedUp: Story = {
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      hash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      replaces: '0x4444444444444444444444444444444444444444444444444444444444444444',
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
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
    withIsometricTheme,
  ],
  args: {
    // The boxes draw the frame: the line that sets the key apart from a toast is not needed here
    className: 'border-t-0! pt-0!',
    tx: createMockTx(OrbitAdapter.EVM, {
      tracker: TransactionTracker.Safe,
      txKey: '0xsafe_transaction_hash_abcdef123456',
    }),
    renderHashLink: (props) => (
      <div className={`flex items-center justify-between gap-3 px-2 py-1 text-sm ${iso.box}`}>
        {props.explorerUrl ? (
          <a href={props.explorerUrl} target="_blank" rel="noopener noreferrer" className={iso.button.link}>
            {props.label}
          </a>
        ) : (
          <span className={iso.text.primary}>{props.label}</span>
        )}
        <span className={`font-mono text-xs ${iso.text.secondary}`}>{props.hash.slice(0, 10)}…</span>
      </div>
    ),
    adapter: mockEvmAdapter,
  },
};

/**
 * An ERC-4337 UserOperation in pending state, displaying the UserOp Hash with block explorer link.
 */
export const UserOpPending: Story = {
  name: 'ERC-4337 UserOp (Pending)',
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      tracker: TransactionTracker.ERC4337,
      txKey: '0x1faf8bda15b6e7abc620db9b23af8af286545142ba973ab318ac4d46980920ce',
      hash: undefined,
    }),
    adapter: mockEvmAdapter,
  },
};

/**
 * An ERC-4337 UserOperation in mined state, displaying both UserOp Hash and on-chain Tx Hash.
 */
export const UserOpMined: Story = {
  name: 'ERC-4337 UserOp (Mined)',
  args: {
    tx: createMockTx(OrbitAdapter.EVM, {
      tracker: TransactionTracker.ERC4337,
      txKey: '0x1faf8bda15b6e7abc620db9b23af8af286545142ba973ab318ac4d46980920ce',
      hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    }),
    adapter: mockEvmAdapter,
  },
};
