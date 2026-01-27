import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChainSelector } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ChainSelector> = {
  title: 'Nova Connect/Chains/ChainSelector',
  component: ChainSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A chain selector dropdown for switching networks. Requires wallet connection context from NovaConnectProvider.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <div className="text-center text-gray-500 text-sm mb-4">Note: Requires wallet context to function.</div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChainSelector>;

export const Default: Story = {};
