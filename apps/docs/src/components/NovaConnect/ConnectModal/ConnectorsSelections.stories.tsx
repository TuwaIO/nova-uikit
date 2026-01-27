import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectorsSelections } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectorsSelections> = {
  title: 'Nova Connect/ConnectModal/ConnectorsSelections',
  component: ConnectorsSelections,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays categorized wallet connectors. Requires NovaConnectProvider context for connector data.',
      },
    },
  },
  args: {
    selectedAdapter: undefined,
    connectors: [],
    onClick: () => {},
    setIsConnected: () => {},
    setIsOpen: () => {},
    setContentType: () => {},
    isOnlyOneNetwork: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectorsSelections>;

export const Default: Story = {};

export const SingleNetwork: Story = {
  args: {
    isOnlyOneNetwork: true,
  },
};
