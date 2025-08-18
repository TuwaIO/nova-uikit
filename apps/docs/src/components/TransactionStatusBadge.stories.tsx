import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionStatusBadge } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import { zeroAddress, zeroHash } from 'viem';
import { sepolia } from 'viem/chains';

// --- Helper Functions & Types ---

const createMockTx = (overrides: Partial<Transaction<unknown>>): Transaction<unknown> => ({
  tracker: TransactionTracker.Ethereum,
  adapter: TransactionAdapter.EVM,
  txKey: zeroHash,
  type: 'increment',
  chainId: sepolia.id,
  from: zeroAddress,
  pending: false,
  localTimestamp: Date.now(),
  walletType: 'injected',
  ...overrides,
});

// A base type for our stories' arguments.
type StoryArgs = Partial<typeof TransactionStatusBadge>;

// --- Storybook Meta Configuration ---

const meta: Meta<StoryArgs> = {
  title: 'UI Components/basic/TransactionStatusBadge',
  component: TransactionStatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  // We provide a default `tx` object for the main story page.
  args: {
    tx: createMockTx({ pending: true }),
  },
  // argTypes can be inferred automatically by Storybook or defined here if needed.
  // For simplicity and consistency, we will let Storybook handle them.
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---
// Each story now defines its own complete `tx` prop, making them self-contained and clear.

export const Pending: Story = {
  name: 'State: Pending',
  args: {
    tx: createMockTx({ pending: true }),
  },
};

export const Success: Story = {
  name: 'State: Success',
  args: {
    tx: createMockTx({ pending: false, status: TransactionStatus.Success }),
  },
};

export const Failed: Story = {
  name: 'State: Failed',
  args: {
    tx: createMockTx({ pending: false, status: TransactionStatus.Failed, isError: true }),
  },
};

export const Replaced: Story = {
  name: 'State: Replaced',
  args: {
    tx: createMockTx({ pending: false, status: TransactionStatus.Replaced }),
  },
};
