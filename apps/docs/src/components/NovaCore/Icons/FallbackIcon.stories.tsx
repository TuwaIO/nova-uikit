import type { Meta, StoryObj } from '@storybook/react-vite';
import { FallbackIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof FallbackIcon> = {
  title: 'Nova Core/Icons/FallbackIcon',
  component: FallbackIcon,
  tags: ['autodocs'],
  argTypes: {
    animate: {
      control: 'boolean',
      description: 'Whether to show a pulse animation (loading state).',
      defaultValue: false,
    },
    content: {
      control: 'text',
      description: 'Text content (e.g., "?") inside the fallback circle.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FallbackIcon>;

/**
 * Default fallback (empty circle).
 */
export const Default: Story = {
  args: {
    animate: false,
    content: '',
    className: 'w-6 h-6',
  },
};

/**
 * Loading state with pulse animation.
 */
export const Loading: Story = {
  args: {
    animate: true,
    content: '',
    className: 'w-6 h-6',
  },
};

/**
 * Error state with question mark.
 */
export const WithContent: Story = {
  args: {
    animate: false,
    content: '?',
    className: 'w-6 h-6',
  },
};

/**
 * Custom styled fallback.
 */
export const CustomStyle: Story = {
  args: {
    animate: false,
    content: '!',
    className: 'w-12 h-12 bg-red-900 text-white',
  },
};
