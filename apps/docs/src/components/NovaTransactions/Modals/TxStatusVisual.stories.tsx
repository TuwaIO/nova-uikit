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
      description: 'True if the transaction is currently being processed (in the mempool).',
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
      description: 'True if the transaction was replaced (e.g., sped up or cancelled).',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * An interactive story that allows you to toggle between all possible states of the visual indicator.
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
      <div className="w-96 space-y-4">
        <div className="flex justify-center rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-secondary)] p-4">
          <TxStatusVisual {...args} {...states[status].props} />
        </div>
        <div className="flex flex-wrap justify-center gap-2 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-2">
          {Object.entries(states).map(([key, { label }]) => (
            <button key={key} onClick={() => setStatus(key as keyof typeof states)}>
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
 * The default state, shown when a transaction is created but not yet processing (e.g., waiting for signature).
 */
export const Initializing: Story = {
  name: 'State: Initializing',
};

/**
 * The state when the transaction is actively being processed on-chain.
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
