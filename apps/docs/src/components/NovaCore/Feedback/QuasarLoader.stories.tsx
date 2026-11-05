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
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-8 text-[var(--tuwa-text-primary)]">
      {[72, 64, 48, 40, 24, 20, 16, 12].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2 text-xs text-[var(--tuwa-text-secondary)]">
          <QuasarLoader size={size} />
          {size} px
        </div>
      ))}
    </div>
  ),
};

/** By default it takes the accent color. What is pending takes the pending color instead. */
export const PendingColor: Story = {
  args: { accent: 'var(--tuwa-pending-icon)' },
};

/** With `accent="currentColor"` it takes the color of the text, as in `TxActionButton` (left). Without it, it keeps the accent color (right). */
export const InButtons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3 font-mono text-sm font-medium">
      <button
        type="button"
        disabled
        className="flex cursor-not-allowed items-center gap-2 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-pending-bg)] px-3 py-2 text-[var(--tuwa-pending-text)]"
      >
        <QuasarLoader size={16} accent="currentColor" />
        Processing...
      </button>
      <button
        type="button"
        disabled
        className="flex cursor-not-allowed items-center gap-2 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] px-3 py-2 text-[var(--tuwa-text-primary)]"
      >
        <QuasarLoader size={16} />
        Exporting...
      </button>
    </div>
  ),
};

/** The wait of a whole screen. `label` is the text a screen reader finds there; the visible line is hidden from it, not to read twice. */
export const WholeScreen: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-center gap-3 py-8 text-sm text-[var(--tuwa-text-secondary)]">
      <QuasarLoader size={72} label="Loading the dashboard" className="text-[var(--tuwa-text-primary)]" />
      <span aria-hidden="true">Loading the dashboard...</span>
    </div>
  ),
};
