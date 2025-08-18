import type { Meta, StoryObj } from '@storybook/react-vite';
import { HashLink, TransactionKey } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
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
  type: 'storybook-action',
  chainId: sepolia.id,
  from: zeroAddress,
  pending: true,
  localTimestamp: Date.now(),
  walletType: 'injected',
  status: undefined,
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
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

const meta: Meta<typeof TransactionKey> = {
  title: 'UI Components/basic/TransactionKey',
  component: TransactionKey,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    tx: createMockTx({}),
    appChains: [mainnet, sepolia],
    transactionsPool: {},
    variant: 'toast',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['toast', 'history'],
    },
    tx: {
      control: false,
    },
    transactionsPool: {
      control: false,
    },
    appChains: {
      control: false,
    },
    className: {
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Displays a standard EVM transaction with a single hash and explorer link.
 */
export const Default: Story = {
  args: {
    transactionsPool: createMockTransactionsPool(createMockTx({})),
  },
};

/**
 * Displays a transaction tracked by Gelato, showing the Gelato Task ID.
 */
export const GelatoTracker: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
      hash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        tracker: TransactionTracker.Gelato,
        txKey: 'gelato_task_id_abcdef123456',
        hash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      }),
    ),
  },
};

/**
 * Displays a transaction tracked by Gnosis Safe, showing the SafeTxHash.
 */
export const SafeTracker: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Safe,
      txKey: 'safe_0xabc...def_nonce_123',
      hash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        tracker: TransactionTracker.Safe,
        txKey: 'safe_0xabc...def_nonce_123',
        hash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      }),
    ),
  },
};

/**
 * Displays a transaction that was replaced (e.g., sped up),
 * showing both the original and the new transaction hash with explorer links.
 */
export const ReplacedTransaction: Story = {
  args: {
    tx: createMockTx({
      hash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        hash: '0x4444444444444444444444444444444444444444444444444444444444444444',
        replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      }),
    ),
  },
};

/**
 * Shows the component in the 'history' variant, which has different styling.
 */
export const HistoryVariant: Story = {
  args: {
    variant: 'history',
    transactionsPool: createMockTransactionsPool(createMockTx({})),
  },
};

/**
 * Shows a transaction with Mainnet chain for explorer link generation.
 */
export const WithMainnetExplorer: Story = {
  args: {
    tx: createMockTx({
      chainId: mainnet.id,
      hash: '0x6666666666666666666666666666666666666666666666666666666666666666',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        chainId: mainnet.id,
        hash: '0x6666666666666666666666666666666666666666666666666666666666666666',
      }),
    ),
  },
};

/**
 * Demonstrates how to use the `renderHashLink` prop to customize the output.
 * In this example, we add a "Custom" prefix to each label.
 */
export const CustomRender: Story = {
  name: 'With Custom Render Prop',
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
      hash: '0x7777777777777777777777777777777777777777777777777777777777777777',
    }),
    transactionsPool: createMockTransactionsPool(
      createMockTx({
        tracker: TransactionTracker.Gelato,
        txKey: 'gelato_task_id_abcdef123456',
        hash: '0x7777777777777777777777777777777777777777777777777777777777777777',
      }),
    ),
    renderHashLink: (props) => (
      <HashLink {...props} label={`Custom ${props.label}`} className="bg-blue-900/50 rounded px-1" />
    ),
  },
};
