import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectButton } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectButton> = {
  title: 'Nova Connect/ConnectButton/ConnectButton',
  component: ConnectButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Main wallet connection button. Handles connect/disconnect states automatically via NovaConnectProvider context.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectButton>;

/**
 * Default state - shows "Connect Wallet" when disconnected.
 * Requires NovaConnectProvider context to function properly.
 */
export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'rounded-full',
  },
};
