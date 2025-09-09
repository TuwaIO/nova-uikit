import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletAvatar } from '@tuwaio/nova-transactions';
import { zeroAddress } from 'viem';

// --- Mock Data ---

const EXAMPLE_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  another: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
};

const MOCK_ENS_AVATARS = {
  vitalik: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  another: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
};

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletAvatar> = {
  title: 'Components/Shared/WalletAvatar',
  component: WalletAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    address: EXAMPLE_ADDRESSES.vitalik,
  },
  argTypes: {
    address: {
      control: 'text',
      description: "The user's wallet address, used for the blockie fallback and background color.",
    },
    ensAvatar: {
      control: 'text',
      description: 'An optional URL for the user`s ENS avatar image. Takes priority over the blockie.',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for custom styling.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default state of the avatar, showing a procedurally generated "blockie" based on the wallet address.
 * The background color is also uniquely generated from the address.
 */
export const DefaultBlockie: Story = {
  name: 'Default (Blockie)',
  args: {
    address: EXAMPLE_ADDRESSES.another,
  },
};

/**
 * When an `ensAvatar` URL is provided, it is displayed instead of the blockie.
 */
export const WithENSAvatar: Story = {
  args: {
    address: EXAMPLE_ADDRESSES.vitalik,
    ensAvatar: MOCK_ENS_AVATARS.vitalik,
  },
};

/**
 * The component includes an `onError` handler. If the `ensAvatar` URL is invalid or fails to load,
 * it automatically falls back to displaying the blockie.
 */
export const FallbackToBlockie: Story = {
  name: 'Fallback (Broken ENS URL)',
  args: {
    address: EXAMPLE_ADDRESSES.another,
    ensAvatar: 'https://invalid-url.example.com/avatar.png',
  },
};

/**
 * An example showing the unique blockie generated for the zero address (burn address).
 */
export const ZeroAddress: Story = {
  args: {
    address: zeroAddress,
  },
};

/**
 * You can easily change the size of the avatar by passing Tailwind CSS height and width classes.
 */
export const DifferentSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <WalletAvatar {...args} className="h-8 w-8" />
      <WalletAvatar {...args} className="h-12 w-12" /> {/* Default size */}
      <WalletAvatar {...args} className="h-16 w-16" />
    </div>
  ),
};

/**
 * An example of applying custom borders and shadows for different visual effects.
 */
export const WithCustomStyling: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <WalletAvatar {...args} className="border-4 border-blue-500 shadow-lg" />
      <WalletAvatar {...args} ensAvatar={MOCK_ENS_AVATARS.another} className="rounded-lg border-4 border-purple-500" />
    </div>
  ),
};
