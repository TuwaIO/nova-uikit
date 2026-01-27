import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToTopButton } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ToTopButton> = {
  title: 'Nova Connect/Primitives/ToTopButton',
  component: ToTopButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: () => alert('Scroll to top!'),
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
type Story = StoryObj<typeof ToTopButton>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
