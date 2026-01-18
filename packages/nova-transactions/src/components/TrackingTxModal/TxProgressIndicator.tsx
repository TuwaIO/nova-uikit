/**
 * @file This file contains the `TxProgressIndicator` component, a visual step-by-step progress bar for transactions.
 */

import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { ComponentType, useMemo } from 'react';

import { useLabels } from '../../providers';

export type StepStatus = 'active' | 'completed' | 'error' | 'inactive' | 'replaced';

/** ClassNames for step styling overrides */
export type StepClassNames = {
  /** Classes for the step container */
  container?: string;
  /** Classes for the connecting line */
  line?: string;
  /** Classes for the circle element */
  circle?: string;
  /** Classes for the label text */
  label?: string;
  /** Status-specific overrides */
  statusOverrides?: Partial<Record<StepStatus, { line?: string; circle?: string; label?: string }>>;
};

export type StepProps = {
  status: StepStatus;
  label: string;
  isFirst?: boolean;
  isLast?: boolean;
  classNames?: StepClassNames;
};

const STEP_STYLE_CONFIG: Record<StepStatus, { line: string; border: string; fill: string; pulse?: string }> = {
  completed: {
    line: 'novatx:bg-[var(--tuwa-success-icon)]',
    border: 'novatx:border-[var(--tuwa-success-icon)]',
    fill: 'novatx:bg-[var(--tuwa-success-icon)]',
  },
  error: {
    line: 'novatx:bg-[var(--tuwa-error-icon)]',
    border: 'novatx:border-[var(--tuwa-error-icon)]',
    fill: 'novatx:bg-[var(--tuwa-error-icon)]',
  },
  replaced: {
    line: 'novatx:bg-[var(--tuwa-info-icon)]',
    border: 'novatx:border-[var(--tuwa-info-icon)]',
    fill: 'novatx:bg-[var(--tuwa-info-icon)]',
  },
  active: {
    line: 'novatx:bg-[var(--tuwa-pending-icon)]',
    border: 'novatx:border-[var(--tuwa-pending-icon)]',
    fill: 'novatx:bg-transparent',
    pulse: 'novatx:bg-[var(--tuwa-pending-icon)]',
  },
  inactive: {
    line: 'novatx:bg-[var(--tuwa-border-primary)]',
    border: 'novatx:border-[var(--tuwa-border-primary)]',
    fill: 'novatx:bg-transparent',
  },
};

function Step({ status, label, isFirst = false, classNames }: StepProps) {
  const styles = STEP_STYLE_CONFIG[status];
  const statusOverride = classNames?.statusOverrides?.[status];

  const renderIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="novatx:h-3 novatx:w-3 novatx:text-white" />;
      case 'error':
        return <ExclamationTriangleIcon className="novatx:h-3 novatx:w-3 novatx:text-white" />;
      case 'replaced':
        return <ArrowPathIcon className="novatx:h-3 novatx:w-3 novatx:text-white" />;
      case 'active':
        return <div className={cn('novatx:h-2 novatx:w-2 novatx:animate-pulse novatx:rounded-full', styles.pulse)} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'novatx:relative novatx:flex novatx:min-w-[80px] novatx:flex-1 novatx:flex-col novatx:items-center',
        classNames?.container,
      )}
    >
      {!isFirst && (
        <div
          className={cn(
            'novatx:absolute novatx:right-1/2 novatx:top-[10px] novatx:h-0.5 novatx:w-full',
            styles.line,
            classNames?.line,
            statusOverride?.line,
          )}
        />
      )}

      <div
        className={cn(
          'novatx:relative novatx:z-10 novatx:flex novatx:h-5 novatx:w-5 novatx:items-center novatx:justify-center novatx:rounded-full novatx:border-2',
          styles.border,
          styles.fill,
          classNames?.circle,
          statusOverride?.circle,
        )}
      >
        {renderIcon()}
      </div>

      <span
        className={cn(
          'novatx:mt-2 novatx:text-center novatx:text-xs',
          status !== 'inactive'
            ? 'novatx:font-semibold novatx:text-[var(--tuwa-text-primary)]'
            : 'novatx:text-[var(--tuwa-text-secondary)]',
          classNames?.label,
          statusOverride?.label,
        )}
      >
        {label}
      </span>
    </div>
  );
}

export interface TxProgressIndicatorProps {
  isProcessing?: boolean;
  isSucceed?: boolean;
  isFailed?: boolean;
  isReplaced?: boolean;
  className?: string;
  StepComponent?: ComponentType<StepProps>;
  /** ClassNames for step customization */
  stepClassNames?: StepClassNames;
}

export function TxProgressIndicator({
  isProcessing,
  isSucceed,
  isFailed,
  isReplaced,
  className,
  StepComponent = Step,
  stepClassNames,
}: TxProgressIndicatorProps) {
  const { trackingModal, statuses } = useLabels();

  const steps = useMemo((): StepProps[] => {
    const getStepStatus = (stepIndex: 1 | 2 | 3): StepStatus => {
      if (stepIndex === 1) return 'completed';
      if (stepIndex === 2) {
        if (isSucceed || isFailed || isReplaced) return 'completed';
        if (isProcessing) return 'active';
      }
      if (stepIndex === 3) {
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
      { status: getStepStatus(1), label: getStepLabel(1), isFirst: true, classNames: stepClassNames },
      { status: getStepStatus(2), label: getStepLabel(2), classNames: stepClassNames },
      { status: getStepStatus(3), label: getStepLabel(3), isLast: true, classNames: stepClassNames },
    ];
  }, [isProcessing, isSucceed, isFailed, isReplaced, trackingModal, statuses, stepClassNames]);

  return (
    <div className={cn('novatx:flex novatx:w-full novatx:items-start novatx:px-4 novatx:pt-2 novatx:pb-1', className)}>
      {steps.map((stepProps, index) => (
        <StepComponent key={index} {...stepProps} />
      ))}
    </div>
  );
}
