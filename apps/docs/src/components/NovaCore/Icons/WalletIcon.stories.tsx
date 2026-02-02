import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof WalletIcon> = {
  title: 'Nova Core/Icons/WalletIcon',
  component: WalletIcon,
  tags: ['autodocs'],
  argTypes: {
    walletName: {
      control: 'text',
      description: 'The unique identifier of the wallet (e.g., "metamask").',
    },
    variant: {
      control: 'select',
      options: ['background', 'branded', 'mono'],
      description: 'Visual style variant.',
      defaultValue: 'background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof WalletIcon>;

export const Metamask: Story = {
  args: {
    walletName: 'metamask',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

export const Phantom: Story = {
  args: {
    walletName: 'phantom',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

export const WalletConnect: Story = {
  args: {
    walletName: 'walletconnect',
    variant: 'branded',
    className: 'w-10 h-10',
  },
};

export const Impersonated: Story = {
  args: {
    walletName: 'impersonatedwallet',
    className: 'w-10 h-10',
  },
};

export const Fallback: Story = {
  args: {
    walletName: 'unknown-wallet-xyz',
    className: 'w-10 h-10',
  },
};
