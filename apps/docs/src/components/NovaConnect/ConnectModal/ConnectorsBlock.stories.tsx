import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectorsBlock } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectorsBlock> = {
  title: 'Nova Connect/ConnectModal/ConnectorsBlock',
  component: ConnectorsBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a grouped section of wallet connectors. Requires connector context from NovaConnectProvider.',
      },
    },
  },
  args: {
    selectedAdapter: undefined,
    connectors: [],
    title: 'Installed Wallets',
    isTitleBold: true,
    isOnlyOneNetwork: false,
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Section title.',
    },
    isTitleBold: {
      control: 'boolean',
      description: 'Use bold font for title.',
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
type Story = StoryObj<typeof ConnectorsBlock>;

export const Default: Story = {};

export const WithBoldTitle: Story = {
  args: {
    isTitleBold: true,
  },
};

export const SingleNetwork: Story = {
  args: {
    isOnlyOneNetwork: true,
  },
};
