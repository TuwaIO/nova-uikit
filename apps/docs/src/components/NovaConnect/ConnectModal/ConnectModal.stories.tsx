import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectModal } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectModal> = {
  title: 'Nova Connect/ConnectModal/ConnectModal',
  component: ConnectModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Main wallet connection modal. Requires NovaConnectProvider context and manages its own internal state.',
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
type Story = StoryObj<typeof ConnectModal>;

/**
 * ConnectModal requires NovaConnectProvider context to function.
 * In isolation, it displays an empty state.
 */
export const Default: Story = {};
