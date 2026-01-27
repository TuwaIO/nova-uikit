import type { Meta, StoryObj } from '@storybook/react-vite';
import { WaitForConnectionContent } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof WaitForConnectionContent> = {
  title: 'Nova Connect/ConnectButton/WaitForConnectionContent',
  component: WaitForConnectionContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a waiting/connecting state animation. Uses internal context to determine connection status.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[160px] border border-gray-200 rounded-lg bg-white p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WaitForConnectionContent>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-gray-50',
  },
};
