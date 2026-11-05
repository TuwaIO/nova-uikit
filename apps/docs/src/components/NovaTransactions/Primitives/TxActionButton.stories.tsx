import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxActionButton, type TxActionButtonProps } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, Transaction, TransactionPool, TransactionStatus } from '@tuwaio/pulsar-core';
import { useRef, useState } from 'react';
import { action } from 'storybook/actions';

import { createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof TxActionButton> = {
  title: 'Nova Transactions/Primitives/TxActionButton',
  component: TxActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Initiate Transaction',
    getLastTxKey: () => undefined,
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
      description:
        'Returns the key of the last transaction added to the pool. A key that has not changed after the action means that no transaction was added, and the button goes back to idle.',
    },
    transactionsPool: {
      control: 'object',
      description: 'The global transaction pool from the Pulsar store.',
    },
    walletAddress: {
      control: 'text',
      description: 'The currently connected wallet address. Changing this resets the button to idle.',
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

const MOCK_TX_KEY = '0x_storybook_tx_hash_action_button';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * What a Pulsar store does for the button: the last key changes only when a transaction is added, the action resolves once its
 * tracker has started, and the result comes to the pool later.
 */
function SimulatedButton({
  result,
  label,
  ...args
}: Omit<TxActionButtonProps<Transaction>, 'action' | 'getLastTxKey' | 'transactionsPool' | 'children'> & {
  result: Partial<EvmTransaction>;
  label: TxActionButtonProps<Transaction>['children'];
}) {
  const [transactionsPool, setTransactionsPool] = useState<TransactionPool<Transaction>>({});
  const lastTxKey = useRef<string | undefined>(undefined);

  const simulate = async () => {
    action('action-triggered')();
    // The wallet signs, and a new transaction is added under a key of its own
    await wait(1200);
    const txKey = `${MOCK_TX_KEY}_${Date.now()}`;
    lastTxKey.current = txKey;
    setTransactionsPool({ [txKey]: createMockTx(OrbitAdapter.EVM, { txKey, hash: txKey, pending: true }) });

    void wait(2000).then(() =>
      setTransactionsPool({
        [txKey]: createMockTx(OrbitAdapter.EVM, { txKey, hash: txKey, pending: false, ...result }),
      }),
    );
  };

  return (
    <TxActionButton
      {...args}
      action={simulate}
      getLastTxKey={() => lastTxKey.current}
      transactionsPool={transactionsPool}
    >
      {label}
    </TxActionButton>
  );
}

/** The simulated stories run the action and the pool of `SimulatedButton`: the controls of those two would do nothing. */
const simulatedStory = {
  args: { children: 'Click to Simulate' },
  parameters: { controls: { exclude: ['action', 'getLastTxKey', 'transactionsPool'] } },
};

/**
 * Click the button: it goes from `loading` through the wait to `succeed`, as the transaction appears in the pool and is confirmed,
 * and back to idle after the `resetTimeout` (3 seconds).
 */
export const FullLifecycle: Story = {
  ...simulatedStory,
  render: ({ children, walletAddress, resetTimeout }) => (
    <SimulatedButton
      walletAddress={walletAddress}
      resetTimeout={resetTimeout}
      label={children}
      result={{ status: TransactionStatus.Success }}
    />
  ),
};

/**
 * The default, idle state of the button, ready to be clicked. The action here adds no transaction, so the button goes back to
 * idle: this is what an app sees when it catches a rejection and returns nothing.
 */
export const Idle: Story = {
  args: {
    transactionsPool: {},
    action: () => wait(800).then(() => undefined),
  },
};

/**
 * Click the button to see the `loading` state: the wallet never answers here.
 */
export const Loading: Story = {
  args: {
    transactionsPool: {},
    action: () => new Promise(() => {}),
  },
};

/**
 * Click the button: it ends in `succeed`, and goes back to idle after the `resetTimeout` (3 seconds).
 */
export const Success: Story = {
  ...simulatedStory,
  render: FullLifecycle.render,
};

/**
 * Click the button: it ends in `failed`, and goes back to idle after the timeout.
 */
export const Failed: Story = {
  ...simulatedStory,
  render: ({ children, walletAddress, resetTimeout }) => (
    <SimulatedButton
      walletAddress={walletAddress}
      resetTimeout={resetTimeout}
      label={children}
      result={{ status: TransactionStatus.Failed, isError: true }}
    />
  ),
};

/**
 * Click the button: the transaction is cancelled in the wallet, which the button says, and it goes back to idle.
 */
export const Cancelled: Story = {
  ...simulatedStory,
  render: ({ children, walletAddress, resetTimeout }) => (
    <SimulatedButton
      walletAddress={walletAddress}
      resetTimeout={resetTimeout}
      label={children}
      result={{
        status: TransactionStatus.Replaced,
        replacedTxHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
        replacedReason: 'cancelled',
      }}
    />
  ),
};

/**
 * The action throws before anything reaches the pool: the button ends in `failed` (with the error toast inside
 * `NovaTransactionsProvider`).
 */
export const Refused: Story = {
  args: {
    transactionsPool: {},
    action: async () => {
      await wait(800);
      throw new Error('The wallet refused the transaction');
    },
  },
};
