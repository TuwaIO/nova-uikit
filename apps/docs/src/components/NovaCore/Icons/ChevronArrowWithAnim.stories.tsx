import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronArrowWithAnim } from '@tuwaio/nova-core';

// Meta definition for the Storybook
const meta: Meta<typeof ChevronArrowWithAnim> = {
  title: 'Nova Core/Icons/ChevronArrowWithAnim',
  component: ChevronArrowWithAnim,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls the direction of the arrow (open/closed state).',
      defaultValue: false,
    },
    strokeWidth: {
      control: { type: 'number', min: 1, max: 4, step: 0.5 },
      description: 'Thickness of the arrow strokes.',
      defaultValue: 2,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes (optional).',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ChevronArrowWithAnim>;

/**
 * Default state (Closed).
 * The arrow points down by default.
 */
export const Default: Story = {
  args: {
    isOpen: false,
    strokeWidth: 2,
  },
};

/**
 * Open state.
 * The arrow points up.
 */
export const Open: Story = {
  args: {
    isOpen: true,
    strokeWidth: 2,
  },
};

/**
 * Thicker stroke variant.
 */
export const ThickStroke: Story = {
  args: {
    isOpen: false,
    strokeWidth: 3,
  },
};
