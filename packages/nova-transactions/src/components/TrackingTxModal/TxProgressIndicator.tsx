/**
 * @file This file contains the `TxProgressIndicator` component, a visual step-by-step progress bar for transactions.
 */

import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { ComponentType, useMemo } from 'react';

import { useLabels } from '../../providers';

// --- Sub-component: Step ---

export type StepStatus = 'active' | 'completed' | 'error' | 'inactive' | 'replaced';
export type StepProps = { status: StepStatus; label: string; isFirst?: boolean; isLast?: boolean };

/**
 * A configuration map for styling each step based on its status.
 * Defined outside the component to prevent re-creation.
 */
const STEP_STYLE_CONFIG: Record<StepStatus, { line: string; border: string; fill: string; pulse?: string }> = {
  completed: {
    line: 'bg-[var(--tuwa-success-icon)]',
    border: 'border-[var(--tuwa-success-icon)]',
    fill: 'bg-[var(--tuwa-success-icon)]',
  },
  error: {
    line: 'bg-[var(--tuwa-error-icon)]',
    border: 'border-[var(--tuwa-error-icon)]',
    fill: 'bg-[var(--tuwa-error-icon)]',
  },
  replaced: {
    line: 'bg-[var(--tuwa-info-icon)]',
    border: 'border-[var(--tuwa-info-icon)]',
    fill: 'bg-[var(--tuwa-info-icon)]',
  },
  active: {
    line: 'bg-[var(--tuwa-pending-icon)]',
    border: 'border-[var(--tuwa-pending-icon)]',
    fill: 'bg-transparent',
    pulse: 'bg-[var(--tuwa-pending-icon)]',
  },
  inactive: {
    line: 'bg-[var(--tuwa-border-primary)]',
    border: 'border-[var(--tuwa-border-primary)]',
    fill: 'bg-transparent',
  },
};

/**
 * Renders a single step in the progress indicator.
 */
function Step({ status, label, isFirst = false }: StepProps) {
  const styles = STEP_STYLE_CONFIG[status];

  const renderIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="h-3 w-3 text-white" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-3 w-3 text-white" />;
      case 'replaced':
        return <ArrowPathIcon className="h-3 w-3 text-white" />;
      case 'active':
        return <div className={cn('h-2 w-2 animate-pulse rounded-full', styles.pulse)} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex min-w-[80px] flex-1 flex-col items-center">
      {/* Connecting line */}
      {!isFirst && <div className={cn('absolute right-1/2 top-[10px] h-0.5 w-full', styles.line)} />}

      {/* Circle and Icon */}
      <div
        className={cn(
          'relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2',
          styles.border,
          styles.fill,
        )}
      >
        {renderIcon()}
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
  StepComponent?: ComponentType<StepProps>;
}

/**
 * A 3-step progress indicator that visually represents the lifecycle of a transaction.
 */
export function TxProgressIndicator({
  isProcessing,
  isSucceed,
  isFailed,
  isReplaced,
  className,
  StepComponent = Step,
}: TxProgressIndicatorProps) {
  const { trackingModal, statuses } = useLabels();

  // Memoize the steps array to avoid re-calculating on every render.
  const steps = useMemo((): StepProps[] => {
    const getStepStatus = (stepIndex: 1 | 2 | 3): StepStatus => {
      if (stepIndex === 1) return 'completed'; // "Created" is always complete
      if (stepIndex === 2) {
        // "Processing"
        if (isSucceed || isFailed || isReplaced) return 'completed';
        if (isProcessing) return 'active';
      }
      if (stepIndex === 3) {
        // "Final"
        if (isSucceed) return 'completed';
        if (isFailed) return 'error';
        if (isReplaced) return 'replaced';
        if (isProcessing) return 'active';
      }
      return 'inactive';
    };

    const getStepLabel = (stepIndex: 1 | 2 | 3): string => {
      if (stepIndex === 1) return trackingModal.progressIndicator.created;
      if (stepIndex === 2) return trackingModal.progressIndicator.processing;
      if (isFailed) return statuses.failed;
      if (isReplaced) return statuses.replaced;
      return trackingModal.progressIndicator.succeed;
    };

    return [
      { status: getStepStatus(1), label: getStepLabel(1), isFirst: true },
      { status: getStepStatus(2), label: getStepLabel(2) },
      { status: getStepStatus(3), label: getStepLabel(3), isLast: true },
    ];
  }, [isProcessing, isSucceed, isFailed, isReplaced, trackingModal, statuses]);

  return (
    <div className={cn('flex w-full items-start px-4 pt-2 pb-1', className)}>
      {steps.map((stepProps, index) => (
        <StepComponent key={index} {...stepProps} />
      ))}
    </div>
  );
}
