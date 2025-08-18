/**
 * @file This file contains the `TxProgressIndicator` component, a visual step-by-step progress bar for transactions.
 */

import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { ComponentType, JSX } from 'react';

import { useLabels } from '../../providers';

// --- Sub-component: Step ---

export type StepStatus = 'active' | 'completed' | 'error' | 'inactive' | 'replaced';
export type StepProps = { status: StepStatus; label: string; isFirst?: boolean; isLast?: boolean; className?: string };

/**
 * Renders a single step in the progress indicator.
 * This is an internal component but can be replaced via customization.
 */
function Step({ status, label, isFirst = false }: StepProps): JSX.Element {
  const state = {
    isCompleted: status === 'completed',
    isError: status === 'error',
    isReplaced: status === 'replaced',
    isActive: status === 'active',
  };

  const colorConfig = {
    line: cn({
      'bg-[var(--tuwa-success-icon)]': state.isCompleted,
      'bg-[var(--tuwa-error-icon)]': state.isError,
      'bg-[var(--tuwa-info-icon)]': state.isReplaced,
      'bg-[var(--tuwa-pending-icon)]': state.isActive,
      'bg-[var(--tuwa-border-primary)]': status === 'inactive',
    }),
    border: cn({
      'border-[var(--tuwa-success-icon)]': state.isCompleted,
      'border-[var(--tuwa-error-icon)]': state.isError,
      'border-[var(--tuwa-info-icon)]': state.isReplaced,
      'border-[var(--tuwa-pending-icon)]': state.isActive,
      'border-[var(--tuwa-border-primary)]': status === 'inactive',
    }),
    fill: cn({
      'bg-[var(--tuwa-success-icon)]': state.isCompleted,
      'bg-[var(--tuwa-error-icon)]': state.isError,
      'bg-[var(--tuwa-info-icon)]': state.isReplaced,
    }),
    pulse: cn({ 'bg-[var(--tuwa-pending-icon)]': state.isActive }),
  };

  return (
    <div className="relative flex flex-1 flex-col items-center min-w-[80px]">
      {/* Connecting line */}
      {!isFirst && <div className={cn('absolute right-1/2 top-[10px] h-0.5 w-full', colorConfig.line)} />}

      {/* Circle and Icon */}
      <div
        className={cn(
          'relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2',
          colorConfig.border,
          colorConfig.fill,
        )}
      >
        {state.isCompleted && <CheckIcon className="h-3 w-3 text-white" />}
        {state.isError && <ExclamationTriangleIcon className="h-3 w-3 text-white" />}
        {state.isReplaced && <ArrowPathIcon className="h-3 w-3 text-white" />}
        {state.isActive && <div className={cn('h-2 w-2 animate-pulse rounded-full', colorConfig.pulse)} />}
      </div>

      {/* Label */}
      <span
        className={cn(
          'mt-2 text-center text-xs',
          status !== 'inactive' ? 'font-semibold text-[var(--tuwa-text-primary)]' : 'text-[var(--tuwa-text-secondary)]',
        )}
      >
        {label}
      </span>
    </div>
  );
}

// --- Main Component: TxProgressIndicator ---

export interface TxProgressIndicatorProps {
  isProcessing?: boolean;
  isSucceed?: boolean;
  isFailed?: boolean;
  isReplaced?: boolean;
  className?: string;
  /** A custom component to use instead of the default `Step`. */
  StepComponent?: ComponentType<StepProps>;
}

/**
 * A 3-step progress indicator that visually represents the lifecycle of a transaction.
 *
 * @param {TxProgressIndicatorProps} props - The component props.
 * @returns {JSX.Element} The rendered progress indicator.
 */
export function TxProgressIndicator({
  isProcessing,
  isSucceed,
  isFailed,
  isReplaced,
  className,
  StepComponent = Step,
}: TxProgressIndicatorProps): JSX.Element {
  const labels = useLabels();

  // This logic determines the status of each of the three steps.
  const getStepStatus = (stepIndex: 1 | 2 | 3): StepStatus => {
    // Step 1: "Created" - Always completed once the process starts.
    if (stepIndex === 1) return 'completed';

    // Step 2: "Processing"
    if (stepIndex === 2) {
      if (isSucceed || isFailed || isReplaced) return 'completed';
      if (isProcessing) return 'active';
    }

    // Step 3: "Final"
    if (stepIndex === 3) {
      if (isSucceed) return 'completed';
      if (isFailed) return 'error';
      if (isReplaced) return 'replaced';
      if (isProcessing) return 'active';
    }

    return 'inactive';
  };

  const getStepLabel = (stepIndex: 1 | 2 | 3): string => {
    if (stepIndex === 1) return labels.trackingModal.progressIndicator.created;
    if (stepIndex === 2) return labels.trackingModal.progressIndicator.processing;
    // For step 3, the label changes based on the final status.
    if (isFailed) return labels.statuses.failed;
    if (isReplaced) return labels.statuses.replaced;
    return labels.trackingModal.progressIndicator.succeed;
  };

  const steps: StepProps[] = [
    { status: getStepStatus(1), label: getStepLabel(1), isFirst: true },
    { status: getStepStatus(2), label: getStepLabel(2) },
    { status: getStepStatus(3), label: getStepLabel(3), isLast: true },
  ];

  return (
    <div className={cn('flex w-full items-start px-4 pt-2 pb-1', className)}>
      {steps.map((stepProps, index) => (
        <StepComponent key={index} {...stepProps} />
      ))}
    </div>
  );
}
