import type { Meta, StoryObj } from '@storybook/react-vite';
import { NetworkSelections } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof NetworkSelections> = {
  title: 'Nova Connect/ConnectModal/NetworkSelections',
  component: NetworkSelections,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays available networks for a connector. Requires connector context from NovaConnectProvider.',
      },
    },
  },
  args: {
    activeConnector: 'metamask',
    connectors: [],
    onClick: async () => alert('Network selected'),
  },
  argTypes: {
    activeConnector: {
      control: 'text',
      description: 'Currently active connector ID.',
    },
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
type Story = StoryObj<typeof NetworkSelections>;

/**
 * Default state - requires connector context.
 */
export const Default: Story = {};
