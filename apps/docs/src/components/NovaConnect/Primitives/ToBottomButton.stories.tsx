import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToBottomButton } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ToBottomButton> = {
  title: 'Nova Connect/Primitives/ToBottomButton',
  component: ToBottomButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: () => alert('Scroll to bottom!'),
  },
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Callback when button is clicked.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] border border-gray-200 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToBottomButton>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
