import type { Meta, StoryObj } from '@storybook/react-vite';
import { Connecting } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof Connecting> = {
  title: 'Nova Connect/ConnectModal/Connecting',
  component: Connecting,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays connection status when connecting to a wallet. Requires connector context to function properly.',
      },
    },
  },
  args: {
    activeConnector: 'metamask',
    selectedAdapter: undefined,
    connectors: [],
    isConnected: false,
  },
  argTypes: {
    activeConnector: {
      control: 'text',
      description: 'ID of the connector being connected.',
    },
    isConnected: {
      control: 'boolean',
      description: 'Whether connection is successful.',
    },
    showDetailedError: {
      control: 'boolean',
      description: 'Show detailed error messages.',
    },
    customErrorMessage: {
      control: 'text',
      description: 'Custom error message to display.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Connecting>;

export const Default: Story = {};

export const Connected: Story = {
  args: {
    isConnected: true,
  },
};

export const WithError: Story = {
  args: {
    customErrorMessage: 'User rejected the connection request.',
    showDetailedError: true,
  },
};
