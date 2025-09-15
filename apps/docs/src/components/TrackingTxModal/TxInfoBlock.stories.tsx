import { SparklesIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxInfoBlock } from '@tuwaio/nova-transactions';
import { EvmTransaction, InitialTransaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { action } from 'storybook/actions';
import { zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// --- Mocks and Helpers ---

const createInitialTx = (overrides: Partial<InitialTransaction<any>> = {}): InitialTransaction<any> => ({
  adapter: TransactionAdapter.EVM,
  desiredChainID: mainnet.id,
  type: 'Token Swap',
  title: 'Preparing Swap...',
  description: 'Please confirm in your wallet',
  withTrackedModal: true,
  isInitializing: true,
  localTimestamp: dayjs().unix(),
  actionFunction: async () => {
    action('retryAction')();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  ...overrides,
});

const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: '0x123abcdeef',
  type: 'Token Swap',
  chainId: mainnet.id,
  from: zeroAddress,
  pending: false,
  localTimestamp: dayjs().unix(),
  walletType: 'injected',
  status: TransactionStatus.Success,
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  title: 'Swap Tokens',
  ...overrides,
});

const mockEvmAdapter = {
  key: TransactionAdapter.EVM,
  getExplorerTxUrl: (pool: any, txKey: string) => `https://etherscan.io/tx/${pool[txKey]?.hash}`,
  // ... other required adapter methods
};

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
    return <TxInfoBlock {...args} transactionsPool={transactionsPool} />;
  },
  args: {
    tx: createMockTx({}),
    adapters: [mockEvmAdapter as any],
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object to display (can be a full or initial transaction).',
    },
    adapters: {
      control: false,
      description: 'An array of configured adapters.',
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
export const Default: Story = {};

/**
 * The view for an `InitialTransaction`, before it has been submitted to the network.
 * It correctly displays the `desiredChainID` and does not show the `TransactionKey` component yet.
 */
export const InitialState: Story = {
  args: {
    tx: createInitialTx(),
  },
};

/**
 * A transaction tracked by Gelato. The underlying `TransactionKey` component will
 * display the "Task ID".
 */
export const GelatoTransaction: Story = {
  args: {
    tx: createMockTx({
      tracker: TransactionTracker.Gelato,
      txKey: 'gelato_task_id_abcdef123456',
    }),
  },
};

/**
 * A transaction on a different network (Sepolia) to demonstrate correct chain info display.
 */
export const DifferentNetwork: Story = {
  args: {
    tx: createMockTx({
      chainId: sepolia.id,
    }),
  },
};

/**
 * An example of customizing the `InfoRow` and `transactionKey` components via render props.
 */
export const WithCustomization: Story = {
  args: {
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
  },
};
