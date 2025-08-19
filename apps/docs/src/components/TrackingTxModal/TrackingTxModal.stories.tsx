// apps/docs/src/components/TrackingTxModal/TrackingTxModal.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackingTxModal, type TxActions } from '@tuwaio/nova-transactions';
import { Transaction, TransactionAdapter, TransactionStatus } from '@tuwaio/pulsar-core';
import { TransactionTracker } from '@tuwaio/pulsar-evm';
import type { Config } from '@wagmi/core';
import dayjs from 'dayjs';
import type { Chain } from 'viem';
import { zeroAddress } from 'viem';

// --- Mock Data Types ---
type MockTransaction = Transaction<TransactionTracker>;

// --- Mock Data ---
const mockChains: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.example.com'] } },
    blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
  },
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: { default: { http: ['https://polygon.example.com'] } },
    blockExplorers: { default: { name: 'PolygonScan', url: 'https://polygonscan.com' } },
  },
];

const createMockTransaction = (overrides: Partial<MockTransaction> = {}): MockTransaction => ({
  txKey: 'mock-tx-key-123',
  tracker: TransactionTracker.Ethereum,
  adapter: TransactionAdapter.EVM,
  type: 'Swap',
  chainId: 1,
  from: '0x1234567890123456789012345678901234567890',
  pending: true,
  walletType: 'metaMask',
  status: undefined,
  localTimestamp: dayjs().unix(),
  hash: '0x1234567890abcdef1234567890abcdef12345678',
  title: 'Swap Tokens',
  description: 'Swapping 100 USDC for ETH',
  actionKey: 'swapTokens',
  isError: false,
  isTrackedModalOpen: true,
  nonce: 42,
  maxFeePerGas: '20000000000',
  maxPriorityFeePerGas: '1000000000',
  payload: { from: 'USDC', to: 'ETH', amount: '100' },
  ...overrides,
});

const mockActions: TxActions = {
  swapTokens: async () => {
    console.log('Retrying swap tokens...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  transferTokens: async () => {
    console.log('Retrying transfer tokens...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TrackingTxModal> = {
  title: 'UI Components/TrackingTxModal/TrackingTxModal',
  component: TrackingTxModal,
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
    appChains: mockChains,
    transactionsPool: {},
    actions: mockActions,
    onClose: (txKey?: string) => console.log('Modal closed:', txKey),
    onOpenWalletInfo: () => console.log('Opening wallet info...'),
  },
  argTypes: {
    onClose: { action: 'onClose' },
    onOpenWalletInfo: { action: 'onOpenWalletInfo' },
    className: { control: 'text' },
    appChains: { control: false },
    transactionsPool: { control: false },
    actions: { control: false },
    customization: { control: false },
    initialTx: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Default: Story = {
  name: 'Default (Pending)',
  args: {
    initialTx: {
      localTimestamp: dayjs().unix(),
      isInitializing: false,
      withTrackedModal: true,
      adapter: TransactionAdapter.EVM,
      desiredChainID: 1,
      type: 'Swap',
      from: zeroAddress,
      walletType: 'injected',
      actionKey: 'swapTokens',
      title: 'Swap Tokens',
      description: 'Swapping 100 USDC for ETH',
    },
  },
};

const successTx = createMockTransaction({
  txKey: 'mock-tx-key-success',
  status: TransactionStatus.Success,
  pending: false,
  title: 'Swap Complete',
  description: 'Successfully swapped 100 USDC for 0.05 ETH',
});
export const Success: Story = {
  name: 'Successful Transaction',
  args: {
    transactionsPool: { [successTx.txKey]: successTx },
    initialTx: {
      localTimestamp: dayjs().unix(),
      isInitializing: false,
      withTrackedModal: true,
      lastTxKey: successTx.txKey,
      adapter: successTx.adapter,
      desiredChainID: successTx.chainId,
      type: successTx.type,
      from: successTx.from,
      walletType: successTx.walletType,
    },
  },
};

const failedTx = createMockTransaction({
  txKey: 'mock-tx-key-failed',
  status: TransactionStatus.Failed,
  pending: false,
  isError: true,
  errorMessage: 'Transaction reverted: Insufficient balance',
  title: 'Swap Failed',
  description: 'Failed to swap tokens',
});
export const Failed: Story = {
  name: 'Failed Transaction',
  args: {
    transactionsPool: { [failedTx.txKey]: failedTx },
    initialTx: {
      localTimestamp: dayjs().unix(),
      isInitializing: false,
      withTrackedModal: true,
      lastTxKey: failedTx.txKey,
      errorMessage: failedTx.errorMessage,
      adapter: failedTx.adapter,
      desiredChainID: failedTx.chainId,
      type: failedTx.type,
      from: failedTx.from,
      walletType: failedTx.walletType,
    },
    config: {} as Config,
    handleTransaction: async () => console.log('Retrying transaction...'),
  },
};

const replacedTx = createMockTransaction({
  txKey: 'mock-tx-key-replaced',
  status: TransactionStatus.Replaced,
  pending: false,
  title: 'Transaction Sped Up',
  description: 'Transaction was replaced with a higher gas fee',
  replacedTxHash: '0x1234567890abcdef1234567890abcdefqw2345678',
});
export const Replaced: Story = {
  name: 'Replaced Transaction',
  args: {
    transactionsPool: { [replacedTx.txKey]: replacedTx },
    initialTx: {
      localTimestamp: dayjs().unix(),
      isInitializing: false,
      withTrackedModal: true,
      lastTxKey: replacedTx.txKey,
      adapter: replacedTx.adapter,
      desiredChainID: replacedTx.chainId,
      type: replacedTx.type,
      from: replacedTx.from,
      walletType: replacedTx.walletType,
    },
  },
};

// --- Customization ---

export const CustomComponentsDemo: Story = {
  name: 'Custom Components',
  args: {
    initialTx: {
      localTimestamp: dayjs().unix(),
      isInitializing: true,
      withTrackedModal: true,
      adapter: TransactionAdapter.EVM,
      desiredChainID: 1,
      type: 'Swap',
      title: 'Custom Swap',
      description: 'Swapping with custom components',
      actionKey: 'swapTokens',
      from: zeroAddress,
      walletType: 'injected',
    },
    customization: {
      components: {
        header: ({ onClose }) => (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl">
            <h1 className="text-xl font-bold text-white">🚀 Custom Transaction Status</h1>
            <button
              onClick={() => onClose()}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              type="button"
            >
              ✕
            </button>
          </div>
        ),
        statusVisual: ({ isProcessing, isSucceed, isFailed }) => (
          <div className="flex justify-center p-6">
            <div className="relative">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl ${
                  isFailed
                    ? 'bg-red-100 text-red-500'
                    : isSucceed
                      ? 'bg-green-100 text-green-500'
                      : 'bg-blue-100 text-blue-500'
                }`}
              >
                {isFailed ? '❌' : isSucceed ? '✅' : isProcessing ? '⏳' : '⏸️'}
              </div>
              {isProcessing && (
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        ),
        footer: ({ onClose, onOpenWalletInfo, onRetry, onSpeedUp, onCancel, isProcessing }) => (
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-center gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  type="button"
                >
                  🔄 Retry
                </button>
              )}
              {onSpeedUp && (
                <button
                  onClick={onSpeedUp}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  type="button"
                >
                  ⚡ Speed Up
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  type="button"
                >
                  ❌ Cancel
                </button>
              )}
              {!onRetry && !onSpeedUp && !onCancel && (
                <button
                  onClick={onOpenWalletInfo}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  type="button"
                >
                  💼 Wallet Info
                </button>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => onClose()}
                disabled={isProcessing}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                type="button"
              >
                {isProcessing ? '⌛ Processing...' : '👋 Close'}
              </button>
            </div>
          </div>
        ),
      },
    },
  },
};
