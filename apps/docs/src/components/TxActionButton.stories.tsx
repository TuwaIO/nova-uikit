import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxActionButton } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { useState } from 'react';
import { action } from 'storybook/actions';

import { createMockTx } from '../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxActionButton> = {
  title: 'Components/Actions/TxActionButton',
  component: TxActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Initiate Transaction',
    getLastTxKey: () => '0x_storybook_tx_hash_action_button',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    resetTimeout: 3000,
  },
  argTypes: {
    children: {
      control: 'text',
      description: "The default content for the button's 'idle' state.",
    },
    action: {
      action: 'action-triggered',
      description: 'The async function to execute when the button is clicked.',
    },
    getLastTxKey: {
      control: false,
      description: 'A function that returns the key of the most recently initiated transaction.',
    },
    transactionsPool: {
      control: 'object',
      description: 'The global transaction pool from the Pulsar store.',
    },
    walletAddress: {
      control: 'text',
      description: 'If provided, the button will only track transactions from this address.',
    },
    resetTimeout: {
      control: 'number',
      description: 'The duration (in ms) to display a final state before resetting.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * This is an interactive story that simulates the full lifecycle of a transaction.
 * Click the button to see it transition from `loading` to `succeed`. The transaction
 * pool is updated after a delay to mimic on-chain confirmation.
 */
export const FullLifecycle: Story = {
  render: (args) => {
    const [transactionsPool, setTransactionsPool] = useState({});
    const MOCK_TX_KEY = '0x_storybook_tx_hash_action_button';

    const handleAction = async () => {
      action('action-triggered');
      // 1. Initially, the pool is empty.
      setTransactionsPool({});
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate signing

      // 2. After signing, a pending transaction appears in the pool.
      const pendingTx = createMockTx(OrbitAdapter.EVM, { pending: true, status: undefined }) as EvmTransaction;
      setTransactionsPool({ [MOCK_TX_KEY]: pendingTx });
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate mining

      // 3. The transaction is successful.
      const successTx = createMockTx(OrbitAdapter.EVM, {
        pending: false,
        status: TransactionStatus.Success,
      }) as EvmTransaction;
      setTransactionsPool({ [MOCK_TX_KEY]: successTx });
    };

    return (
      <TxActionButton {...args} action={handleAction} transactionsPool={transactionsPool}>
        Click to Simulate
      </TxActionButton>
    );
  },
};

/**
 * The default, idle state of the button, ready to be clicked.
 */
export const Idle: Story = {
  args: {
    transactionsPool: {},
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    action: action('action-triggered'),
  },
};

/**
 * A story to demonstrate the `loading` state. Note: This state is typically transient
 * and will automatically change once the transaction appears in the pool.
 */
export const Loading: Story = {
  args: {
    // To see this state, click the button and then quickly switch to the Docs tab.
    transactionsPool: {},
    action: () => new Promise(() => {}), // An action that never resolves
  },
};

/**
 * The button in a `succeed` state. After the `resetTimeout` (3 seconds), it will revert to idle.
 */
export const Success: Story = {
  args: {
    transactionsPool: {
      '0x_storybook_tx_hash_action_button': createMockTx(OrbitAdapter.EVM, {
        status: TransactionStatus.Success,
      }),
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    action: action('action-triggered'),
  },
};

/**
 * The button in a `failed` state. It will reset to idle after the timeout.
 */
export const Failed: Story = {
  args: {
    transactionsPool: {
      '0x_storybook_tx_hash_action_button': createMockTx(OrbitAdapter.EVM, {
        status: TransactionStatus.Failed,
      }),
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    action: action('action-triggered'),
  },
};
