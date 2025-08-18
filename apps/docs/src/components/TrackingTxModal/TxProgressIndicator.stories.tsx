import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentType, useState } from 'react';

import { defaultLabels } from '../../i18n/en';
import { LabelsProvider } from '../../providers';
import { deepMerge } from '../../utils';
import { StepProps, TxProgressIndicator } from './TxProgressIndicator';

// --- Mock Labels ---
const mockLabels = deepMerge(defaultLabels, {
  // @ts-expect-error: Missing labels
  trackingModal: {
    progressIndicator: {
      created: 'Created',
      processing: 'Processing',
      succeed: 'Success',
    },
  },
  // @ts-expect-error: Missing labels
  statuses: {
    failed: 'Failed',
    replaced: 'Replaced',
  },
});

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxProgressIndicator> = {
  title: 'UI Components/TrackingTxModal/TxProgressIndicator',
  component: TxProgressIndicator,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <LabelsProvider labels={mockLabels}>
        <Story />
      </LabelsProvider>
    ),
  ],
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
              <LabelsProvider labels={mockLabels}>
                <TxProgressIndicator {...props} />
              </LabelsProvider>
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
          <LabelsProvider labels={mockLabels}>
            <TxProgressIndicator {...activeProps} />
          </LabelsProvider>
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

// --- Transaction Flow Demo ---

export const TransactionFlow: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);

    const flowSteps = [
      {
        label: 'Transaction Created',
        description: 'Transaction initiated and waiting to be processed',
        props: {},
      },
      {
        label: 'Processing Started',
        description: 'Transaction submitted to the network and being processed',
        props: { isProcessing: true },
      },
      {
        label: 'Transaction Completed',
        description: 'Transaction successfully mined and confirmed',
        props: { isSucceed: true },
      },
    ];

    const alternativeFlows = [
      {
        label: 'Transaction Failed',
        description: 'Transaction was rejected or reverted',
        props: { isFailed: true },
      },
      {
        label: 'Transaction Replaced',
        description: 'Transaction was replaced with a higher gas fee',
        props: { isReplaced: true },
      },
    ];

    return (
      <div className="space-y-6 p-6 max-w-5xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Transaction Lifecycle Flow</h2>
          <p className="text-[var(--tuwa-text-secondary)]">Step through the transaction progress states</p>
        </div>

        {/* Main Flow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--tuwa-text-primary)]">Success Flow</h3>

          {/* Current Progress Display */}
          <div className="p-6 bg-[var(--tuwa-bg-secondary)] rounded-xl border-2 border-[var(--tuwa-border-primary)]">
            <div className="text-center mb-4">
              <h4 className="text-md font-medium text-[var(--tuwa-text-primary)]">{flowSteps[currentStep].label}</h4>
              <p className="text-sm text-[var(--tuwa-text-secondary)] mt-1">{flowSteps[currentStep].description}</p>
            </div>
            <LabelsProvider labels={mockLabels}>
              <TxProgressIndicator {...flowSteps[currentStep].props} />
            </LabelsProvider>
          </div>

          {/* Progress Controls */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {flowSteps.map((_, index) => (
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
                  {index < flowSteps.length - 1 && (
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

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="cursor-pointer px-4 py-2 bg-[var(--tuwa-bg-secondary)] text-[var(--tuwa-text-primary)] border border-[var(--tuwa-border-primary)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--tuwa-bg-muted)] hover:border-[var(--tuwa-text-accent)] transition-all duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(flowSteps.length - 1, currentStep + 1))}
              disabled={currentStep === flowSteps.length - 1}
              className="cursor-pointer px-4 py-2 bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)] border border-[var(--tuwa-text-accent)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 shadow-md"
            >
              Next
            </button>
          </div>
        </div>

        {/* Alternative Endings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--tuwa-text-primary)]">Alternative Endings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternativeFlows.map((flow) => (
              <div
                key={flow.label}
                className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]"
              >
                <div className="text-center mb-3">
                  <h4 className="text-sm font-medium text-[var(--tuwa-text-primary)]">{flow.label}</h4>
                  <p className="text-xs text-[var(--tuwa-text-secondary)] mt-1">{flow.description}</p>
                </div>
                <LabelsProvider labels={mockLabels}>
                  <TxProgressIndicator {...flow.props} />
                </LabelsProvider>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// --- Custom Step Component Demo ---

export const CustomStepComponent: Story = {
  render: () => {
    // Custom Step with enhanced styling
    const CustomStep: ComponentType<StepProps> = ({ status, label, isFirst = false }) => {
      const getIcon = () => {
        switch (status) {
          case 'completed':
            return <CheckIcon className="h-4 w-4 text-white" />;
          case 'error':
            return <ExclamationTriangleIcon className="h-4 w-4 text-white" />;
          case 'replaced':
            return <ArrowPathIcon className="h-4 w-4 text-white" />;
          case 'active':
            return <div className="h-3 w-3 animate-pulse rounded-full bg-white" />;
          default:
            return <div className="h-2 w-2 rounded-full bg-[var(--tuwa-text-tertiary)]" />;
        }
      };

      const getCircleStyles = () => {
        const base = 'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 shadow-lg';
        switch (status) {
          case 'completed':
            return `${base} bg-gradient-to-br from-green-400 to-green-600 border-green-300`;
          case 'error':
            return `${base} bg-gradient-to-br from-red-400 to-red-600 border-red-300`;
          case 'replaced':
            return `${base} bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300`;
          case 'active':
            return `${base} bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 animate-pulse`;
          default:
            return `${base} bg-[var(--tuwa-bg-muted)] border-[var(--tuwa-border-primary)]`;
        }
      };

      const getLineStyles = () => {
        const base = 'absolute right-1/2 top-[15px] h-1 w-full rounded-full';
        switch (status) {
          case 'completed':
            return `${base} bg-gradient-to-r from-green-400 to-green-600`;
          case 'error':
            return `${base} bg-gradient-to-r from-red-400 to-red-600`;
          case 'replaced':
            return `${base} bg-gradient-to-r from-blue-400 to-blue-600`;
          case 'active':
            return `${base} bg-gradient-to-r from-yellow-400 to-orange-500`;
          default:
            return `${base} bg-[var(--tuwa-border-secondary)]`;
        }
      };

      return (
        <div className="relative flex flex-1 flex-col items-center">
          {/* Enhanced connecting line */}
          {!isFirst && <div className={getLineStyles()} />}

          {/* Enhanced circle with gradient */}
          <div className={getCircleStyles()}>
            {getIcon()}
            {status === 'active' && (
              <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400 opacity-20" />
            )}
          </div>

          {/* Enhanced label */}
          <span
            className={`mt-3 text-center text-sm font-medium px-2 py-1 rounded-md ${
              status !== 'inactive'
                ? 'text-[var(--tuwa-text-primary)] bg-[var(--tuwa-bg-primary)] shadow-sm'
                : 'text-[var(--tuwa-text-secondary)]'
            }`}
          >
            {label}
          </span>

          {/* Status badge */}
          {status === 'active' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
          )}
        </div>
      );
    };

    const states = [
      { label: 'Default Style', props: {} },
      { label: 'Enhanced Style', props: { StepComponent: CustomStep } },
    ];

    return (
      <div className="space-y-8 p-6 max-w-4xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Custom Step Components</h2>
          <p className="text-[var(--tuwa-text-secondary)]">Comparison between default and custom styled steps</p>
        </div>

        {states.map(({ label, props }) => (
          <div key={label} className="space-y-3">
            <h3 className="text-lg font-semibold text-center text-[var(--tuwa-text-primary)]">{label}</h3>
            <div className="p-6 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]">
              <LabelsProvider labels={mockLabels}>
                <TxProgressIndicator isProcessing={true} {...props} />
              </LabelsProvider>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// --- Compact Layout ---

export const CompactLayout: Story = {
  render: () => (
    <div className="space-y-6 p-6 max-w-2xl">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Compact Layout</h2>
        <p className="text-[var(--tuwa-text-secondary)]">Progress indicator in smaller containers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Processing', props: { isProcessing: true } },
          { title: 'Success', props: { isSucceed: true } },
          { title: 'Failed', props: { isFailed: true } },
          { title: 'Replaced', props: { isReplaced: true } },
        ].map(({ title, props }) => (
          <div
            key={title}
            className="p-3 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]"
          >
            <h3 className="text-sm font-medium text-center text-[var(--tuwa-text-primary)] mb-2">{title}</h3>
            <LabelsProvider labels={mockLabels}>
              <TxProgressIndicator className="px-2" {...props} />
            </LabelsProvider>
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- Theme Comparison ---

export const ThemeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-center text-[var(--tuwa-text-primary)]">Light Theme</h3>
        <div className="space-y-4">
          {[
            { label: 'Processing', props: { isProcessing: true } },
            { label: 'Success', props: { isSucceed: true } },
            { label: 'Failed', props: { isFailed: true } },
          ].map(({ label, props }) => (
            <div
              key={label}
              className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]"
            >
              <div className="text-center mb-2">
                <span className="text-xs text-[var(--tuwa-text-secondary)]">{label}</span>
              </div>
              <LabelsProvider labels={mockLabels}>
                <TxProgressIndicator {...props} />
              </LabelsProvider>
            </div>
          ))}
        </div>
      </div>

      <div className="dark space-y-4 rounded-lg bg-[var(--tuwa-bg-primary)] p-4">
        <h3 className="text-lg font-bold text-center text-[var(--tuwa-text-primary)]">Dark Theme</h3>
        <div className="space-y-4">
          {[
            { label: 'Processing', props: { isProcessing: true } },
            { label: 'Success', props: { isSucceed: true } },
            { label: 'Failed', props: { isFailed: true } },
          ].map(({ label, props }) => (
            <div
              key={label}
              className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]"
            >
              <div className="text-center mb-2">
                <span className="text-xs text-[var(--tuwa-text-secondary)]">{label}</span>
              </div>
              <LabelsProvider labels={mockLabels}>
                <TxProgressIndicator {...props} />
              </LabelsProvider>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// --- Multilingual Labels Demo ---

export const MultilingualDemo: Story = {
  render: () => {
    const [currentLanguage, setCurrentLanguage] = useState('en');

    const languages = {
      en: {
        name: 'English',
        labels: {
          trackingModal: {
            progressIndicator: {
              created: 'Created',
              processing: 'Processing',
              succeed: 'Success',
            },
          },
          statuses: {
            failed: 'Failed',
            replaced: 'Replaced',
          },
        },
      },
      es: {
        name: 'Español',
        labels: {
          trackingModal: {
            progressIndicator: {
              created: 'Creado',
              processing: 'Procesando',
              succeed: 'Éxito',
            },
          },
          statuses: {
            failed: 'Fallido',
            replaced: 'Reemplazado',
          },
        },
      },
      fr: {
        name: 'Français',
        labels: {
          trackingModal: {
            progressIndicator: {
              created: 'Créé',
              processing: 'Traitement',
              succeed: 'Succès',
            },
          },
          statuses: {
            failed: 'Échec',
            replaced: 'Remplacé',
          },
        },
      },
    };

    return (
      <div className="space-y-6 p-6 max-w-4xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Multilingual Labels</h2>
          <p className="text-[var(--tuwa-text-secondary)]">Test the component with different languages</p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center gap-2">
          {Object.entries(languages).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setCurrentLanguage(key)}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 ${
                currentLanguage === key
                  ? 'bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)] border-[var(--tuwa-text-accent)] shadow-md'
                  : 'bg-[var(--tuwa-bg-secondary)] text-[var(--tuwa-text-secondary)] border-[var(--tuwa-border-primary)] hover:bg-[var(--tuwa-bg-muted)] hover:border-[var(--tuwa-text-accent)]'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Progress Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Processing', props: { isProcessing: true } },
            { label: 'Success', props: { isSucceed: true } },
          ].map(({ label, props }) => (
            <div
              key={label}
              className="p-4 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)]"
            >
              <h3 className="text-sm font-medium text-center text-[var(--tuwa-text-primary)] mb-3">{label}</h3>
              <LabelsProvider
                // @ts-expect-error: Missing labels
                labels={deepMerge(defaultLabels, languages[currentLanguage as keyof typeof languages].labels)}
              >
                <TxProgressIndicator {...props} />
              </LabelsProvider>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
