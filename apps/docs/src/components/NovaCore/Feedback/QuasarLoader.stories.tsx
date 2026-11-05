import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuasarLoader } from '@tuwaio/nova-core';

const meta: Meta<typeof QuasarLoader> = {
  title: 'Nova Core/Feedback/QuasarLoader',
  component: QuasarLoader,
  tags: ['autodocs'],
  args: { size: 64 },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 96, step: 4 } },
    variant: { control: 'select', options: [undefined, 'full', 'compact'] },
    accent: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof QuasarLoader>;

/** The whole mark: a dash orbits the disk, the core breathes, a beam runs out along each jet. */
export const Default: Story = {};

/** Every size in use. Below 28 px it is the compact mark, for buttons and lines of text. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8 text-[var(--tuwa-text-primary)]">
      {[72, 64, 40, 24, 20, 16, 12].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2 text-xs text-[var(--tuwa-text-secondary)]">
          <QuasarLoader size={size} />
          {size} px
        </div>
      ))}
    </div>
  ),
};

/** A status color instead of the accent: what is pending is orange. */
export const PendingColor: Story = {
  args: { accent: 'var(--tuwa-pending-icon)' },
};

/** In a button it takes the color of the text. */
export const InButtons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 font-mono text-sm font-medium">
      <button
        type="button"
        className="flex items-center gap-2 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-pending-bg)] px-3 py-2 text-[var(--tuwa-pending-text)]"
      >
        <QuasarLoader size={16} accent="currentColor" />
        Processing...
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] px-3 py-2 text-[var(--tuwa-text-primary)]"
      >
        <QuasarLoader size={16} />
        Exporting...
      </button>
    </div>
  ),
};

/** The wait of a whole screen, announced to screen readers through `label`. */
export const WholeScreen: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3 py-8 text-sm text-[var(--tuwa-text-secondary)]">
      <QuasarLoader size={72} label="Loading the dashboard" className="text-[var(--tuwa-text-primary)]" />
      Loading the dashboard...
    </div>
  ),
};
