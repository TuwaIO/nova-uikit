import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExitIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof ExitIcon> = {
  title: 'Nova Core/Icons/ExitIcon',
  component: ExitIcon,
  tags: ['autodocs'],
  args: { className: 'h-10 w-10 text-[var(--tuwa-text-secondary)]' },
};

export default meta;
type Story = StoryObj<typeof ExitIcon>;

/** A door and an arrow on its way out. */
export const Default: Story = {};

/** In a button: hover it, and the arrow goes further out while the button turns red. */
export const InAButton: Story = {
  render: () => (
    <button
      type="button"
      aria-label="Disconnect"
      className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] p-1.5 text-[var(--tuwa-text-secondary)] transition-colors hover:bg-[var(--tuwa-error-bg)] hover:text-[var(--tuwa-error-text)]"
    >
      <ExitIcon className="h-5 w-5" />
    </button>
  ),
};
