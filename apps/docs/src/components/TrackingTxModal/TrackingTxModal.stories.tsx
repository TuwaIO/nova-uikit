import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackingTxModal } from '@tuwaio/nova-transactions';
import {
  EvmTransaction,
  InitialTransaction,
  TransactionAdapter,
  TransactionStatus,
  TxActions,
} from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { action } from 'storybook/actions';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';
// --- Mocks and Helpers ---

const MOCK_DATA = {
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
  txKey: '0x_storybook_modal_tx_key',
  actionKey: 'swapTokens',
};

const createInitialTx = (overrides: Partial<InitialTransaction> = {}): InitialTransaction => ({
  adapter: TransactionAdapter.EVM,
  desiredChainID: mainnet.id,
  type: 'Token Swap',
  title: 'Swapping Tokens',
  description: 'Please confirm the transaction in your wallet.',
  actionKey: MOCK_DATA.actionKey,
  withTrackedModal: true,
  isInitializing: true,
  localTimestamp: dayjs().unix(),
  ...overrides,
});

const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: MOCK_DATA.txKey,
  type: 'Token Swap',
  chainId: mainnet.id,
  from: MOCK_DATA.address,
  pending: true,
  walletType: 'injected',
  status: undefined,
  localTimestamp: dayjs().unix(),
  hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
  title: ['Swapping Tokens...', 'Swap Successful!', 'Swap Failed', 'Swap Replaced'],
  description: [
    'Your transaction is being processed.',
    'You successfully swapped your tokens.',
    'The swap failed.',
    'The swap was replaced.',
  ],
  actionKey: MOCK_DATA.actionKey,
  isTrackedModalOpen: true,
  ...overrides,
});

const mockActions: TxActions = {
  [MOCK_DATA.actionKey]: async () => {
    action('retryAction')();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
};

const mockEvmAdapter = {
  key: TransactionAdapter.EVM,
  getExplorerTxUrl: () => `https://etherscan.io/tx/mock_hash`,
  speedUpTxAction: async (tx: any) => action('speedUpTxAction')(tx),
  cancelTxAction: async (tx: any) => action('cancelTxAction')(tx),
  retryTxAction: ({ handleTransaction, ...rest }: any) => {
    action('retryTxAction')(rest);
    handleTransaction({ ...rest }); // Simulate re-running the transaction
  },
  // ... other required adapter methods
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TrackingTxModal> = {
  title: 'Components/Modal/TrackingTxModal',
  component: TrackingTxModal,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    adapters: [mockEvmAdapter as any],
    actions: mockActions,
    onClose: action('onClose'),
    onOpenWalletInfo: action('onOpenWalletInfo'),
  },
  argTypes: {
    initialTx: { control: false },
    transactionsPool: { control: false },
    adapters: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * An interactive story simulating the full lifecycle of a transaction.
 * It starts with an `initialTx` (user signs), transitions to a pending `activeTx`,
 * and finally resolves to a `Success` status.
 */
export const FullLifecycle: Story = {
  render: (args) => {
    const [initialTx, setInitialTx] = useState<InitialTransaction | undefined>(createInitialTx());
    const [transactionsPool, setTransactionsPool] = useState({});

    useEffect(() => {
      // Simulate the transaction flow
      const runFlow = async () => {
        // 1. Initializing (waiting for signature)
        setInitialTx(createInitialTx());
        setTransactionsPool({});
        await new Promise((r) => setTimeout(r, 2000));

        // 2. Submitted (pending on-chain)
        const pendingTx = createMockTx({ pending: true });
        setInitialTx({ ...initialTx!, isInitializing: false, lastTxKey: MOCK_DATA.txKey });
        setTransactionsPool({ [MOCK_DATA.txKey]: pendingTx });
        await new Promise((r) => setTimeout(r, 3000));

        // 3. Success
        const successTx = createMockTx({ pending: false, status: TransactionStatus.Success });
        setTransactionsPool({ [MOCK_DATA.txKey]: successTx });
      };
      runFlow();
    }, []);

    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <TrackingTxModal {...args} initialTx={initialTx} transactionsPool={transactionsPool} />
      </div>
    );
  },
};

/**
 * A transaction that has failed, showing the error message and a "Retry" button.
 */
export const FailedWithRetry: Story = {
  args: {
    initialTx: createInitialTx({
      isInitializing: false,
      lastTxKey: MOCK_DATA.txKey,
      errorMessage: 'Transaction reverted: Insufficient funds.',
    }),
    transactionsPool: {
      [MOCK_DATA.txKey]: createMockTx({
        pending: false,
        status: TransactionStatus.Failed,
        isError: true,
        errorMessage: 'Transaction reverted: Insufficient funds.',
      }),
    },
    handleTransaction: async (params) => action('handleTransaction')(params),
  },
};

/**
 * A pending transaction with "Speed Up" and "Cancel" actions available.
 */
export const PendingWithActions: Story = {
  args: {
    initialTx: createInitialTx({ isInitializing: false, lastTxKey: MOCK_DATA.txKey }),
    transactionsPool: {
      [MOCK_DATA.txKey]: createMockTx({ pending: true, tracker: TransactionTracker.Ethereum }),
    },
  },
};

/**
 * A transaction that was replaced, showing the final "Replaced" state.
 */
export const Replaced: Story = {
  args: {
    initialTx: createInitialTx({ isInitializing: false, lastTxKey: MOCK_DATA.txKey }),
    transactionsPool: {
      [MOCK_DATA.txKey]: createMockTx({ pending: false, status: TransactionStatus.Replaced }),
    },
  },
};
