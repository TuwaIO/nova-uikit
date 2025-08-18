import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxActionButton, TxActionButtonProps } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import { zeroAddress } from 'viem';
import { sepolia } from 'viem/chains';

const MOCK_TX_KEY = '0x_storybook_tx_hash';

// --- Helper Functions & Types ---

const createMockTx = (overrides: Partial<Transaction<unknown>>): Transaction<unknown> => ({
  tracker: TransactionTracker.Ethereum,
  adapter: TransactionAdapter.EVM,
  txKey: MOCK_TX_KEY,
  type: 'storybook-action',
  chainId: sepolia.id,
  from: zeroAddress,
  pending: true,
  localTimestamp: Date.now(),
  walletType: 'injected',
  status: undefined,
  ...overrides,
});

// A base type for our stories' arguments.
type StoryArgs = Partial<TxActionButtonProps<unknown, Transaction<unknown>>>;

// --- Storybook Meta Configuration ---

const meta: Meta<StoryArgs> = {
  title: 'UI Components/TxActionButton',
  // @ts-expect-error
  component: TxActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Initiate Transaction',
    action: async () => {
      console.log('Action triggered!');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    getLastTxKey: () => MOCK_TX_KEY,
    transactionsPool: {
      [MOCK_TX_KEY]: createMockTx({ pending: false, status: TransactionStatus.Success }),
    },
    resetTimeout: 2500,
  },
  argTypes: {
    children: {
      control: 'text',
      name: 'children',
      description: 'Can be text or a React component.',
    },
    className: {
      control: 'text',
      name: 'className',
      description: 'Optional additional CSS classes to apply to the button.',
    },
    disabled: {
      control: 'boolean',
    },
    resetTimeout: {
      control: 'number',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Success: Story = {
  name: 'State: Success',
  args: {
    transactionsPool: {
      [MOCK_TX_KEY]: createMockTx({ pending: false, status: TransactionStatus.Success }),
    },
  },
};

export const Failed: Story = {
  name: 'State: Failed',
  args: {
    transactionsPool: {
      [MOCK_TX_KEY]: createMockTx({ pending: false, status: TransactionStatus.Failed }),
    },
  },
};

export const Replaced: Story = {
  name: 'State: Replaced',
  args: {
    transactionsPool: {
      [MOCK_TX_KEY]: createMockTx({ pending: false, status: TransactionStatus.Replaced }),
    },
  },
};
