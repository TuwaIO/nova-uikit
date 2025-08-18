import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionStatus } from '@tuwaio/web3-transactions-tracking-core';

import { defaultLabels } from '../../i18n/en';
import { LabelsProvider } from '../../providers';
import { TrackingTxModal, TrackingTxModalCustomization, TxActions } from './TrackingTxModal';

// --- Mock Data ---

const mockChains = [
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

const createMockTransaction = (overrides = {}) => ({
  txKey: 'mock-tx-key-123',
  txHash: '0x1234567890abcdef1234567890abcdef12345678',
  chainId: 1,
  nonce: 42,
  type: 'Swap',
  title: 'Swap Tokens',
  description: 'Swapping 100 USDC for ETH',
  actionKey: 'swapTokens',
  status: undefined,
  pending: true,
  isError: false,
  isTrackedModalOpen: true,
  maxFeePerGas: '20000000000',
  maxPriorityFeePerGas: '1000000000',
  payload: { from: 'USDC', to: 'ETH', amount: '100' },
  tracker: 'ethereum' as const,
  localTimestamp: Date.now(),
  walletType: 'metaMask',
  from: '0x1234567890123456789012345678901234567890',
  ...overrides,
});

const mockTransactionsPool = {
  'mock-tx-key-123': createMockTransaction(),
  'mock-tx-key-456': createMockTransaction({
    txKey: 'mock-tx-key-456',
    status: TransactionStatus.Success,
    pending: false,
    title: 'Transfer Complete',
    description: 'Successfully transferred 50 USDC',
  }),
};

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
  decorators: [
    (Story) => (
      <LabelsProvider labels={defaultLabels}>
        <div className="h-screen bg-gray-100 p-4">
          <Story />
        </div>
      </LabelsProvider>
    ),
  ],
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
    transactionsPool: mockTransactionsPool,
    actions: mockActions,
    onClose: (txKey?: string) => console.log('Modal closed:', txKey),
    onOpenWalletInfo: () => console.log('Opening wallet info...'),
  },
  argTypes: {
    onClose: {
      action: 'onClose',
      description: 'Function called when the modal is closed',
    },
    onOpenWalletInfo: {
      action: 'onOpenWalletInfo',
      description: 'Function called when wallet info button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the modal container',
    },
    appChains: {
      control: false,
      description: 'Array of supported blockchain networks',
    },
    transactionsPool: {
      control: false,
      description: 'Global transaction pool from the tracking store',
    },
    actions: {
      control: false,
      description: 'Registry of retryable actions',
    },
    customization: {
      control: false,
      description: 'Customization options for modal components and behavior',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Basic States ---

export const Default: Story = {
  name: 'Default (Pending)',
  args: {
    initialTx: {
      type: 'Swap',
      title: 'Swap Tokens',
      description: 'Swapping 100 USDC for ETH',
      withTrackedModal: true,
      desiredChainID: 1,
      actionKey: 'swapTokens',
      isInitializing: false,
      localTimestamp: Date.now(),
    },
  },
};

export const Success: Story = {
  name: 'Successful Transaction',
  args: {
    transactionsPool: {
      'mock-tx-key-success': createMockTransaction({
        txKey: 'mock-tx-key-success',
        status: TransactionStatus.Success,
        pending: false,
        isTrackedModalOpen: true,
        title: 'Swap Complete',
        description: 'Successfully swapped 100 USDC for 0.05 ETH',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
      }),
    },
    initialTx: {
      isInitializing: true,
      type: 'Swap',
      title: 'Swap Complete',
      description: 'Successfully swapped 100 USDC for 0.05 ETH',
      withTrackedModal: true,
      desiredChainID: 1,
      lastTxKey: 'mock-tx-key-success',
      localTimestamp: Date.now(),
    },
  },
};

export const Failed: Story = {
  name: 'Failed Transaction',
  args: {
    transactionsPool: {
      'mock-tx-key-failed': createMockTransaction({
        txKey: 'mock-tx-key-failed',
        status: TransactionStatus.Failed,
        pending: false,
        isError: true,
        isTrackedModalOpen: true,
        errorMessage: 'Transaction reverted: Insufficient balance',
        title: 'Swap Failed',
        description: 'Failed to swap tokens',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
      }),
    },
    initialTx: {
      isInitializing: true,
      type: 'Swap',
      title: 'Swap Failed',
      description: 'Failed to swap tokens',
      withTrackedModal: true,
      desiredChainID: 1,
      lastTxKey: 'mock-tx-key-failed',
      errorMessage: 'Transaction reverted: Insufficient balance',
      localTimestamp: Date.now(),
    },
    config: {} as any,
    handleTransaction: async () => console.log('Retrying transaction...'),
  },
};

export const Replaced: Story = {
  name: 'Replaced Transaction',
  args: {
    transactionsPool: {
      'mock-tx-key-replaced': createMockTransaction({
        txKey: 'mock-tx-key-replaced',
        status: TransactionStatus.Replaced,
        pending: false,
        isTrackedModalOpen: true,
        title: 'Transaction Sped Up',
        description: 'Transaction was replaced with higher gas fee',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        replacedTxHash: '0x1234567890abcdef1234567890abcdefqw2345678',
      }),
    },
    initialTx: {
      isInitializing: true,
      type: 'Transfer',
      title: 'Transaction Sped Up',
      description: 'Transaction was replaced with higher gas fee',
      withTrackedModal: true,
      desiredChainID: 1,
      lastTxKey: 'mock-tx-key-replaced',
      localTimestamp: Date.now(),
    },
  },
};

// --- Custom Components Demo ---

export const CustomComponentsDemo: Story = {
  name: 'Custom Components',
  args: {
    initialTx: {
      type: 'Swap',
      title: 'Custom Swap',
      description: 'Swapping with custom components',
      withTrackedModal: true,
      desiredChainID: 1,
      actionKey: 'swapTokens',
      localTimestamp: Date.now(),
      isInitializing: true,
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
    } as TrackingTxModalCustomization<any, any>,
  },
};

// --- Error Handling Demo ---

export const ErrorHandlingDemo: Story = {
  name: 'Error Handling',
  args: {
    transactionsPool: {
      'error-tx-key': createMockTransaction({
        txKey: 'error-tx-key',
        status: TransactionStatus.Failed,
        pending: false,
        isError: true,
        isTrackedModalOpen: true,
        errorMessage: 'Error: execution reverted: UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT',
        title: 'Swap Failed',
        description: 'Transaction was reverted',
      }),
    },
    initialTx: {
      type: 'Swap',
      title: 'Swap Failed',
      description: 'Transaction was reverted',
      withTrackedModal: true,
      desiredChainID: 1,
      lastTxKey: 'error-tx-key',
      errorMessage: 'Error: execution reverted: UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT',
      actionKey: 'swapTokens',
      localTimestamp: Date.now(),
      isInitializing: true,
    },
    config: {} as any,
    handleTransaction: async () => {
      console.log('Retrying failed transaction...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
  },
};
