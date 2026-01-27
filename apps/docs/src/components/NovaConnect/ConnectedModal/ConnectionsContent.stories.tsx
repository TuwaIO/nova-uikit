import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectionsContent } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectionsContent> = {
  title: 'Nova Connect/ConnectedModal/ConnectionsContent',
  component: ConnectionsContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays and manages multiple wallet connections. Requires wallet connection context from NovaConnectProvider.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white">
        <div className="p-4 text-center text-gray-500 text-sm">
          Note: Requires wallet connection context to display connections.
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectionsContent>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'p-4',
  },
};
