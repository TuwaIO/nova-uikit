import { HeartIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TxStatusVisual } from './TxStatusVisual';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxStatusVisual> = {
  title: 'UI Components/TrackingTxModal/TxStatusVisual',
  component: TxStatusVisual,
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
      description: 'True if the transaction is currently being processed (e.g., in the mempool)',
    },
    isSucceed: {
      control: 'boolean',
      description: 'True if the transaction has successfully completed',
    },
    isFailed: {
      control: 'boolean',
      description: 'True if the transaction has failed or was reverted',
    },
    isReplaced: {
      control: 'boolean',
      description: 'True if the transaction was replaced (e.g., sped up)',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Basic States ---

export const Default: Story = {
  name: 'Default (Pending)',
};

// --- State Comparison ---

export const AllStates: Story = {
  render: () => {
    const states = [
      { label: 'Default (Pending)', props: {} },
      { label: 'Processing', props: { isProcessing: true } },
      { label: 'Success', props: { isSucceed: true } },
      { label: 'Failed', props: { isFailed: true } },
      { label: 'Replaced', props: { isReplaced: true } },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6 max-w-6xl">
        {states.map(({ label, props }) => (
          <div key={label} className="space-y-3">
            <h3 className="text-sm font-medium text-center text-[var(--tuwa-text-primary)]">{label}</h3>
            <div className="flex justify-center p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]">
              <TxStatusVisual {...props} />
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
      { key: 'default', label: 'Default (Pending)', props: {} },
      { key: 'processing', label: 'Processing', props: { isProcessing: true } },
      { key: 'success', label: 'Success', props: { isSucceed: true } },
      { key: 'failed', label: 'Failed', props: { isFailed: true } },
      { key: 'replaced', label: 'Replaced', props: { isReplaced: true } },
    ];

    const activeProps = states.find((state) => state.key === currentState)?.props || {};

    return (
      <div className="space-y-6 p-6 max-w-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--tuwa-text-primary)] mb-2">Transaction Status Demo</h2>
          <p className="text-[var(--tuwa-text-secondary)]">Click buttons to see different transaction states</p>
        </div>

        {/* Status Display */}
        <div className="flex justify-center p-8 bg-[var(--tuwa-bg-secondary)] rounded-xl border-2 border-[var(--tuwa-border-primary)]">
          <TxStatusVisual {...activeProps} />
        </div>

        {/* State Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {states.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrentState(key)}
              className={`cursor-pointer py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
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

// --- Transaction Flow Demo ---

export const TransactionFlow: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
      { label: 'Transaction Created', status: 'default', description: 'Waiting to be processed' },
      { label: 'Processing', status: 'processing', description: 'Transaction is being mined' },
      { label: 'Success', status: 'success', description: 'Transaction completed successfully' },
    ];

    const getStatusProps = (status: string) => {
      switch (status) {
        case 'processing':
          return { isProcessing: true };
        case 'success':
          return { isSucceed: true };
        case 'failed':
          return { isFailed: true };
        case 'replaced':
          return { isReplaced: true };
        default:
          return {};
      }
    };

    return (
      <div className="space-y-6 p-6 max-w-3xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Transaction Flow</h2>
          <p className="text-[var(--tuwa-text-secondary)]">Simulating transaction lifecycle</p>
        </div>

        {/* Current Status Display */}
        <div className="flex justify-center p-8 bg-[var(--tuwa-bg-secondary)] rounded-xl border-2 border-[var(--tuwa-border-primary)]">
          <div className="text-center space-y-4">
            <TxStatusVisual {...getStatusProps(steps[currentStep].status)} />
            <div>
              <h3 className="text-lg font-semibold text-[var(--tuwa-text-primary)]">{steps[currentStep].label}</h3>
              <p className="text-sm text-[var(--tuwa-text-secondary)]">{steps[currentStep].description}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-200 ${
                    index <= currentStep
                      ? 'bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)] border-[var(--tuwa-text-accent)] shadow-md'
                      : 'bg-[var(--tuwa-bg-secondary)] text-[var(--tuwa-text-secondary)] border-[var(--tuwa-border-primary)] hover:bg-[var(--tuwa-bg-muted)] hover:border-[var(--tuwa-text-accent)]'
                  }`}
                >
                  {index + 1}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-[var(--tuwa-text-accent)]' : 'bg-[var(--tuwa-border-secondary)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="cursor-pointer px-4 py-2 bg-[var(--tuwa-bg-secondary)] text-[var(--tuwa-text-primary)] border border-[var(--tuwa-border-primary)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--tuwa-bg-muted)] hover:border-[var(--tuwa-text-accent)] transition-all duration-200"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="cursor-pointer px-4 py-2 bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)] border border-[var(--tuwa-text-accent)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 shadow-md"
          >
            Next
          </button>
        </div>
      </div>
    );
  },
};

// --- Theme Comparison ---

export const ThemeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-center text-[var(--tuwa-text-primary)]">Light Theme</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Success', props: { isSucceed: true } },
            { label: 'Processing', props: { isProcessing: true } },
            { label: 'Failed', props: { isFailed: true } },
            { label: 'Default', props: {} },
          ].map(({ label, props }) => (
            <div key={label} className="text-center space-y-2">
              <div className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]">
                <TxStatusVisual {...props} />
              </div>
              <span className="text-xs text-[var(--tuwa-text-secondary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dark space-y-4 rounded-lg bg-[var(--tuwa-bg-primary)] p-4">
        <h3 className="text-lg font-bold text-center text-[var(--tuwa-text-primary)]">Dark Theme</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Success', props: { isSucceed: true } },
            { label: 'Processing', props: { isProcessing: true } },
            { label: 'Failed', props: { isFailed: true } },
            { label: 'Default', props: {} },
          ].map(({ label, props }) => (
            <div key={label} className="text-center space-y-2">
              <div className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]">
                <TxStatusVisual {...props} />
              </div>
              <span className="text-xs text-[var(--tuwa-text-secondary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// --- Custom Icons Demo ---

export const CustomIconsDemo: Story = {
  render: () => {
    const CustomTxStatusVisual = ({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) => (
      <div className="text-center space-y-2">
        <div className="flex justify-center py-4">
          <div className={`h-16 w-16 ${color}`}>{icon}</div>
        </div>
        <span className="text-xs text-[var(--tuwa-text-secondary)]">{label}</span>
      </div>
    );

    const customIcons = [
      {
        icon: <HeartIcon className="h-full w-full" />,
        label: 'Custom Success',
        color: 'text-pink-500',
      },
      {
        icon: <StarIcon className="h-full w-full animate-pulse" />,
        label: 'Custom Processing',
        color: 'text-yellow-500',
      },
      {
        icon: <SparklesIcon className="h-full w-full animate-bounce" />,
        label: 'Custom Special',
        color: 'text-purple-500',
      },
    ];

    return (
      <div className="space-y-6 p-6 max-w-4xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Custom Icons Inspiration</h2>
          <p className="text-[var(--tuwa-text-secondary)]">
            Examples of how you could customize the status visual with different icons
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customIcons.map((item) => (
            <div
              key={item.label}
              className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]"
            >
              <CustomTxStatusVisual {...item} />
            </div>
          ))}
        </div>

        <div className="text-center p-4 bg-[var(--tuwa-info-bg)] rounded-lg">
          <p className="text-sm text-[var(--tuwa-info-text)]">
            💡 These are just examples - the actual component uses fixed icons for consistency
          </p>
        </div>
      </div>
    );
  },
};
