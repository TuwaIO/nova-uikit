import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedModalTxHistory } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectedModalTxHistory> = {
  title: 'Nova Connect/ConnectedModal/ConnectedModalTxHistory',
  component: ConnectedModalTxHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays transaction history for the connected wallet. Requires NovaConnectProvider, Pulsar adapter, and transaction pool.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] h-[400px] border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="text-center text-gray-500 text-xs p-2">Requires wallet and Pulsar context</div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedModalTxHistory>;

export const Default: Story = {};
