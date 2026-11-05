import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackingTxModal } from '@tuwaio/nova-transactions';
import { OrbitAdapter, SOLANA_CHAIN_IDS } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  InitialTransaction,
  SolanaTransaction,
  Transaction,
  TransactionStatus,
  TransactionTracker,
} from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { action } from 'storybook/actions';
import { Address, Hex } from 'viem';
import { mainnet } from 'viem/chains';

import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';

// --- Mocks and Helpers ---

const MOCK_DATA = {
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
  solanaAddress: 'AobnbeZ6QB2xdnPzBkaw2Stea5trqhamaoKyVMYenV3u',
  // In this package a new hash means a speed-up: a record keeps its hash from the first step to the last
  txKey: '0xb4c039c80585fc44e06f1930f8d0491a5050d7a6aef132359b94b067f5f599d5' as Hex,
  newTxKey: '0x9c4e2a7b1d8f3e6c0a5b9d2f7e1c4a8b6d3f0e5c2a9b7d4f1e8c6a3b0d5f2e7c' as Hex,
  cancelTxKey: '0x7f2a51d09c1e4b8a6d3f0e2c9b7a1f5d8e3c6b4a2d1f0e9c8b7a6f5e4d3c2b1a' as Hex,
  signature: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW',
  action: async () => {
    action('retryAction')();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return undefined;
  },
};

const TITLE = ['Swapping Tokens...', 'Swap Successful!', 'Swap Failed', 'Swap Replaced'] as [
  string,
  string,
  string,
  string,
];
const DESCRIPTION = [
  'Your transaction is being processed.',
  'You successfully swapped your tokens.',
  'The swap failed.',
  'The swap was replaced.',
] as [string, string, string, string];

const createInitialTx = (overrides: Partial<InitialTransaction> = {}): InitialTransaction => ({
  adapter: OrbitAdapter.EVM,
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

const createMockTx = (startedAt: number, overrides: Partial<EvmTransaction> = {}): EvmTransaction => ({
  adapter: OrbitAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: MOCK_DATA.txKey,
  hash: MOCK_DATA.txKey,
  type: 'Token Swap',
  chainId: mainnet.id,
  from: MOCK_DATA.address,
  sender: MOCK_DATA.address,
  pending: true,
  // MetaMask, with the nonce and the fees the tracker read: what Speed up and Cancel need
  connectorType: 'evm:metamask',
  nonce: 42,
  maxFeePerGas: '30000000000',
  maxPriorityFeePerGas: '1500000000',
  status: undefined,
  localTimestamp: startedAt,
  title: TITLE,
  description: DESCRIPTION,
  isTrackedModalOpen: true,
  ...overrides,
});

const createMockSolanaTx = (startedAt: number, overrides: Partial<SolanaTransaction> = {}): SolanaTransaction => ({
  adapter: OrbitAdapter.SOLANA,
  tracker: TransactionTracker.Solana,
  txKey: MOCK_DATA.signature,
  slot: 422858653,
  recentBlockhash: 'GXRyAk5hqGFKPEpxUUAypCUcHXanCzCxECfu11jQe9nd',
  confirmations: 0,
  pending: true,
  connectorType: 'solana:phantom',
  status: undefined,
  localTimestamp: startedAt,
  chainId: SOLANA_CHAIN_IDS.devnet,
  from: MOCK_DATA.solanaAddress,
  type: 'Token Swap',
  title: TITLE,
  description: DESCRIPTION,
  isTrackedModalOpen: true,
  ...overrides,
});

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TrackingTxModal> = {
  title: 'Nova Transactions/Modals/TrackingTxModal',
  component: TrackingTxModal,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    adapter: [mockEvmAdapter, mockSolanaAdapter],
    onClose: action('onClose'),
    onOpenAllTransactions: action('onOpenAllTransactions'),
  },
  argTypes: {
    initialTx: { control: false },
    transactionsPool: { control: false },
    adapter: { control: false },
    executeTxAction: { control: false },
    connectedWalletAddress: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/** What a story does with the modal, in the order of the steps of a real transaction. */
type Flow<T> = {
  /** The time of the first step: it stays the same in every step, as in a real record. */
  startedAt: number;
  /** Waits. A newer run stops the older one here. */
  pause: (ms: number) => Promise<void>;
  /** Puts the records in the pool. */
  show: (...records: T[]) => void;
  /** The modal moves on to this record. */
  follow: (txKey: string) => void;
  /** Starts over. */
  restart: () => void;
};

/**
 * Runs a story like the store runs a real transaction. Close and the backdrop really close the modal, and Run again starts over.
 *
 * @param props - The args of the story, the first state of the modal, the steps, the connected wallet and the adapter methods
 * that change the steps.
 * @returns The modal on a canvas with the Run again button.
 */
function ModalFlow<T extends Transaction>({
  args,
  initial,
  script,
  walletAddress,
  adapterMethods,
}: {
  args: Story['args'];
  initial: () => InitialTransaction;
  script: (flow: Flow<T>) => Promise<void>;
  walletAddress: string;
  adapterMethods?: (flow: Flow<T> | undefined) => Record<string, unknown>;
}) {
  const [run, setRun] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [initialTx, setInitialTx] = useState(initial);
  const [pool, setPool] = useState<Record<string, T>>({});
  const [currentFlow, setCurrentFlow] = useState<Flow<T>>();

  useEffect(() => {
    let isStopped = false;
    const flow: Flow<T> = {
      startedAt: dayjs().unix(),
      pause: async (ms) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        if (isStopped) throw new Error('A newer run took over');
      },
      show: (...records) => setPool(Object.fromEntries(records.map((tx) => [tx.txKey, tx]))),
      follow: (txKey) => setInitialTx((current) => ({ ...current, isInitializing: false, lastTxKey: txKey })),
      restart: () => setRun((current) => current + 1),
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- A story restarts its steps here, as the store does for a new transaction
    setCurrentFlow(flow);
    setIsClosed(false);
    setInitialTx(initial());
    setPool({});
    script(flow).catch(() => {});
    return () => {
      isStopped = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const shownPool = isClosed
    ? Object.fromEntries(Object.entries(pool).map(([key, tx]) => [key, { ...tx, isTrackedModalOpen: false }]))
    : pool;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-[#0a0e27]">
      <button
        type="button"
        onClick={() => setRun((current) => current + 1)}
        className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3 py-2 text-sm text-[var(--tuwa-text-primary)]"
      >
        Run again
      </button>
      <TrackingTxModal
        {...args}
        adapter={
          adapterMethods
            ? [{ ...mockEvmAdapter, ...adapterMethods(currentFlow) }, mockSolanaAdapter]
            : (args?.adapter ?? [mockEvmAdapter, mockSolanaAdapter])
        }
        connectedWalletAddress={walletAddress}
        executeTxAction={action('executeTxAction') as never}
        initialTx={isClosed ? { ...initialTx, withTrackedModal: false } : initialTx}
        transactionsPool={shownPool as never}
        onClose={(txKey) => {
          args?.onClose?.(txKey);
          setIsClosed(true);
        }}
        onOpenAllTransactions={args?.onOpenAllTransactions ?? action('onOpenAllTransactions')}
      />
    </div>
  );
}

// --- Stories ---

/**
 * Full lifecycle of an EVM transaction: the wallet signs, the transaction waits for a block, the result. Speed up and Cancel
 * report their calls in the Actions panel here; the next story plays them out.
 */
export const FullLifecycle: Story = {
  render: (args) => (
    <ModalFlow<EvmTransaction>
      args={args}
      initial={createInitialTx}
      walletAddress={MOCK_DATA.address}
      script={async ({ startedAt, pause, show, follow }) => {
        await pause(2000);
        show(createMockTx(startedAt));
        follow(MOCK_DATA.txKey);
        await pause(4000);
        show(createMockTx(startedAt, { pending: false, status: TransactionStatus.Success }));
      }}
    />
  ),
};

/**
 * A transaction that waits for a block until you act: press Speed up to follow the record that goes on with the new hash, or
 * Cancel to see the money stay where it was.
 */
export const SpeedUpOrCancel: Story = {
  render: (args) => (
    <ModalFlow<EvmTransaction>
      args={args}
      initial={createInitialTx}
      walletAddress={MOCK_DATA.address}
      script={async ({ startedAt, pause, show, follow }) => {
        await pause(1500);
        show(createMockTx(startedAt));
        follow(MOCK_DATA.txKey);
      }}
      adapterMethods={(flow) => ({
        speedUpTxAction: async (tx: Transaction) => {
          action('speedUpTxAction')(tx);
          if (!flow) return MOCK_DATA.newTxKey;
          const { startedAt, pause, show, follow } = flow;
          const replaced = createMockTx(startedAt, {
            pending: false,
            status: TransactionStatus.Replaced,
            replacedTxHash: MOCK_DATA.newTxKey,
            replacedReason: 'repriced',
            isTrackedModalOpen: false,
          });
          const next = createMockTx(startedAt, {
            txKey: MOCK_DATA.newTxKey,
            hash: MOCK_DATA.newTxKey,
            replaces: MOCK_DATA.txKey,
          });
          show(replaced, next);
          follow(MOCK_DATA.newTxKey);
          void pause(3500).then(() => show(replaced, { ...next, pending: false, status: TransactionStatus.Success }));
          return MOCK_DATA.newTxKey;
        },
        cancelTxAction: async (tx: Transaction) => {
          action('cancelTxAction')(tx);
          flow?.show(
            createMockTx(flow.startedAt, {
              pending: false,
              status: TransactionStatus.Replaced,
              replacedTxHash: MOCK_DATA.cancelTxKey,
              replacedReason: 'cancelled',
              title: ['Swapping Tokens...', 'Swap Successful!', 'Swap Failed', 'Swap Cancelled'],
              description: [
                'Your transaction is being processed.',
                'You successfully swapped your tokens.',
                'The swap failed.',
                'The swap was cancelled. The money did not move.',
              ],
            }),
          );
          return MOCK_DATA.cancelTxKey;
        },
      })}
    />
  ),
};

/**
 * A transaction reverted by the network: the error block and Retry, which starts the operation over.
 */
export const Failed: Story = {
  render: (args) => (
    <ModalFlow<EvmTransaction>
      args={args}
      initial={createInitialTx}
      walletAddress={MOCK_DATA.address}
      script={async ({ startedAt, pause, show, follow }) => {
        await pause(1500);
        show(createMockTx(startedAt));
        follow(MOCK_DATA.txKey);
        await pause(2500);
        show(
          createMockTx(startedAt, {
            pending: false,
            status: TransactionStatus.Failed,
            isError: true,
            error: { message: 'execution reverted: ERC20: transfer amount exceeds balance', raw: {} },
          }),
        );
      }}
      adapterMethods={(flow) => ({
        retryTxAction: async () => {
          action('retryAction')();
          flow?.restart();
        },
      })}
    />
  ),
};

/**
 * Full lifecycle of a Solana transaction: pending, confirmed (about a second after sending), then finalized.
 */
export const SolanaLifecycle: Story = {
  render: (args) => (
    <ModalFlow<SolanaTransaction>
      args={args}
      initial={() => createInitialTx({ adapter: OrbitAdapter.SOLANA, desiredChainID: 'devnet' })}
      walletAddress={MOCK_DATA.solanaAddress}
      script={async ({ startedAt, pause, show, follow }) => {
        await pause(2000);
        show(createMockSolanaTx(startedAt));
        follow(MOCK_DATA.signature);
        await pause(1000);
        // The Pulsar tracker reports the `confirmed` commitment about a second after sending...
        show(createMockSolanaTx(startedAt, { confirmations: 1, confirmationStatus: 'confirmed' }));
        await pause(3000);
        // ...and `Success` once the transaction is finalized.
        show(
          createMockSolanaTx(startedAt, {
            confirmations: 'MAX',
            confirmationStatus: 'finalized',
            pending: false,
            status: TransactionStatus.Success,
          }),
        );
      }}
    />
  ),
};
