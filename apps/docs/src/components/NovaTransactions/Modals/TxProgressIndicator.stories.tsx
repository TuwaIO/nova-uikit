import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepProps, TxProgressIndicator } from '@tuwaio/nova-transactions';
import { useState } from 'react';

const meta: Meta<typeof TxProgressIndicator> = {
  title: 'Nova Transactions/Modals/TxProgressIndicator',
  component: TxProgressIndicator,
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
    StepComponent: {
      control: false,
      description: 'An optional custom component to use instead of the default `Step`.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * An interactive story that allows you to toggle between all possible states of the progress indicator.
 */
export const Interactive: Story = {
  render: (args) => {
    const [status, setStatus] = useState<keyof typeof states>('created');

    const states = {
      created: { label: 'Created', props: {} },
      processing: { label: 'Processing', props: { isProcessing: true } },
      succeed: { label: 'Succeed', props: { isSucceed: true } },
      failed: { label: 'Failed', props: { isFailed: true } },
      replaced: { label: 'Replaced', props: { isReplaced: true } },
    };

    return (
      <div className="w-96 space-y-4">
        <TxProgressIndicator {...args} {...states[status].props} />
        <div className="flex flex-wrap justify-center gap-2 rounded-md bg-[var(--tuwa-bg-muted)] p-2">
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
 * The default state of the indicator, shown when a transaction is first created but not yet processing.
 */
export const Default: Story = {
  name: 'State: Created',
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
 * The final state for a successfully completed transaction. All steps are marked as complete.
 */
export const Succeed: Story = {
  name: 'State: Succeed',
  args: {
    isSucceed: true,
  },
};

/**
 * The final state for a failed transaction. The last step is marked with an error.
 */
export const Failed: Story = {
  name: 'State: Failed',
  args: {
    isFailed: true,
  },
};

/**
 * An example of replacing the default `Step` component with a completely custom implementation.
 */
export const WithCustomStep: Story = {
  args: {
    ...Processing.args,
    StepComponent: ({ status, label }: StepProps) => (
      <div className="flex flex-1 flex-col items-center gap-2">
        <div
          className={`h-4 w-4 rounded-full ${
            status === 'completed' ? 'bg-green-500' : status === 'active' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
          }`}
        />
        <span className={`text-xs ${status !== 'inactive' ? 'font-bold text-blue-700' : 'text-gray-500'}`}>
          {label}
        </span>
      </div>
    ),
  },
};
