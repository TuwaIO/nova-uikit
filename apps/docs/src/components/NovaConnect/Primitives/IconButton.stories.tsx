import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof IconButton> = {
  title: 'Nova Connect/Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    walletName: 'MetaMask',
    walletIcon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    walletChainId: 1,
    onClick: () => alert('IconButton clicked'),
  },
  argTypes: {
    walletName: {
      control: 'text',
      description: 'Name of the connected wallet.',
    },
    walletIcon: {
      control: 'text',
      description: 'Icon URL for the wallet.',
    },
    walletChainId: {
      control: 'number',
      description: 'Chain ID the wallet is connected to.',
    },
    isOpen: {
      control: 'boolean',
      description: 'Whether the dropdown is open (controls chevron direction).',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading animation.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Open: Story = {
  args: {
    isOpen: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DifferentChain: Story = {
  args: {
    walletChainId: 137,
  },
};

export const NoIcon: Story = {
  args: {
    walletIcon: undefined,
    walletName: 'Unknown Wallet',
  },
};
