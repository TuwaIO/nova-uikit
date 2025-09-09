import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsHistory, WalletHeader, WalletInfoModal } from '@tuwaio/nova-transactions';
import { EvmTransaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// --- Mocks and Helpers ---

const MOCK_DATA = {
  ens: {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
    name: 'vitalik.eth',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  noEns: {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' as Address,
  },
};

const createMockTx = (overrides: Partial<EvmTransaction<TransactionTracker>>): EvmTransaction<TransactionTracker> => ({
  adapter: TransactionAdapter.EVM,
  tracker: TransactionTracker.Ethereum,
  txKey: `0x_tx_${Math.random().toString(16).slice(2)}`,
  type: 'Token Swap',
  chainId: mainnet.id,
  from: MOCK_DATA.ens.address,
  pending: false,
  localTimestamp: dayjs().unix(),
  walletType: 'injected',
  status: TransactionStatus.Success,
  hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
  title: 'Swap Tokens',
  ...overrides,
});

const mockTransactionsPool = {
  ...[
    createMockTx({ status: TransactionStatus.Success, localTimestamp: dayjs().subtract(2, 'minutes').unix() }),
    createMockTx({ pending: true, status: undefined, localTimestamp: dayjs().subtract(30, 'seconds').unix() }),
    createMockTx({
      status: TransactionStatus.Failed,
      localTimestamp: dayjs().subtract(1, 'hour').unix(),
      chainId: sepolia.id,
    }),
  ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
};

const createMockAdapter = (withEns: boolean) => ({
  key: TransactionAdapter.EVM,
  getExplorerUrl: () => mainnet.blockExplorers.default.url,
  getName: async (address: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return withEns && address === MOCK_DATA.ens.address ? MOCK_DATA.ens.name : null;
  },
  getAvatar: async (name: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return withEns && name === MOCK_DATA.ens.name ? MOCK_DATA.ens.avatar : null;
  },
  // Add other required adapter methods as mocks
  getWalletInfo: () => ({ walletAddress: zeroAddress, walletType: 'injected' }),
  checkChainForTx: async () => {},
  checkTransactionsTracker: () => ({ txKey: 'mock', tracker: TransactionTracker.Ethereum }),
  checkAndInitializeTrackerInStore: async () => {},
});

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletInfoModal> = {
  title: 'Components/Modal/WalletInfoModal',
  component: WalletInfoModal,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isOpen: true,
    setIsOpen: () => {},
    adapters: [createMockAdapter(true) as any],
    connectedAdapterType: TransactionAdapter.EVM,
    connectedWalletAddress: MOCK_DATA.ens.address,
    transactionsPool: mockTransactionsPool,
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    setIsOpen: { action: 'setIsOpen' },
    connectedWalletAddress: { control: 'text' },
    adapters: { control: false },
    connectedAdapterType: { control: false },
    transactionsPool: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * This is an interactive story. Click the button to open and close the modal.
 * This demonstrates the default appearance with a connected wallet and transaction history.
 */
export const Interactive: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--tuwa-bg-primary)] p-8">
        <button onClick={() => setIsOpen(true)}>Open Wallet Modal</button>
        <WalletInfoModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    );
  },
  args: {
    isOpen: false, // Start closed for the interactive story
  },
};

/**
 * The modal's appearance when the connected wallet has no transaction history.
 */
export const EmptyHistory: Story = {
  args: {
    connectedWalletAddress: MOCK_DATA.noEns.address,
    transactionsPool: {},
  },
};

/**
 * The modal's appearance when no wallet is connected.
 */
export const NotConnected: Story = {
  args: {
    connectedWalletAddress: undefined,
    transactionsPool: {},
  },
};

/**
 * An example of extensive customization, replacing the default header, wallet info, and history sections.
 */
export const FullyCustomized: Story = {
  args: {
    customization: {
      components: {
        Header: ({ closeModal }) => (
          <div className="flex items-center justify-between bg-purple-600 p-4 text-white">
            <h2 className="text-lg font-bold">✨ Custom Dashboard</h2>
            <button onClick={closeModal}>Close</button>
          </div>
        ),
        WalletInfo: (props) => (
          <div className="rounded-lg bg-purple-100 p-4">
            <WalletHeader {...props} />
          </div>
        ),
        History: (props) => (
          <div>
            <h3 className="mb-2 font-bold text-purple-700">Custom Activity Feed</h3>
            <TransactionsHistory
              {...props}
              customization={{
                components: {
                  HistoryItem: ({ tx }) => <div className="border-b p-2">Custom Item: {tx.type}</div>,
                },
              }}
            />
          </div>
        ),
      },
    },
  },
};
