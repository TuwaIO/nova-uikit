import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastCloseButton } from '@tuwaio/nova-core';

const meta: Meta<typeof ToastCloseButton> = {
  title: 'Nova Core/Feedback/ToastCloseButton',
  component: ToastCloseButton,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers.',
    },
    title: {
      control: 'text',
      description: 'Tooltip text on hover.',
    },
    className: {
      control: 'text',
      description: 'Container class overrides.',
    },
    iconClassName: {
      control: 'text',
      description: 'Icon SVG class overrides.',
    },
    closeToast: {
      action: 'clicked',
      description: 'Function called when clicked.',
    },
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    // Decorator to provide a context for the absolute positioning of the button
    (Story) => (
      <div className="relative w-64 h-20 bg-[var(--tuwa-bg-primary)] border border-[var(--tuwa-border-primary)] rounded-md flex items-center justify-center">
        <span className="text-[var(--tuwa-text-primary)]">Toast Content Here</span>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastCloseButton>;

export const Default: Story = {
  args: {},
};

export const CustomTooltip: Story = {
  args: {
    title: 'Dismiss this alert',
    ariaLabel: 'Dismiss this alert',
  },
};

export const CustomStyle: Story = {
  args: {
    className: 'bg-red-500/10 hover:bg-red-500/20 text-red-500',
  },
};
