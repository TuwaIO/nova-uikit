import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedModal } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectedModal> = {
  title: 'Nova Connect/ConnectedModal/ConnectedModal',
  component: ConnectedModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal for managing connected wallet. Shows balance, transactions, chain switching. Requires NovaConnectProvider context.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[600px] w-full flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedModal>;

/**
 * ConnectedModal requires NovaConnectProvider context and a connected wallet to function.
 */
export const Default: Story = {};
