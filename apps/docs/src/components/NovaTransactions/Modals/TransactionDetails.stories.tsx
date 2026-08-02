import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionDetails } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  SolanaTransaction,
  StarknetTransaction,
  TransactionStatus,
  TransactionTracker,
} from '@tuwaio/pulsar-core';
import { action } from 'storybook/actions';
import { polygon } from 'viem/chains';

import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof TransactionDetails> = {
  title: 'Nova Transactions/Modals/TransactionDetails',
  component: TransactionDetails,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
  args: {
    onBack: action('onBack'),
    adapter: [mockEvmAdapter, mockSolanaAdapter],
  },
  argTypes: {
    tx: {
      control: 'object',
      description: 'The transaction object containing metadata, status, and execution data.',
    },
    onBack: {
      action: 'onBack',
      description: 'Callback function triggered when clicking the back button in the header.',
    },
    adapter: {
      control: false,
      description: 'Adapter(s) used to resolve explorer URLs and network metadata.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names for the root container.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TransactionDetails>;

// --- Mock Datasets ---

const mockEvmPendingTx: EvmTransaction = createMockTx(OrbitAdapter.EVM, {
  title: 'Swapping 1.5 ETH for USDC',
  description: 'Executing Uniswap v3 swap route on Ethereum Mainnet',
  pending: true,
  status: undefined,
  syncStatus: 'pending-sync',
  type: 'Token Swap',
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  to: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  value: '1500000000000000000',
  gasLimit: '210000',
  gasPrice: '25000000000',
  maxFeePerGas: '30000000000',
  maxPriorityFeePerGas: '1500000000',
  nonce: 42,
  input: '0x5f5755290000000000000000000000000000000000000000000000000000000000000020',
} as any) as EvmTransaction;

const mockEvmSuccessTx: EvmTransaction = createMockTx(OrbitAdapter.EVM, {
  title: 'Stake 1000 MATIC',
  description: 'Deposit MATIC tokens into Polygon Staking contract',
  pending: false,
  status: TransactionStatus.Success,
  syncStatus: 'synced',
  chainId: polygon.id,
  type: 'Staking Deposit',
  from: '0x8b99f36611f7c8b07043818e69248496bc120935',
  to: '0x5e3ef299fddf15eaa0432e6e66473ace8c13d908',
  contractAddress: '0x5e3ef299fddf15eaa0432e6e66473ace8c13d908',
  value: '1000000000000000000000',
  blockNumber: 58940123,
  blockHash: '0xa41b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
  gasUsed: '142850',
  effectiveGasPrice: '32000000000',
  cumulativeGasUsed: '8401920',
} as any) as EvmTransaction;

const mockEvmFailedTx: EvmTransaction = createMockTx(OrbitAdapter.EVM, {
  title: 'Approve DAI Spend',
  description: 'Approve ERC20 token allowance for Vault contract',
  pending: false,
  status: TransactionStatus.Failed,
  syncStatus: 'pending-sync',
  type: 'ERC20 Approval',
  from: '0x8b99f36611f7c8b07043818e69248496bc120935',
  to: '0x6b175474e89094c44da98b954eedeac495271d0f',
  error: {
    message: 'execution reverted: ERC20: transfer amount exceeds balance',
    raw: {
      code: 'CALL_EXCEPTION',
      stack:
        'Error: execution reverted: ERC20: transfer amount exceeds balance\n    at Contract.approve (ethers.js:104)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)',
    },
  },
} as any) as EvmTransaction;

const mockSolanaPendingTx: SolanaTransaction = {
  ...createMockTx(OrbitAdapter.SOLANA, {
    title: 'Transfer 5.0 SOL',
    description: 'Transfer native SOL on Solana Mainnet',
    pending: true,
    status: undefined,
    syncStatus: 'pending-sync',
    type: 'SOL Transfer',
    chainId: 'solana:mainnet',
  } as any),
  fee: 5000,
  slot: 284910294,
  recentBlockhash: '7Kx5wQ8P3nZ29vL1mY4x6tR0sB8vC3dE9fG1hJ2kL3mN',
} as unknown as SolanaTransaction;

const mockSolanaSuccessTx: SolanaTransaction = {
  ...createMockTx(OrbitAdapter.SOLANA, {
    title: 'Jupiter Token Swap',
    description: 'Swap 100 USDC for 1.2 SOL via Jupiter Aggregator',
    pending: false,
    status: TransactionStatus.Success,
    syncStatus: 'synced',
    type: 'DEX Swap',
    chainId: 'solana:mainnet',
  } as any),
  fee: 12000,
  slot: 284915830,
  recentBlockhash: '9Px7mR2vK4nL8wQ0sB3vC1dE5fG9hJ2kL6mN4pQ8rT0v',
  confirmations: 32,
} as unknown as SolanaTransaction;

const mockStarknetSuccessTx: StarknetTransaction = {
  adapter: OrbitAdapter.Starknet,
  tracker: TransactionTracker.Ethereum,
  txKey: '0x04a912840a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d',
  hash: '0x04a912840a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d',
  title: 'Starknet Account Deployment',
  description: 'Deploy Smart Contract Account on Starknet Mainnet',
  pending: false,
  status: TransactionStatus.Success,
  type: 'Contract Deployment',
  chainId: '0x534e5f4d41494e',
  localTimestamp: Math.floor(Date.now() / 1000) - 3600,
  walletType: 'argentX',
  contractAddress: '0x07f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
  actualFee: {
    amount: '0.00042',
    unit: 'ETH',
  },
} as unknown as StarknetTransaction;

// --- Stories ---

/**
 * Default story showing an active EVM transaction currently pending confirmation.
 */
export const Default: Story = {
  args: {
    tx: mockEvmPendingTx,
    adapter: [mockEvmAdapter],
  },
};

/**
 * Successful EVM transaction detailing block number, gas metrics, and contract execution metadata.
 */
export const EvmSuccess: Story = {
  args: {
    tx: mockEvmSuccessTx,
    adapter: [mockEvmAdapter],
  },
};

/**
 * Failed EVM transaction displaying execution error details, code, and call stack trace.
 */
export const EvmError: Story = {
  args: {
    tx: mockEvmFailedTx,
    adapter: [mockEvmAdapter],
  },
};

/**
 * Pending Solana transaction showing slot details and recent blockhash.
 */
export const SolanaPending: Story = {
  args: {
    tx: mockSolanaPendingTx,
    adapter: [mockSolanaAdapter],
  },
};

/**
 * Confirmed Solana transaction displaying fee, slot, blockhash, and confirmations count.
 */
export const SolanaSuccess: Story = {
  args: {
    tx: mockSolanaSuccessTx,
    adapter: [mockSolanaAdapter],
  },
};

/**
 * Starknet transaction detailing contract address and actual fee unit.
 */
export const StarknetSuccess: Story = {
  args: {
    tx: mockStarknetSuccessTx,
    adapter: [mockEvmAdapter],
  },
};

/**
 * Demonstrates custom sub-component styling and layout overrides via the `customization` prop.
 */
export const WithCustomization: Story = {
  args: {
    tx: mockEvmSuccessTx,
    adapter: [mockEvmAdapter],
    customization: {
      classNames: {
        header: 'novatx:bg-gradient-to-r novatx:from-indigo-500/10 novatx:to-purple-500/10 novatx:border-purple-500/30',
        title: 'novatx:text-purple-400',
        networkBadge: 'novatx:border-purple-500/40 novatx:bg-purple-500/10',
      },
    },
  },
};
