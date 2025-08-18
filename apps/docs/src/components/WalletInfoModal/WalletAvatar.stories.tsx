import type { Meta, StoryObj } from '@storybook/react-vite';
import { zeroAddress } from 'viem';

import { WalletAvatar } from './WalletAvatar';

// --- Mock Data ---

// Well-known addresses for realistic examples
const EXAMPLE_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  uniswap: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  ethereum: '0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B',
  random1: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  random2: '0x9876543210FeDcBa9876543210FeDcBa98765432',
  colorful: '0xFF00FF1234567890FF00FF1234567890FF00FF12',
  darkColors: '0x000000ABCDEFABCDEF000000ABCDEFABCDEF00',
  lightColors: '0xFFFFFFABCDEFABCDEFFFFFFFABCDEFABCDEFFF',
};

// Mock ENS avatar URLs (these would normally come from ENS resolution)
const MOCK_ENS_AVATARS = {
  vitalik: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  ethereum: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  random1: 'https://images.unsplash.com/photo-1494790108755-2616b332c5b8?w=150&h=150&fit=crop&crop=face',
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletAvatar> = {
  title: 'UI Components/WalletInfoModal/WalletAvatar',
  component: WalletAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    address: EXAMPLE_ADDRESSES.ethereum,
  },
  argTypes: {
    address: {
      control: 'text',
      description: 'The wallet address used for blockie generation and background color',
    },
    ensAvatar: {
      control: 'text',
      description: 'Optional ENS avatar URL that takes priority over blockies',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Default avatar showing a procedurally generated blockie.
 */
export const Default: Story = {
  args: {},
};

/**
 * Avatar with an ENS avatar image that takes priority over the blockie.
 */
export const WithENSAvatar: Story = {
  args: {
    ensAvatar: MOCK_ENS_AVATARS.ethereum,
  },
};

/**
 * Shows Vitalik's address with a mock ENS avatar.
 */
export const VitalikExample: Story = {
  args: {
    address: EXAMPLE_ADDRESSES.vitalik,
    ensAvatar: MOCK_ENS_AVATARS.vitalik,
  },
};

/**
 * Shows the zero address (burn address) with its unique blockie.
 */
export const ZeroAddress: Story = {
  args: {
    address: zeroAddress,
  },
};

/**
 * Shows an address that generates colorful background colors.
 */
export const ColorfulAddress: Story = {
  args: {
    address: EXAMPLE_ADDRESSES.colorful,
  },
};

/**
 * Shows an address with dark background colors.
 */
export const DarkColors: Story = {
  args: {
    address: EXAMPLE_ADDRESSES.darkColors,
  },
};

/**
 * Shows an address with light background colors.
 */
export const LightColors: Story = {
  args: {
    address: EXAMPLE_ADDRESSES.lightColors,
  },
};

/**
 * Demonstrates different avatar sizes using custom classes.
 */
export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div>
        <div className="text-sm text-gray-600 mb-2 text-center">Small (24px)</div>
        <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2 text-center">Medium (32px)</div>
        <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} className="h-8 w-8" />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2 text-center">Default (48px)</div>
        <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2 text-center">Large (64px)</div>
        <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} className="h-16 w-16" />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2 text-center">XL (80px)</div>
        <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} className="h-20 w-20" />
      </div>
    </div>
  ),
};

/**
 * Shows multiple avatars with different addresses and blockies.
 */
export const MultipleAddresses: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <WalletAvatar address={EXAMPLE_ADDRESSES.vitalik} />
        <div className="text-xs text-gray-600 mt-2">Vitalik's Address</div>
        <div className="text-xs font-mono text-gray-400">{EXAMPLE_ADDRESSES.vitalik.slice(0, 6)}...</div>
      </div>
      <div className="text-center">
        <WalletAvatar address={EXAMPLE_ADDRESSES.uniswap} />
        <div className="text-xs text-gray-600 mt-2">Uniswap Token</div>
        <div className="text-xs font-mono text-gray-400">{EXAMPLE_ADDRESSES.uniswap.slice(0, 6)}...</div>
      </div>
      <div className="text-center">
        <WalletAvatar address={EXAMPLE_ADDRESSES.random1} />
        <div className="text-xs text-gray-600 mt-2">Random Address</div>
        <div className="text-xs font-mono text-gray-400">{EXAMPLE_ADDRESSES.random1.slice(0, 6)}...</div>
      </div>
      <div className="text-center">
        <WalletAvatar address={EXAMPLE_ADDRESSES.random2} />
        <div className="text-xs text-gray-600 mt-2">Another Address</div>
        <div className="text-xs font-mono text-gray-400">{EXAMPLE_ADDRESSES.random2.slice(0, 6)}...</div>
      </div>
      <div className="text-center">
        <WalletAvatar address={EXAMPLE_ADDRESSES.colorful} />
        <div className="text-xs text-gray-600 mt-2">Colorful Address</div>
        <div className="text-xs font-mono text-gray-400">{EXAMPLE_ADDRESSES.colorful.slice(0, 6)}...</div>
      </div>
      <div className="text-center">
        <WalletAvatar address={zeroAddress} />
        <div className="text-xs text-gray-600 mt-2">Zero Address</div>
        <div className="text-xs font-mono text-gray-400">{zeroAddress.slice(0, 6)}...</div>
      </div>
    </div>
  ),
};

/**
 * Compares blockies vs ENS avatars side by side.
 */
export const BlockieVsENS: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-700 mb-4">Blockie Avatars</div>
        <div className="space-y-4">
          <div>
            <WalletAvatar address={EXAMPLE_ADDRESSES.vitalik} />
            <div className="text-sm text-gray-600 mt-2">Generated Blockie</div>
          </div>
          <div>
            <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} />
            <div className="text-sm text-gray-600 mt-2">Another Blockie</div>
          </div>
          <div>
            <WalletAvatar address={EXAMPLE_ADDRESSES.random1} />
            <div className="text-sm text-gray-600 mt-2">Unique Pattern</div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-700 mb-4">ENS Avatars</div>
        <div className="space-y-4">
          <div>
            <WalletAvatar address={EXAMPLE_ADDRESSES.vitalik} ensAvatar={MOCK_ENS_AVATARS.vitalik} />
            <div className="text-sm text-gray-600 mt-2">Human Avatar</div>
          </div>
          <div>
            <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} ensAvatar={MOCK_ENS_AVATARS.ethereum} />
            <div className="text-sm text-gray-600 mt-2">Profile Photo</div>
          </div>
          <div>
            <WalletAvatar address={EXAMPLE_ADDRESSES.random1} ensAvatar={MOCK_ENS_AVATARS.random1} />
            <div className="text-sm text-gray-600 mt-2">Custom Avatar</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Shows avatars with custom styling and borders.
 */
export const WithCustomStyling: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <WalletAvatar address={EXAMPLE_ADDRESSES.ethereum} className="h-16 w-16 border-4 border-blue-500 shadow-lg" />
        <div className="text-sm text-gray-600 mt-2">Blue Border</div>
      </div>
      <div className="text-center">
        <WalletAvatar
          address={EXAMPLE_ADDRESSES.vitalik}
          ensAvatar={MOCK_ENS_AVATARS.vitalik}
          className="h-16 w-16 border-4 border-green-500 ring-4 ring-green-200 shadow-xl"
        />
        <div className="text-sm text-gray-600 mt-2">Ring Effect</div>
      </div>
      <div className="text-center">
        <WalletAvatar
          address={EXAMPLE_ADDRESSES.random1}
          className="h-16 w-16 border-4 border-purple-500 rounded-lg shadow-2xl"
        />
        <div className="text-sm text-gray-600 mt-2">Square Style</div>
      </div>
      <div className="text-center">
        <WalletAvatar
          address={EXAMPLE_ADDRESSES.colorful}
          className="h-16 w-16 border-4 border-gradient-to-r from-pink-500 to-yellow-500 shadow-lg transform hover:scale-110 transition-transform"
        />
        <div className="text-sm text-gray-600 mt-2">Hover Effect</div>
      </div>
    </div>
  ),
};

/**
 * Demonstrates avatars in a user list context.
 */
export const UserList: Story = {
  render: () => (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Connected Wallets</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <WalletAvatar
            address={EXAMPLE_ADDRESSES.vitalik}
            ensAvatar={MOCK_ENS_AVATARS.vitalik}
            className="h-10 w-10"
          />
          <div>
            <div className="font-medium text-gray-900">vitalik.eth</div>
            <div className="text-sm text-gray-500 font-mono">{EXAMPLE_ADDRESSES.vitalik}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <WalletAvatar
            address={EXAMPLE_ADDRESSES.ethereum}
            ensAvatar={MOCK_ENS_AVATARS.ethereum}
            className="h-10 w-10"
          />
          <div>
            <div className="font-medium text-gray-900">ethereum.eth</div>
            <div className="text-sm text-gray-500 font-mono">{EXAMPLE_ADDRESSES.ethereum}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <WalletAvatar address={EXAMPLE_ADDRESSES.uniswap} className="h-10 w-10" />
          <div>
            <div className="font-medium text-gray-900">Uniswap Token</div>
            <div className="text-sm text-gray-500 font-mono">{EXAMPLE_ADDRESSES.uniswap}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <WalletAvatar address={EXAMPLE_ADDRESSES.random1} className="h-10 w-10" />
          <div>
            <div className="font-medium text-gray-900">Unknown Wallet</div>
            <div className="text-sm text-gray-500 font-mono">{EXAMPLE_ADDRESSES.random1}</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Shows the relationship between address and background color generation.
 */
export const BackgroundColorDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600 mb-4">
        Background colors are generated from the first 6 hex characters of the address
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(EXAMPLE_ADDRESSES).map(([name, address]) => (
          <div key={name} className="text-center">
            <WalletAvatar address={address} />
            <div className="text-sm font-semibold text-gray-700 mt-2 capitalize">{name}</div>
            <div className="text-xs font-mono text-gray-500">{address.slice(0, 8)}...</div>
            <div className="text-xs text-gray-400">
              Color: <span className="font-mono">#{address.slice(2, 8)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * Interactive demo showing fallback behavior when ENS avatar fails to load.
 */
export const FallbackBehavior: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center text-sm text-gray-600 mb-4">
        When ENS avatar fails to load, it automatically falls back to a blockie
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 mb-4">Working ENS Avatar</div>
          <WalletAvatar
            address={EXAMPLE_ADDRESSES.vitalik}
            ensAvatar={MOCK_ENS_AVATARS.vitalik}
            className="h-16 w-16 mx-auto"
          />
          <div className="text-sm text-gray-600 mt-2">Loads successfully</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 mb-4">Broken ENS Avatar URL</div>
          <WalletAvatar
            address={EXAMPLE_ADDRESSES.vitalik}
            ensAvatar="https://broken-url.example.com/avatar.jpg"
            className="h-16 w-16 mx-auto"
          />
          <div className="text-sm text-gray-600 mt-2">Falls back to blockie</div>
        </div>
      </div>
    </div>
  ),
};
