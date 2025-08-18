import { StarIcon, UserIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';

import { WalletAddressDisplay } from './WalletAddressDisplay';
import { WalletAvatar } from './WalletAvatar';
import { WalletHeader } from './WalletHeader';

// --- Mock Data ---

// Well-known addresses for realistic examples
const EXAMPLE_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
  uniswap: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' as Address,
  ethereum: '0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B' as Address,
  random1: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12' as Address,
  random2: '0x9876543210FeDcBa9876543210FeDcBa98765432' as Address,
  longEns: '0x3b77fE026c8a6f985944527564C77044B68A3021' as Address,
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletHeader> = {
  title: 'UI Components/WalletInfoModal/WalletHeader',
  component: WalletHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    walletAddress: EXAMPLE_ADDRESSES.vitalik,
    chain: mainnet,
  },
  argTypes: {
    walletAddress: {
      control: 'text',
      description: 'The wallet address to display. If undefined, shows "not connected" state',
    },
    chain: {
      control: 'object',
      description: 'The viem Chain object for the currently connected network',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container',
    },
    renderAvatar: {
      control: false,
      description: 'Render prop to replace the default WalletAvatar component',
    },
    renderName: {
      control: false,
      description: 'Render prop to replace the default ENS name display',
    },
    renderAddressDisplay: {
      control: false,
      description: 'Render prop to replace the default WalletAddressDisplay component',
    },
    renderNoWalletContent: {
      control: false,
      description: 'Render prop to replace the default "not connected" content',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Default wallet header with Vitalik's address and simulated ENS data.
 */
export const Default: Story = {
  args: {},
};

/**
 * Shows the "not connected" state when no wallet address is provided.
 */
export const NotConnected: Story = {
  args: {
    walletAddress: undefined,
  },
};

/**
 * Shows an address without ENS data (only blockie and address).
 */
export const WithoutENS: Story = {
  args: {
    walletAddress: EXAMPLE_ADDRESSES.random2,
  },
};

/**
 * Shows an address with a very long ENS name that gets abbreviated.
 */
export const LongENSName: Story = {
  args: {
    walletAddress: EXAMPLE_ADDRESSES.longEns,
  },
};

/**
 * Shows the zero address (burn address).
 */
export const ZeroAddress: Story = {
  args: {
    walletAddress: zeroAddress,
  },
};

/**
 * Shows the loading state simulation for ENS data fetching.
 */
export const LoadingStates: Story = {
  render: () => {
    const [address, setAddress] = useState<Address | undefined>(undefined);

    const handleConnect = (addr: Address) => {
      setAddress(addr);
    };

    const handleDisconnect = () => {
      setAddress(undefined);
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleConnect(EXAMPLE_ADDRESSES.vitalik)}
            className="px-4 py-2 bg-[var(--tuwa-accent)] text-[var(--tuwa-accent-foreground)] rounded-lg hover:bg-[var(--tuwa-accent-hover)] transition-colors"
          >
            Connect Vitalik
          </button>
          <button
            onClick={() => handleConnect(EXAMPLE_ADDRESSES.ethereum)}
            className="px-4 py-2 bg-[var(--tuwa-primary)] text-[var(--tuwa-primary-foreground)] rounded-lg hover:bg-[var(--tuwa-primary-hover)] transition-colors"
          >
            Connect Ethereum.eth
          </button>
          <button
            onClick={() => handleConnect(EXAMPLE_ADDRESSES.random2)}
            className="px-4 py-2 bg-[var(--tuwa-secondary)] text-[var(--tuwa-secondary-foreground)] rounded-lg hover:bg-[var(--tuwa-secondary-hover)] transition-colors"
          >
            Connect Random
          </button>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-[var(--tuwa-destructive)] text-[var(--tuwa-destructive-foreground)] rounded-lg hover:bg-[var(--tuwa-destructive-hover)] transition-colors"
          >
            Disconnect
          </button>
        </div>

        <div className="border border-[var(--tuwa-border-secondary)] rounded-lg p-4 bg-[var(--tuwa-bg-secondary)]">
          <WalletHeader walletAddress={address} chain={mainnet} />
        </div>
      </div>
    );
  },
};

/**
 * Demonstrates custom name rendering with additional elements.
 */
export const CustomName: Story = {
  args: {
    walletAddress: EXAMPLE_ADDRESSES.vitalik,
    renderName: ({ ensName, isLoading }) => (
      <div className="h-7 flex items-center gap-2">
        {isLoading ? (
          <div className="h-full w-48 animate-pulse rounded-md bg-[var(--tuwa-bg-muted)]" />
        ) : ensName ? (
          <>
            <h2 className="text-xl font-bold text-[var(--tuwa-accent)]">{ensName}</h2>
            <StarIcon className="h-5 w-5 text-[var(--tuwa-warning-icon)]" />
            <span className="text-xs bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-accent)] px-2 py-1 rounded-full border border-[var(--tuwa-accent)]">
              Verified
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-[var(--tuwa-text-muted)]" />
            <span className="text-sm text-[var(--tuwa-text-secondary)]">Anonymous</span>
          </div>
        )}
      </div>
    ),
  },
};

/**
 * Demonstrates custom address display.
 */
export const CustomAddressDisplay: Story = {
  args: {
    renderAddressDisplay: ({ address, chain }) => (
      <div className="flex items-center gap-2">
        <WalletAddressDisplay
          address={address}
          chain={chain}
          className="bg-[var(--tuwa-bg-muted)] border border-[var(--tuwa-accent)]"
        />
        <span className="text-xs bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-success)] px-2 py-1 rounded border border-[var(--tuwa-success)]">
          Trusted
        </span>
      </div>
    ),
  },
};

/**raccoon

 /**
 * Demonstrates custom "not connected" content.
 */
export const CustomNotConnected: Story = {
  args: {
    walletAddress: undefined,
    renderNoWalletContent: () => (
      <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-[var(--tuwa-border-muted)] rounded-lg">
        <UserIcon className="h-12 w-12 text-[var(--tuwa-text-muted)]" />
        <div className="text-center">
          <h3 className="font-semibold text-[var(--tuwa-text-primary)] mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-[var(--tuwa-text-secondary)] mb-4">
            Choose your preferred wallet to connect and start using the app
          </p>
          <button className="px-4 py-2 bg-[var(--tuwa-accent)] text-[var(--tuwa-accent-foreground)] rounded-lg hover:bg-[var(--tuwa-accent-hover)] transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    ),
  },
};

/**
 * Shows all customizations together.
 */
export const FullyCustomized: Story = {
  args: {
    className: 'p-6 bg-[var(--tuwa-bg-muted)] border-2 border-[var(--tuwa-accent)] rounded-xl',
    renderAvatar: ({ address, ensAvatar }) => (
      <div className="relative">
        <WalletAvatar
          address={address}
          ensAvatar={ensAvatar}
          className="h-20 w-20 border-4 border-[var(--tuwa-accent)] shadow-xl ring-4 ring-[var(--tuwa-bg-muted)]"
        />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[var(--tuwa-accent)] text-[var(--tuwa-accent-foreground)] text-xs px-2 py-1 rounded-full">
          VIP
        </div>
      </div>
    ),
    renderName: ({ ensName, isLoading }) => (
      <div className="h-8 flex items-center gap-2">
        {isLoading ? (
          <div className="h-6 w-48 animate-pulse rounded-md bg-[var(--tuwa-bg-muted)]" />
        ) : ensName ? (
          <>
            <h2 className="text-2xl font-bold text-[var(--tuwa-accent)]">{ensName}</h2>
            <StarIcon className="h-6 w-6 text-[var(--tuwa-warning-icon)]" />
          </>
        ) : (
          <h2 className="text-lg font-semibold text-[var(--tuwa-accent)]">Premium User</h2>
        )}
      </div>
    ),
    renderAddressDisplay: ({ address, chain }) => (
      <div className="space-y-2">
        <WalletAddressDisplay
          address={address}
          chain={chain}
          className="bg-[var(--tuwa-bg-primary)] border-2 border-[var(--tuwa-accent)] shadow-md"
        />
        <div className="flex gap-2">
          <span className="text-xs bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-accent)] px-2 py-1 rounded-full border border-[var(--tuwa-accent)]">
            Premium
          </span>
          <span className="text-xs bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-success)] px-2 py-1 rounded-full border border-[var(--tuwa-success)]">
            Verified
          </span>
        </div>
      </div>
    ),
  },
};

/**
 * Shows multiple wallet headers in a comparison layout.
 */
export const WalletComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div className="p-4 border border-[var(--tuwa-border-secondary)] rounded-lg bg-[var(--tuwa-bg-secondary)]">
        <div className="text-sm text-[var(--tuwa-text-secondary)] mb-3">ENS User</div>
        <WalletHeader walletAddress={EXAMPLE_ADDRESSES.vitalik} chain={mainnet} />
      </div>
      <div className="p-4 border border-[var(--tuwa-border-secondary)] rounded-lg bg-[var(--tuwa-bg-secondary)]">
        <div className="text-sm text-[var(--tuwa-text-secondary)] mb-3">Anonymous User</div>
        <WalletHeader walletAddress={EXAMPLE_ADDRESSES.random2} chain={mainnet} />
      </div>
      <div className="p-4 border border-[var(--tuwa-border-secondary)] rounded-lg bg-[var(--tuwa-bg-secondary)]">
        <div className="text-sm text-[var(--tuwa-text-secondary)] mb-3">Long ENS Name</div>
        <WalletHeader walletAddress={EXAMPLE_ADDRESSES.longEns} chain={mainnet} />
      </div>
      <div className="p-4 border border-[var(--tuwa-border-secondary)] rounded-lg bg-[var(--tuwa-bg-secondary)]">
        <div className="text-sm text-[var(--tuwa-text-secondary)] mb-3">Not Connected</div>
        <WalletHeader walletAddress={undefined} chain={mainnet} />
      </div>
    </div>
  ),
};
