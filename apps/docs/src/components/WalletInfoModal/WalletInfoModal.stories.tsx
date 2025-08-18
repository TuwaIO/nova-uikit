import { StarIcon, UserIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Transaction, TransactionPool } from '@tuwaio/web3-transactions-tracking-core';
import { TransactionStatus } from '@tuwaio/web3-transactions-tracking-core/src';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Address } from 'viem';
import { mainnet, polygon } from 'viem/chains';

import { WalletInfoModal } from './WalletInfoModal';

// --- Mock Transaction Type ---
interface MockTransaction extends Transaction<'evm'> {
  title: string;
  txHash: string;
  recipientAddress: Address;
  amount: string;
  tokenAddress: Address;
}

// --- Mock Data ---
const mockTransactionsPool: TransactionPool<'evm', MockTransaction> = {
  '1': {
    txKey: '1',
    tracker: 'evm' as const,
    type: 'swap',
    chainId: 1,
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    pending: false,
    walletType: 'metamask',
    status: TransactionStatus.Success,
    localTimestamp: dayjs().subtract(2, 'minute').valueOf(),
    title: 'Swap ETH for USDC',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    recipientAddress: '0xA0b86a33E6441c4eB16f6B6a5e4F3e8A5e4C5c8e' as Address,
    amount: '1000000000000000000', // 1 ETH как строка
    tokenAddress: '0x0000000000000000000000000000000000000000' as Address,
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  '2': {
    txKey: '2',
    tracker: 'evm' as const,
    type: 'transfer',
    chainId: 1,
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    pending: true,
    walletType: 'metamask',
    status: undefined, // pending transaction
    localTimestamp: dayjs().subtract(30, 'second').valueOf(),
    title: 'Transfer USDC',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    recipientAddress: '0xB1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0' as Address,
    amount: '500000000', // 500 USDC как строка
    tokenAddress: '0xA0b86a33E6441c4eB16f6B6a5e4F3e8A5e4C5c8e' as Address,
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
  '3': {
    txKey: '3',
    tracker: 'evm' as const,
    type: 'stake',
    chainId: 1,
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    pending: false,
    walletType: 'metamask',
    status: TransactionStatus.Failed,
    localTimestamp: dayjs().subtract(10, 'minute').valueOf(),
    title: 'Stake ETH',
    txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    recipientAddress: '0xC2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1' as Address,
    amount: '2000000000000000000', // 2 ETH как строка
    tokenAddress: '0x0000000000000000000000000000000000000000' as Address,
    hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  },
  '4': {
    txKey: '4',
    tracker: 'evm' as const,
    type: 'bridge',
    chainId: 137, // Polygon
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    pending: false,
    walletType: 'metamask',
    status: TransactionStatus.Replaced,
    localTimestamp: dayjs().subtract(15, 'minute').valueOf(),
    title: 'Bridge USDT to Polygon',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    recipientAddress: '0xD4a3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1' as Address,
    amount: '1000000', // 1 USDT как строка
    tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address,
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
};

const appChains = [mainnet, polygon];

// Well-known addresses
const EXAMPLE_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
  empty: '0x9876543210FeDcBa9876543210FeDcBa98765432' as Address,
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletInfoModal> = {
  title: 'UI Components/WalletInfoModal/WalletInfoModal',
  component: WalletInfoModal,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  args: {
    isOpen: true,
    walletAddress: EXAMPLE_ADDRESSES.vitalik,
    chain: mainnet,
    transactionsPool: mockTransactionsPool,
    appChains,
    setIsOpen: () => {},
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    walletAddress: {
      control: 'text',
      description: 'The connected wallet address',
    },
    chain: {
      control: 'select',
      options: appChains.map((chain) => chain.name),
      mapping: appChains.reduce((acc, chain) => ({ ...acc, [chain.name]: chain }), {}),
      description: 'The viem Chain object for the currently connected network',
    },
    transactionsPool: {
      control: false,
      description: 'The transaction pool from the store',
    },
    appChains: {
      control: false,
      description: 'Array of supported chains',
    },
    setIsOpen: {
      action: 'setIsOpen',
      description: 'Function to control modal open state',
    },
    customization: {
      control: 'object',
      description: 'Customization options for the modal',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Default: Story = {};

export const NotConnected: Story = {
  args: {
    walletAddress: undefined,
  },
};

export const EmptyHistory: Story = {
  args: {
    walletAddress: EXAMPLE_ADDRESSES.empty,
    transactionsPool: {},
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="p-8 bg-[var(--tuwa-bg-primary)] min-h-screen flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 bg-[var(--tuwa-accent)] text-[var(--tuwa-accent-foreground)] hover:opacity-90"
        >
          <UserIcon className="h-4 w-4" />
          Open Wallet Modal
        </button>

        <WalletInfoModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    );
  },
};

export const CustomHeader: Story = {
  args: {
    customization: {
      components: {
        header: ({ closeModal }) => (
          <div className="flex items-center justify-between border-b border-[var(--tuwa-border-primary)] p-4 sticky top-0 left-0 w-full bg-gradient-to-r from-[var(--tuwa-accent)] to-[var(--tuwa-primary)] z-10">
            <div className="flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-[var(--tuwa-text-primary)]" />
              <h2 className="text-lg font-bold text-[var(--tuwa-text-primary)]">My Wallet Dashboard</h2>
              <StarIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <button
              onClick={closeModal}
              className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 text-[var(--tuwa-text-tertiary)] hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ),
      },
    },
  },
};

export const CustomWalletInfo: Story = {
  args: {
    customization: {
      components: {
        walletInfo: ({ walletAddress }) => (
          <div className="bg-gradient-to-br from-[var(--tuwa-accent)] to-[var(--tuwa-primary)] rounded-xl p-6 text-[var(--tuwa-text-primary)]">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-[var(--tuwa-bg-muted)] rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-[var(--tuwa-text-primary)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Premium Wallet</h3>
                <p className="text-[var(--tuwa-text-secondary)] font-mono text-sm">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-[var(--tuwa-bg-muted)] px-2 py-1 rounded-full">VIP</span>
                  <span className="text-xs bg-yellow-500 text-[var(--tuwa-text-primary)] px-2 py-1 rounded-full">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    },
  },
};

export const CustomHistory: Story = {
  args: {
    walletAddress: EXAMPLE_ADDRESSES.vitalik,
    transactionsPool: mockTransactionsPool,
    customization: {
      components: {
        history: ({ transactionsPool, appChains }) => {
          const transactions = Object.values(transactionsPool);

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Activity Feed</h3>
                <span className="text-xs bg-[var(--tuwa-bg-muted)] px-2 py-1 rounded-full text-[var(--tuwa-text-secondary)]">
                  {transactions.length} transactions
                </span>
              </div>

              {transactions.length > 0 ? (
                <div className="grid gap-3">
                  {transactions.map((tx) => {
                    const mockTx = tx as MockTransaction;
                    const chainName = appChains?.find((chain) => chain.id === mockTx.chainId)?.name || 'Unknown';

                    const getStatusColor = () => {
                      if (mockTx.status === TransactionStatus.Success) return 'bg-[var(--tuwa-success-icon)]';
                      if (mockTx.status === TransactionStatus.Failed) return 'bg-[var(--tuwa-error-icon)]';
                      if (mockTx.status === TransactionStatus.Replaced) return 'bg-[var(--tuwa-info-icon)]';
                      return 'bg-[var(--tuwa-warning-icon)]'; // pending
                    };

                    const getStatusText = () => {
                      if (mockTx.status === TransactionStatus.Success) return 'success';
                      if (mockTx.status === TransactionStatus.Failed) return 'failed';
                      if (mockTx.status === TransactionStatus.Replaced) return 'replaced';
                      return 'pending';
                    };

                    const getTimeAgo = (timestamp: number) => {
                      return dayjs(timestamp).fromNow();
                    };

                    return (
                      <div
                        key={mockTx.txKey}
                        className="flex items-center gap-3 p-3 bg-[var(--tuwa-bg-muted)] rounded-lg border border-[var(--tuwa-border-secondary)]"
                      >
                        <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-[var(--tuwa-text-primary)]">{mockTx.title}</div>
                          <div className="text-xs text-[var(--tuwa-text-secondary)] capitalize">
                            {getStatusText()} • {chainName} • {getTimeAgo(mockTx.localTimestamp)}
                          </div>
                        </div>
                        <StarIcon className="h-4 w-4 text-[var(--tuwa-warning-icon)]" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--tuwa-text-secondary)]">No activity to show</div>
              )}
            </div>
          );
        },
      },
    },
  },
};

export const StateComparison: Story = {
  render: () => {
    const [activeModal, setActiveModal] = useState<'default' | 'empty' | 'disconnected' | null>(null);

    const modalConfigs = [
      {
        key: 'default' as const,
        title: 'With Transactions',
        description: 'Shows wallet with transaction history',
        props: {
          walletAddress: EXAMPLE_ADDRESSES.vitalik,
          transactionsPool: mockTransactionsPool,
        },
      },
      {
        key: 'empty' as const,
        title: 'Empty History',
        description: 'Connected wallet without transactions',
        props: {
          walletAddress: EXAMPLE_ADDRESSES.empty,
          transactionsPool: {} as TransactionPool<'evm', MockTransaction>,
        },
      },
      {
        key: 'disconnected' as const,
        title: 'Not Connected',
        description: 'No wallet connected state',
        props: {
          walletAddress: undefined,
          transactionsPool: {} as TransactionPool<'evm', MockTransaction>,
        },
      },
    ];

    return (
      <div className="p-8 space-y-6 bg-[var(--tuwa-bg-primary)] min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[var(--tuwa-text-primary)]">Modal State Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modalConfigs.map(({ key, title, description }) => (
              <button
                key={key}
                onClick={() => setActiveModal(key)}
                className="cursor-pointer flex flex-col items-start text-left p-6 bg-[var(--tuwa-bg-secondary)] border-2 border-[var(--tuwa-border-secondary)] hover:border-[var(--tuwa-accent)] hover:bg-[var(--tuwa-bg-muted)] transition-all duration-200 rounded-lg"
              >
                <div className="w-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-[var(--tuwa-text-primary)]">{title}</h3>
                    <UserIcon className="h-5 w-5 text-[var(--tuwa-accent)] flex-shrink-0" />
                  </div>

                  <p className="text-sm text-[var(--tuwa-text-secondary)] mb-4">{description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-[var(--tuwa-accent)] text-[var(--tuwa-accent-foreground)] px-3 py-1 rounded-full font-medium">
                      Click to open
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {activeModal && (
            <WalletInfoModal
              isOpen={true}
              setIsOpen={() => setActiveModal(null)}
              chain={mainnet}
              appChains={appChains}
              transactionsPool={
                modalConfigs.find((config) => config.key === activeModal)?.props.transactionsPool ||
                mockTransactionsPool
              }
              {...modalConfigs.find((config) => config.key === activeModal)?.props}
            />
          )}
        </div>
      </div>
    );
  },
};

export const FullyCustomized: Story = {
  args: {
    customization: {
      motionProps: {
        initial: { opacity: 0, rotateY: -90, scale: 0.8 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: 90, scale: 0.8 },
        transition: { duration: 0.5, ease: 'backOut' },
      },
      classNames: {
        contentWrapper:
          'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-2xl backdrop-blur-sm',
      },
      components: {
        header: ({ closeModal }) => (
          <div className="flex items-center justify-between p-6 border-b border-purple-200 bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Elite Crypto Dashboard</h2>
            </div>
            <button
              onClick={closeModal}
              className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ),
        walletInfo: ({ walletAddress }) => (
          <div className="relative p-6 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-xl border border-purple-200 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Elite Wallet</h3>
                <p className="text-gray-600 font-mono text-sm bg-white/60 px-2 py-1 rounded">
                  {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : 'Disconnected'}
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full font-bold shadow-lg">
                    ⭐ PREMIUM
                  </span>
                  <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full border border-green-400 font-medium">
                    ✓ Verified
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <StarIcon className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
            </div>
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-300 rounded-full blur-sm opacity-60"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-300 rounded-full blur-sm opacity-40"></div>
          </div>
        ),
      },
    },
  },
};
