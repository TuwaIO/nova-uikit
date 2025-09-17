import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackingTxModal } from '@tuwaio/nova-transactions';
import {
  EvmTransaction,
  InitialTransaction,
  SolanaTransaction,
  TransactionAdapter,
  TransactionStatus,
  TransactionTracker,
} from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { action } from 'storybook/actions';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';

import { mockEvmAdapter, mockSolanaAdapter } from '../../utils/mockAdapters';

// --- Mocks and Helpers ---

const MOCK_DATA = {
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
  txKey: '0x_storybook_modal_tx_key',
  actionKey: 'swapTokens',
  action: async () => {
    action('retryAction')();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return undefined;
  },
};

// --- EVM --- //

const createInitialTx = (overrides: Partial<InitialTransaction> = {}): InitialTransaction => ({
  adapter: TransactionAdapter.EVM,
  desiredChainID: mainnet.id,
  type: 'Token Swap',
  title: 'Swapping Tokens',
  description: 'Please confirm the transaction in your wallet.',
  actionFunction: MOCK_DATA.action,
  withTrackedModal: true,
  isInitializing: true,
  localTimestamp: dayjs().unix(),
  ...overrides,
});

const createMockTx = (overrides: Partial<EvmTransaction>): EvmTransaction => ({
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
  isTrackedModalOpen: true,
  ...overrides,
});

// --- Solana --- //

const createMockSolanaTx = (overrides: Partial<SolanaTransaction> = {}): SolanaTransaction => ({
  adapter: TransactionAdapter.SOLANA,
  tracker: TransactionTracker.Solana,
  txKey: MOCK_DATA.txKey,
  slot: Math.floor(Math.random() * 1000000),
  recentBlockhash: `hash_${Math.random().toString(16).slice(2, 8)}`,
  confirmations: 5,
  pending: true,
  walletType: 'Phantom',
  status: undefined,
  localTimestamp: dayjs().unix(),
  chainId: 'devnet',
  from: '0x0',
  type: 'Test Transaction',
  title: 'Solana Test',
  description: 'Testing Solana Transaction Flow',
  isTrackedModalOpen: true,
  ...overrides,
});

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TrackingTxModal> = {
  title: 'Components/Modal/TrackingTxModal',
  component: TrackingTxModal,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    adapter: [mockEvmAdapter, mockSolanaAdapter],
    onClose: action('onClose'),
    onOpenWalletInfo: action('onOpenWalletInfo'),
  },
  argTypes: {
    initialTx: { control: false },
    transactionsPool: { control: false },
    adapter: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Full lifecycle of an EVM transaction.
 */
export const FullLifecycle: Story = {
  render: (args) => {
    const [initialTx, setInitialTx] = useState<InitialTransaction>(createInitialTx());
    const [transactionsPool, setTransactionsPool] = useState<Record<string, EvmTransaction>>({});

    useEffect(() => {
      const runFlow = async () => {
        setInitialTx(createInitialTx());
        setTransactionsPool({});
        await new Promise((r) => setTimeout(r, 2000));

        const pendingTx = createMockTx({ pending: true });
        setInitialTx({ ...initialTx, isInitializing: false, lastTxKey: MOCK_DATA.txKey });
        setTransactionsPool({ [MOCK_DATA.txKey]: pendingTx });
        await new Promise((r) => setTimeout(r, 3000));

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
 * Full lifecycle of a Solana transaction.
 */
export const SolanaLifecycle: Story = {
  render: (args) => {
    const [initialTx, setInitialTx] = useState<InitialTransaction>(createInitialTx({ desiredChainID: 'devnet' }));
    const [transactionsPool, setTransactionsPool] = useState<Record<string, SolanaTransaction>>({
      [MOCK_DATA.txKey]: createMockSolanaTx({ pending: true }),
    });

    useEffect(() => {
      const runFlow = async () => {
        setInitialTx(createInitialTx({ desiredChainID: 'devnet' }));
        setTransactionsPool({});
        await new Promise((r) => setTimeout(r, 2000));

        setInitialTx({ ...initialTx, isInitializing: false, lastTxKey: MOCK_DATA.txKey });
        setTransactionsPool({
          [MOCK_DATA.txKey]: createMockSolanaTx({
            pending: true,
          }),
        });
        await new Promise((r) => setTimeout(r, 3000));
        setTransactionsPool({
          [MOCK_DATA.txKey]: createMockSolanaTx({
            confirmations: 32,
            pending: false,
            status: TransactionStatus.Success,
          }),
        });
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
