import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedModalNameAndBalance } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectedModalNameAndBalance> = {
  title: 'Nova Connect/ConnectedModal/ConnectedModalNameAndBalance',
  component: ConnectedModalNameAndBalance,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays wallet name, address copy button, and balance. Requires NovaConnectProvider and useSatelliteConnectStore context.',
      },
    },
  },
  args: {
    refetch: () => console.log('Refetching balance...'),
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white p-4">
        <div className="text-center text-gray-500 text-xs mb-2">Requires wallet context</div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedModalNameAndBalance>;

export const Default: Story = {};
