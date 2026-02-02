import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloseIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof CloseIcon> = {
  title: 'Nova Core/Icons/CloseIcon',
  component: CloseIcon,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to style the icon (e.g., color, size).',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CloseIcon>;

export const Default: Story = {
  args: {},
};

export const CustomColor: Story = {
  args: {
    className: 'text-red-500',
  },
};

export const Large: Story = {
  args: {
    className: 'w-10 h-10',
  },
};
