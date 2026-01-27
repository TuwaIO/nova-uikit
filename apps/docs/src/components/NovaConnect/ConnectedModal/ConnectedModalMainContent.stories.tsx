import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedModalMainContent } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectedModalMainContent> = {
  title: 'Nova Connect/ConnectedModal/ConnectedModalMainContent',
  component: ConnectedModalMainContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Main content section of the connected modal. Requires wallet connection context from NovaConnectProvider and useSatelliteConnectStore.',
      },
    },
  },
  args: {
    chainsList: [1, 10, 137],
    ensAvatar: null,
    avatarIsLoading: false,
    balanceLoading: false,
    ensNameAbbreviated: undefined,
    balance: null,
    refetch: () => alert('Refetch balance'),
  },
  argTypes: {
    avatarIsLoading: {
      control: 'boolean',
      description: 'Whether avatar is loading.',
    },
    balanceLoading: {
      control: 'boolean',
      description: 'Whether balance is loading.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white">
        <div className="p-4 text-center text-gray-500 text-sm">
          Note: Requires wallet connection context to display full content.
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedModalMainContent>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    avatarIsLoading: true,
    balanceLoading: true,
  },
};

export const WithENS: Story = {
  args: {
    ensNameAbbreviated: 'vitalik.eth',
    ensAvatar: 'https://euc.li/vitalik.eth',
  },
};
