import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsHistory, WalletHeader, WalletInfoModal } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Address } from 'viem';

import { mockEvmAdapter, mockSolanaAdapter } from '../../utils/mockAdapters';
import { createMockTx } from '../../utils/mockTransactions';

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

const mockTransactionsPool = {
  ...[
    createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Success,
      localTimestamp: dayjs().subtract(2, 'minutes').unix(),
      from: MOCK_DATA.ens.address,
    }),
    createMockTx(OrbitAdapter.EVM, {
      pending: true,
      status: undefined,
      hash: undefined,
      from: MOCK_DATA.ens.address,
      localTimestamp: dayjs().subtract(30, 'seconds').unix(),
    }),
    createMockTx(OrbitAdapter.EVM, {
      status: TransactionStatus.Failed,
      from: MOCK_DATA.ens.address,
      localTimestamp: dayjs().subtract(1, 'hour').unix(),
    }),
  ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
};

const createInteractiveMockAdapter = (withEns: boolean) => {
  const adapter = { ...mockEvmAdapter };
  if (withEns) {
    adapter.getName = async (address: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return address === MOCK_DATA.ens.address ? MOCK_DATA.ens.name : null;
    };
    adapter.getAvatar = async (name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return name === MOCK_DATA.ens.name ? MOCK_DATA.ens.avatar : null;
    };
  } else {
    adapter.getName = async () => null;
    adapter.getAvatar = async () => null;
  }
  return adapter;
};

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
    adapter: [createInteractiveMockAdapter(true)],
    connectedAdapterType: OrbitAdapter.EVM,
    connectedWalletAddress: MOCK_DATA.ens.address,
    transactionsPool: mockTransactionsPool,
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    setIsOpen: { action: 'setIsOpen' },
    connectedWalletAddress: { control: 'text' },
    adapter: { control: false },
    connectedAdapterType: { control: false },
    transactionsPool: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Interactive: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--tuwa-bg-muted)] p-8">
        <button className="rounded-md bg-blue-500 px-4 py-2 text-white" onClick={() => setIsOpen(true)}>
          Open Wallet Modal
        </button>
        <WalletInfoModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    );
  },
  args: {
    isOpen: false,
    adapter: [createInteractiveMockAdapter(true)],
  },
};

export const EmptyHistory: Story = {
  args: {
    connectedWalletAddress: MOCK_DATA.noEns.address,
    transactionsPool: {},
    adapter: [createInteractiveMockAdapter(false)],
  },
};

export const NotConnected: Story = {
  args: {
    connectedWalletAddress: undefined,
    transactionsPool: {},
    adapter: [mockEvmAdapter],
  },
};

export const FullyCustomized: Story = {
  args: {
    ...meta.args,
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
              adapter={props.adapter}
              transactionsPool={props.transactionsPool}
              connectedWalletAddress={props.connectedWalletAddress}
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
    adapter: [createInteractiveMockAdapter(true)],
  },
};

export const WithSolanaWallet: Story = {
  name: 'Solana Wallet',
  args: {
    adapter: [mockSolanaAdapter],
    connectedAdapterType: OrbitAdapter.SOLANA,
    connectedWalletAddress: 'mockedSolanaWalletAddress' as Address,
    transactionsPool: {
      mock_solana_tx_key: createMockTx(OrbitAdapter.SOLANA, { from: 'mockedSolanaWalletAddress' }),
    },
  },
};
