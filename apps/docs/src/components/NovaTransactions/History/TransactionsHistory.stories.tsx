import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsHistory } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';

import { iso, isoHistory } from '../../../utils/customization/isometric';
import { IsoCube, withIsometricTheme } from '../../../utils/customization/IsometricFrame';
import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TransactionsHistory> = {
  title: 'Nova Transactions/History/TransactionsHistory',
  component: TransactionsHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    connectedWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    transactionsPool: {
      ...[
        createMockTx(OrbitAdapter.EVM, {
          status: TransactionStatus.Success,
          localTimestamp: dayjs().subtract(2, 'minutes').unix(),
        }),
      ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    },
    adapter: [mockEvmAdapter],
  },
  argTypes: {
    connectedWalletAddress: {
      control: 'text',
      description: 'The address of the currently connected wallet.',
    },
    transactionsPool: {
      control: 'object',
      description: 'The entire pool of transactions from the store.',
    },
    adapter: {
      control: false,
      description: 'An array of configured adapters.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default state, showing a variety of transactions for the connected wallet.
 * The list is automatically sorted with the newest transactions first.
 */
export const Default: Story = {
  args: {
    connectedWalletAddress: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
    transactionsPool: {
      ...[
        createMockTx(OrbitAdapter.EVM, {
          txKey: '0x_tx_success_1',
          hash: '0x_tx_success_1',
          status: TransactionStatus.Success,
          syncStatus: 'synced',
          localTimestamp: dayjs().subtract(2, 'minutes').unix(),
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
        }),
        createMockTx(OrbitAdapter.EVM, {
          txKey: '0x_tx_pending_2',
          pending: true,
          status: undefined,
          syncStatus: 'pending-sync',
          hash: undefined,
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
          localTimestamp: dayjs().subtract(30, 'seconds').unix(),
        }),
        createMockTx(OrbitAdapter.EVM, {
          txKey: '0x_tx_failed_3',
          hash: '0x_tx_failed_3',
          status: TransactionStatus.Failed,
          syncStatus: 'pending-sync',
          error: { message: 'Transaction failed due to an unexpected error.', raw: {} },
          from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
          localTimestamp: dayjs().subtract(1, 'hour').unix(),
        }),
      ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    },
    adapter: [mockEvmAdapter],
  },
};

/**
 * The history of a Solana wallet: the list holds only the transactions of the connected address.
 */
export const SolanaWallet: Story = {
  args: {
    connectedWalletAddress: '7Kx5wQ8P3nZ29vL1mY4x6tR0sB8vC3dE9fG1hJ2kL3mN',
    transactionsPool: [
      createMockTx(OrbitAdapter.SOLANA, {
        txKey: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW',
        status: TransactionStatus.Success,
        confirmations: 'MAX',
        localTimestamp: dayjs().subtract(5, 'minutes').unix(),
      }),
      createMockTx(OrbitAdapter.SOLANA, {
        txKey: '4ecrNTNBLwR4L2LNpFsrRCDLvj35aWqhNqdTnaYCmvxsEeLGXCNEYYcNu3evVF2okyNCLaM1BpWV9mnMDq4CaAaB',
        confirmations: 0,
        localTimestamp: dayjs().subtract(30, 'seconds').unix(),
      }),
    ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    adapter: [mockSolanaAdapter],
  },
};

/**
 * Shows the placeholder when a wallet is connected but the transaction history is empty.
 */
export const NoTransactions: Story = {
  args: {
    connectedWalletAddress: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
    transactionsPool: {},
    adapter: [mockEvmAdapter],
  },
};

/**
 * Shows the placeholder when no wallet is connected. The component prompts the user to connect.
 */
export const NoWalletConnected: Story = {
  args: {
    connectedWalletAddress: undefined,
    transactionsPool: {},
    adapter: [mockEvmAdapter],
  },
};

/**
 * Demonstrates the list with a large number of transactions to verify scroll behavior.
 */
export const WithScrolling: Story = {
  args: {
    connectedWalletAddress: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
    transactionsPool: Array.from({ length: 15 }, (_, i) =>
      createMockTx(OrbitAdapter.EVM, {
        txKey: `0x_mock_tx_${i}_key`,
        hash: `0x_mock_tx_${i}_hash`,
        from: '0x742d35Cc6c2C32C5D0aE5E5f96f5B8e7a2E5a1c8',
        localTimestamp: dayjs()
          .subtract(i * 10, 'minutes')
          .unix(),
        type: `Transaction ${15 - i}`,
        status: [TransactionStatus.Success, TransactionStatus.Failed, undefined][i % 3],
        pending: i % 3 === 2,
      }),
    ).reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    adapter: [mockEvmAdapter],
  },
};

/**
 * An example of customizing the placeholder component for the "Connect Wallet" state.
 */
export const WithCustomPlaceholder: Story = {
  decorators: [withIsometricTheme],
  args: {
    ...NoWalletConnected.args,
    customization: {
      components: {
        Placeholder: ({ title, message }) => (
          <div className={`flex flex-col items-center gap-3 p-8 text-center ${iso.box}`}>
            <IsoCube className={`h-12 w-12 ${iso.text.primary}`} />
            <h4 className={`text-base ${iso.text.strong} ${iso.text.primary}`}>{title}</h4>
            <p className={`text-sm ${iso.text.secondary}`}>{message}</p>
          </div>
        ),
      },
    },
    adapter: [mockEvmAdapter],
  },
};

/**
 * An example of replacing the default `TransactionHistoryItem` with a completely custom component.
 */
export const WithCustomHistoryItem: Story = {
  decorators: [withIsometricTheme],
  args: {
    ...Default.args,
    customization: {
      ...isoHistory,
      components: {
        HistoryItem: ({ tx }) => (
          <div
            className={`m-3 flex items-center justify-between gap-3 p-3 ${iso.surface.base} ${iso.surface.border} ${iso.faces}`}
          >
            <span className={`text-sm ${iso.text.strong} ${iso.text.primary}`}>{tx.type}</span>
            <span className={iso.sectionTitle}>{tx.status ?? 'Pending'}</span>
          </div>
        ),
      },
    },
    adapter: [mockEvmAdapter],
  },
};
