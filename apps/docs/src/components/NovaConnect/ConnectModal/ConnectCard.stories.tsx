import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectCard } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectCard> = {
  title: 'Nova Connect/ConnectModal/ConnectCard',
  component: ConnectCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'MetaMask',
    isRecent: false,
    onClick: () => alert('Connect to MetaMask'),
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Wallet name.',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle text.',
    },
    isRecent: {
      control: 'boolean',
      description: 'Show recent badge.',
    },
    infoLink: {
      control: 'text',
      description: 'URL for wallet info.',
    },
    icon: {
      control: 'text',
      description: 'Wallet icon URL.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] border border-gray-200 rounded-lg bg-white p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectCard>;

export const Default: Story = {};

export const RecentWallet: Story = {
  args: {
    isRecent: true,
  },
};

export const WithSubtitle: Story = {
  args: {
    subtitle: 'Popular browser wallet',
  },
};

export const WithInfoLink: Story = {
  args: {
    infoLink: 'https://metamask.io',
  },
};
