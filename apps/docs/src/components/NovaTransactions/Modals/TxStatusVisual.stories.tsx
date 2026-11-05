import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxStatusVisual } from '@tuwaio/nova-transactions';
import { useState } from 'react';

const meta: Meta<typeof TxStatusVisual> = {
  title: 'Nova Transactions/Modals/TxStatusVisual',
  component: TxStatusVisual,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isProcessing: false,
    isSucceed: false,
    isFailed: false,
    isReplaced: false,
  },
  argTypes: {
    isProcessing: {
      control: 'boolean',
      description: 'True if the transaction is being submitted or is pending.',
    },
    isSucceed: {
      control: 'boolean',
      description: 'True if the transaction has successfully completed.',
    },
    isFailed: {
      control: 'boolean',
      description: 'True if the transaction has failed or was reverted.',
    },
    isReplaced: {
      control: 'boolean',
      description: 'True if the transaction was replaced by something else than a speed-up, as by a cancel.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * An interactive story that allows you to toggle between all possible states of the visual indicator. Initializing and
 * Processing look the same on purpose: the loader does not restart when the wallet has signed.
 */
export const Interactive: Story = {
  render: (args) => {
    const [status, setStatus] = useState<keyof typeof states>('initializing');

    const states = {
      initializing: { label: 'Initializing', props: {} },
      processing: { label: 'Processing', props: { isProcessing: true } },
      succeed: { label: 'Succeed', props: { isSucceed: true } },
      failed: { label: 'Failed', props: { isFailed: true } },
      replaced: { label: 'Replaced', props: { isReplaced: true } },
    };

    return (
      <div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
        <div className="flex justify-center rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-secondary)] p-4">
          <TxStatusVisual {...args} {...states[status].props} />
        </div>
        <div className="flex flex-wrap justify-center gap-2 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-2">
          {Object.entries(states).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              aria-pressed={status === key}
              onClick={() => setStatus(key as keyof typeof states)}
              className={`cursor-pointer rounded-[var(--tuwa-rounded-corners)] border px-2 py-1 text-xs ${
                status === key
                  ? 'border-[var(--tuwa-text-accent)] bg-[var(--tuwa-bg-primary)] font-semibold text-[var(--tuwa-text-accent)]'
                  : 'border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * A side-by-side comparison of all available states for easy visual reference.
 */
export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const states = [
      { label: 'Initializing', props: {} },
      { label: 'Processing', props: { isProcessing: true } },
      { label: 'Succeed', props: { isSucceed: true } },
      { label: 'Failed', props: { isFailed: true } },
      { label: 'Replaced', props: { isReplaced: true } },
    ];

    return (
      <div className="flex flex-wrap items-center justify-center gap-8">
        {states.map(({ label, props }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <TxStatusVisual {...props} />
            <span className="text-sm text-[var(--tuwa-text-secondary)]">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * The state with no flags set: the same loader as Processing, as nothing has a result yet.
 */
export const Initializing: Story = {
  name: 'State: Initializing',
};

/**
 * The state while the transaction is being submitted or is pending: the wallet signs, or it waits for a block.
 */
export const Processing: Story = {
  name: 'State: Processing',
  args: {
    isProcessing: true,
  },
};

/**
 * The final state for a successfully completed transaction.
 */
export const Succeed: Story = {
  name: 'State: Succeed',
  args: {
    isSucceed: true,
  },
};
