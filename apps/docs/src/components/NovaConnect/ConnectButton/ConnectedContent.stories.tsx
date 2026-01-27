import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedContent } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectedContent> = {
  title: 'Nova Connect/ConnectButton/ConnectedContent',
  component: ConnectedContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays connected wallet status with balance and transaction monitoring. Requires NovaConnectProvider and useSatelliteConnectStore context.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[200px] border border-gray-200 rounded-lg bg-white p-2">
        <div className="text-center text-gray-500 text-xs mb-2">Requires wallet context</div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedContent>;

export const Default: Story = {};
