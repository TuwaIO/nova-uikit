import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastCloseButton } from '@tuwaio/nova-transactions';
import { action } from 'storybook/actions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof ToastCloseButton> = {
  title: 'Components/Shared/ToastCloseButton',
  component: ToastCloseButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  args: {
    // The `action` addon logs clicks in the Storybook Actions panel.
    closeToast: action('close-button-clicked'),
  },
  argTypes: {
    closeToast: {
      description: 'The function to call when the button is clicked to dismiss the notification.',
      action: 'clicked',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default view of the `ToastCloseButton`.
 * The button is absolutely positioned, so we render it inside a relative
 * container here to demonstrate its placement.
 */
export const Default: Story = {
  render: (args) => (
    <div className="relative h-20 w-40 rounded-lg bg-[var(--tuwa-bg-muted)] p-4">
      <p className="text-sm text-[var(--tuwa-text-secondary)]">A container</p>
      <ToastCloseButton {...args} />
    </div>
  ),
};
