import { StarIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletAvatar, WalletHeader } from '@tuwaio/nova-transactions';
import { TransactionAdapter } from '@tuwaio/pulsar-core';
import { useState } from 'react';
import { Address } from 'viem';

import { mockEvmAdapter } from '../../utils/mockAdapters';

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

const meta: Meta<typeof WalletHeader> = {
  title: 'Components/Modal/WalletHeader',
  component: WalletHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    adapter: [createInteractiveMockAdapter(true)],
    connectedAdapterType: TransactionAdapter.EVM,
    walletAddress: MOCK_DATA.ens.address,
  },
  argTypes: {
    walletAddress: {
      control: 'text',
      description: 'The wallet address to display. If undefined, shows the "not connected" state.',
    },
    adapter: {
      control: false,
      description: 'An array of configured adapters.',
    },
    connectedAdapterType: {
      control: false,
      description: 'The adapter type of the currently connected wallet.',
    },
    explorerUrl: {
      control: 'text',
      description: 'The base URL for the block explorer.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * This is an interactive story that simulates connecting and disconnecting a wallet.
 * It demonstrates the loading state while fetching ENS data, the state with ENS,
 * the state without ENS, and the disconnected state.
 */
export const Interactive: Story = {
  render: (args) => {
    const [walletAddress, setWalletAddress] = useState<Address | undefined>(MOCK_DATA.ens.address);
    const [hasEns, setHasEns] = useState(true);

    return (
      <div className="w-96 space-y-4">
        <div className="flex flex-wrap gap-2 rounded-md bg-[var(--tuwa-bg-muted)] p-2">
          <button
            onClick={() => {
              setHasEns(true);
              setWalletAddress(MOCK_DATA.ens.address);
            }}
          >
            Connect ENS Wallet
          </button>
          <button
            onClick={() => {
              setHasEns(false);
              setWalletAddress(MOCK_DATA.noEns.address);
            }}
          >
            Connect No-ENS Wallet
          </button>
          <button onClick={() => setWalletAddress(undefined)}>Disconnect</button>
        </div>
        <WalletHeader {...args} walletAddress={walletAddress} adapter={[createInteractiveMockAdapter(hasEns)]} />
      </div>
    );
  },
};

/**
 * The default view showing a connected wallet with a resolved ENS name and avatar.
 */
export const Default: Story = {
  args: {
    walletAddress: MOCK_DATA.ens.address,
    adapter: [createInteractiveMockAdapter(true)],
  },
};

/**
 * The view for a connected wallet that does not have an associated ENS name.
 * The component gracefully falls back to displaying the address.
 */
export const WithoutENS: Story = {
  args: {
    walletAddress: MOCK_DATA.noEns.address,
    adapter: [createInteractiveMockAdapter(false)],
  },
};

/**
 * The view when no wallet is connected.
 */
export const NotConnected: Story = {
  args: {
    walletAddress: undefined,
  },
};

/**
 * An example of replacing all default components with custom render props.
 */
export const FullyCustomized: Story = {
  args: {
    ...Default.args,
    className: 'p-4 bg-[var(--tuwa-bg-muted)] rounded-xl border-2 border-purple-300',
    renderAvatar: ({ address, ensAvatar }) => (
      <div className="relative h-20 w-20">
        <WalletAvatar address={address} ensAvatar={ensAvatar} className="h-full w-full border-4 border-purple-500" />
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-2 py-1 text-xs text-white">
          VIP
        </span>
      </div>
    ),
    renderName: ({ ensName }) => (
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-purple-600">{ensName}</h2>
        <StarIcon className="h-6 w-6 text-yellow-400" />
      </div>
    ),
  },
};
