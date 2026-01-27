import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletIcon } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof WalletIcon> = {
  title: 'Nova Connect/Primitives/WalletIcon',
  component: WalletIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    size: 40,
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Wallet name (used for fallback and alt text).',
    },
    icon: {
      control: 'text',
      description: 'Icon URL for the wallet.',
    },
    size: {
      control: 'number',
      description: 'Size in pixels.',
    },
    showLoading: {
      control: 'boolean',
      description: 'Show loading overlay.',
    },
    lazy: {
      control: 'boolean',
      description: 'Enable lazy loading for the image.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WalletIcon>;

export const MetaMask: Story = {};

export const WalletConnect: Story = {
  args: {
    name: 'WalletConnect',
    icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
  },
};

export const Coinbase: Story = {
  args: {
    name: 'Coinbase Wallet',
    icon: 'https://www.coinbase.com/assets/press/coinbase-icon-b-c.png',
  },
};

export const CustomSize: Story = {
  args: {
    size: 64,
  },
};

export const SmallSize: Story = {
  args: {
    size: 24,
  },
};

export const FallbackIcon: Story = {
  args: {
    name: 'Unknown Wallet',
    icon: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the fallback icon when no icon URL is provided.',
      },
    },
  },
};

export const BrokenImage: Story = {
  args: {
    name: 'Broken Wallet',
    icon: 'https://invalid-url.example.com/broken.png',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows fallback when the image fails to load.',
      },
    },
  },
};

export const WithLoading: Story = {
  args: {
    showLoading: true,
  },
};
