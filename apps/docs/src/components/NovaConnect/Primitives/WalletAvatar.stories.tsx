import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletAvatar } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof WalletAvatar> = {
  title: 'Nova Connect/Primitives/WalletAvatar',
  component: WalletAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    size: 'md',
  },
  argTypes: {
    address: {
      control: 'text',
      description: 'Wallet address to generate the avatar for.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size preset of the avatar.',
    },
    ensAvatar: {
      control: 'text',
      description: 'Optional ENS avatar URL.',
    },
    showLoading: {
      control: 'boolean',
      description: 'Whether to show loading indicator.',
    },
    disableAnimation: {
      control: 'boolean',
      description: 'Disable loading animation.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WalletAvatar>;

export const Default: Story = {};

export const WithENSAvatar: Story = {
  args: {
    ensAvatar: 'https://avatars.githubusercontent.com/u/1234567?v=4',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const Loading: Story = {
  args: {
    ensAvatar: 'https://slow-loading-image.example.com/avatar.png',
    showLoading: true,
  },
};

export const DifferentAddress: Story = {
  args: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bE01',
  },
};
