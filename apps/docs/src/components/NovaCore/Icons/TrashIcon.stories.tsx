import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrashIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof TrashIcon> = {
  title: 'Nova Core/Icons/TrashIcon',
  component: TrashIcon,
  tags: ['autodocs'],
  args: { className: 'h-10 w-10 text-[var(--tuwa-text-secondary)]' },
};

export default meta;
type Story = StoryObj<typeof TrashIcon>;

/** A bin with a lid of its own. */
export const Default: Story = {};

/** In a button: hover it and the lid opens while the button turns red; press it and the lid closes. */
export const InAButton: Story = {
  render: () => (
    <button
      type="button"
      aria-label="Remove"
      className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] p-1.5 text-[var(--tuwa-text-secondary)] transition-colors hover:bg-[var(--tuwa-error-bg)] hover:text-[var(--tuwa-error-icon)]"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  ),
};
