import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastCloseButton } from '@tuwaio/nova-transactions';
import { action } from 'storybook/actions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof ToastCloseButton> = {
  title: 'UI Components/Toast/ToastCloseButton',
  component: ToastCloseButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    // The `action` addon logs clicks in the Storybook Actions tab.
    closeToast: action('close-button-clicked'),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default view of the ToastCloseButton.
 * The button uses absolute positioning, so we render it inside a simple
 * div container to demonstrate its placement. The global decorator
 * in `.storybook/preview.tsx` already provides the LabelsProvider.
 */
export const Default: Story = {
  render: (args) => (
    <div className="relative h-24 w-48 rounded-lg bg-[var(--tuwa-bg-base)]">
      <ToastCloseButton {...args} />
    </div>
  ),
};
