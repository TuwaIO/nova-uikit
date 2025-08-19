// apps/docs/src/components/TrackingTxModal/TxProgressIndicator.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxProgressIndicator } from '@tuwaio/nova-transactions';
import { useState } from 'react';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxProgressIndicator> = {
  title: 'UI Components/TrackingTxModal/TxProgressIndicator',
  component: TxProgressIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
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
      description: 'True if the transaction is currently being processed',
    },
    isSucceed: {
      control: 'boolean',
      description: 'True if the transaction has successfully completed',
    },
    isFailed: {
      control: 'boolean',
      description: 'True if the transaction has failed',
    },
    isReplaced: {
      control: 'boolean',
      description: 'True if the transaction was replaced (e.g., sped up)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    StepComponent: {
      control: false,
      description: 'Custom component to use instead of the default Step',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Basic States ---

export const Default: Story = {
  name: 'Default (Created)',
};

// --- State Comparison ---

export const AllStates: Story = {
  render: () => {
    const states = [
      { label: 'Default (Created)', props: {} },
      { label: 'Processing', props: { isProcessing: true } },
      { label: 'Success', props: { isSucceed: true } },
      { label: 'Failed', props: { isFailed: true } },
      { label: 'Replaced', props: { isReplaced: true } },
    ];

    return (
      <div className="space-y-8 p-6 max-w-4xl">
        {states.map(({ label, props }) => (
          <div key={label} className="space-y-3">
            <h3 className="text-sm font-medium text-center text-[var(--tuwa-text-primary)]">{label}</h3>
            <div className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]">
              <TxProgressIndicator {...props} />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// --- Interactive Demo ---

export const InteractiveDemo: Story = {
  render: () => {
    const [currentState, setCurrentState] = useState<string>('default');

    const states = [
      { key: 'default', label: 'Default (Created)', props: {} },
      { key: 'processing', label: 'Processing', props: { isProcessing: true } },
      { key: 'success', label: 'Success', props: { isSucceed: true } },
      { key: 'failed', label: 'Failed', props: { isFailed: true } },
      { key: 'replaced', label: 'Replaced', props: { isReplaced: true } },
    ];

    const activeProps = states.find((state) => state.key === currentState)?.props || {};

    return (
      <div className="space-y-6 p-6 max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--tuwa-text-primary)] mb-2">Progress Indicator Demo</h2>
          <p className="text-[var(--tuwa-text-secondary)]">Click buttons to see different transaction states</p>
        </div>

        {/* Progress Display */}
        <div className="p-6 bg-[var(--tuwa-bg-secondary)] rounded-xl border-2 border-[var(--tuwa-border-primary)]">
          <TxProgressIndicator {...activeProps} />
        </div>

        {/* State Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {states.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrentState(key)}
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                currentState === key
                  ? 'bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)] border-[var(--tuwa-text-accent)] shadow-lg'
                  : 'bg-[var(--tuwa-bg-secondary)] text-[var(--tuwa-text-primary)] border-[var(--tuwa-border-primary)] hover:bg-[var(--tuwa-bg-muted)] hover:border-[var(--tuwa-text-accent)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Current State Info */}
        <div className="text-center p-4 bg-[var(--tuwa-info-bg)] rounded-lg">
          <p className="text-sm text-[var(--tuwa-info-text)]">
            Current state: <span className="font-semibold">{states.find((s) => s.key === currentState)?.label}</span>
          </p>
        </div>
      </div>
    );
  },
};
