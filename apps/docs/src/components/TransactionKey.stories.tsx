import type { Meta, StoryObj } from '@storybook/react-vite';
import { HashLink, TransactionKey } from '@tuwaio/nova-transactions';
import { EvmTransaction, TransactionAdapter } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import { zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';

// --- Mocks and Helpers ---

const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  type: 'storybook-action',
  chainId: mainnet.id,
  from: zeroAddress,
  pending: true,
  localTimestamp: Date.now(),
  walletType: 'injected',
  status: undefined,
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
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

const meta: Meta<typeof TransactionKey> = {
  title: 'Components/Shared/TransactionKey',
  component: TransactionKey,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: (args) => {
    const transactionsPool = { [args.tx.txKey]: args.tx };
    return <TransactionKey {...args} transactionsPool={transactionsPool} />;
  },
  args: {
    tx: createMockTx({}),
    adapters: [mockEvmAdapter as any],
    variant: 'toast',
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display identifiers for.',
    },
    adapters: {
      control: false,
      description: 'An array of configured adapters.',
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
 * A standard EVM transaction. Since the `txKey` and `hash` are the same, and the tracker
 * is the default ('ethereum'), only a single "Tx Hash" is displayed to avoid redundancy.
 */
export const DefaultEVM: Story = {
  name: 'Default (EVM)',
  args: {
    tx: createMockTx({}),
  },
};

/**
 * A transaction tracked by Gelato. It displays the Gelato "Task ID" (`txKey`)
 * in addition to the on-chain "Tx Hash" (`hash`).
 */
export const Gelato: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
    }),
  },
};

/**
 * A transaction tracked by Safe. It displays the "SafeTxHash" (`txKey`)
 * in addition to the on-chain "Tx Hash" (`hash`).
 */
export const Safe: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Safe,
      txKey: 'safe_0xabc...def_nonce_123',
    }),
  },
};

/**
 * A transaction that was replaced. It displays the "Original" hash (struck-through if supported by styles)
 * and the "Replaced By" hash, which links to the new transaction on the explorer.
 */
export const Replaced: Story = {
  args: {
    tx: createMockTx({
      replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    }),
  },
};

/**
 * The 'history' variant, which typically has no top border and is used within a list.
 */
export const HistoryVariant: Story = {
  args: {
    variant: 'history',
  },
};

/**
 * A demonstration of the `renderHashLink` prop to completely customize the appearance of each hash.
 */
export const WithCustomRender: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
    }),
    renderHashLink: (props) => (
      <HashLink {...props} label={`✨ ${props.label}`} className="rounded bg-purple-500/10 px-1" />
    ),
  },
};
