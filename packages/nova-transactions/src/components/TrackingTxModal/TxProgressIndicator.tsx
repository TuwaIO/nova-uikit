/**
 * @file This file contains the `TxProgressIndicator` component, a visual step-by-step progress bar for transactions.
 */

import { cn, DrawnCheck, DrawnCross, MorphIcon, MorphText, NovaSetIcon, useNovaIcons } from '@tuwaio/nova-core';
import { motion, useReducedMotion } from 'framer-motion';
import { ComponentType, CSSProperties } from 'react';

import { useLabels } from '../../providers/NovaTransactionsLabelsProvider';
import { PIXEL_RING } from './pixelRing';

/** State of a step of {@link TxProgressIndicator}, which sets its colors and icon. */
export type StepStatus = 'active' | 'completed' | 'error' | 'inactive' | 'replaced';

/** ClassNames for step styling overrides */
export type StepClassNames = {
  /** Classes for the step container */
  container?: string;
  /** Classes for the connecting line */
  line?: string;
  /** Classes for the mark of the step (the key keeps its old name: the mark is square now, `--tuwa-rounded-full`) */
  circle?: string;
  /** Classes for the label text */
  label?: string;
  /** Status-specific overrides */
  statusOverrides?: Partial<Record<StepStatus, { line?: string; circle?: string; label?: string }>>;
};

/** Props of a step of {@link TxProgressIndicator} (`StepComponent`). */
export type StepProps = {
  /** State of the step. */
  status: StepStatus;
  /** Label under the step. */
  label: string;
  /** Whether it is the first step; the default step draws no line before it. */
  isFirst?: boolean;
  /** Whether it is the last step (not used by the default step). */
  isLast?: boolean;
  /** Class names of the step (`stepClassNames` of the indicator). */
  classNames?: StepClassNames;
};

const STEP_STYLE_CONFIG: Record<StepStatus, { line: string; circle: string }> = {
  completed: {
    line: 'novatx:bg-[var(--tuwa-success-icon)]',
    circle: 'novatx:bg-[var(--tuwa-success-icon)]',
  },
  error: {
    line: 'novatx:bg-[var(--tuwa-error-icon)]',
    circle: 'novatx:bg-[var(--tuwa-error-icon)]',
  },
  replaced: {
    line: 'novatx:bg-[var(--tuwa-info-icon)]',
    circle: 'novatx:bg-[var(--tuwa-info-icon)]',
  },
  // The line behind the mark stops at its edge
  active: {
    line: 'novatx:bg-[var(--tuwa-pending-icon)]',
    circle: 'novatx:bg-[var(--tuwa-bg-primary)]',
  },
  inactive: {
    line: 'novatx:bg-[var(--tuwa-border-primary)]',
    circle: 'novatx:bg-[var(--tuwa-bg-primary)] novatx:border-[1.5px] novatx:border-[var(--tuwa-border-primary)]',
  },
};

/**
 * The step being waited for, in the pixel look: a lit run steps round a square frame of pixels, around a dot that
 * breathes.
 *
 * @internal
 * @returns The spinner.
 */
export function PixelActiveMark() {
  return (
    <svg
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="novatx:block novatx:h-5 novatx:w-5 novatx:text-[var(--tuwa-pending-icon)]"
    >
      {PIXEL_RING.map(({ x, y }, index) => (
        <rect
          key={`${x}-${y}`}
          className={cn('tuwa-tx-px-ring', index < PIXEL_RING.length / 4 && 'tuwa-tx-px-park')}
          x={x}
          y={y}
          width={1}
          height={1}
          style={{ '--i': index, '--n': PIXEL_RING.length } as CSSProperties}
        />
      ))}
      <rect className="tuwa-tx-px-dot" x={4} y={4} width={2} height={2} />
    </svg>
  );
}

/** The step being waited for: an arc runs around a dot that breathes, and a halo goes out from it. */
function ActiveMark() {
  const reduceMotion = useReducedMotion();
  const { look } = useNovaIcons();
  if (look === 'pixel') return <PixelActiveMark />;
  return (
    <span className="novatx:relative novatx:block novatx:h-5 novatx:w-5 novatx:text-[var(--tuwa-pending-icon)]">
      {!reduceMotion && (
        <motion.span
          className="novatx:absolute novatx:inset-0 novatx:rounded-[var(--tuwa-rounded-full)] novatx:bg-current"
          animate={{ scale: [0.8, 1.7], opacity: [0.3, 0] }}
          transition={{ duration: 1.6, ease: 'easeOut', repeat: Infinity }}
        />
      )}
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="novatx:absolute novatx:inset-0 novatx:h-5 novatx:w-5 novatx:animate-spin novatx:motion-reduce:animate-none novatx:[animation-duration:1.4s]"
      >
        <circle cx={10} cy={10} r={8.75} stroke="currentColor" strokeOpacity={0.22} strokeWidth={2} />
        <circle
          cx={10}
          cy={10}
          r={8.75}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="14 41"
        />
      </svg>
      <motion.span
        className="novatx:absolute novatx:inset-[6.5px] novatx:rounded-[var(--tuwa-rounded-full)] novatx:bg-current"
        animate={reduceMotion ? undefined : { scale: [1, 0.72, 1] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
      />
    </span>
  );
}

/** The mark inside the square of a step: ink on the color of the step, which reads on its green, red and grey alike. */
function StepMark({ status }: { status: StepStatus }) {
  switch (status) {
    case 'completed':
      return <DrawnCheck className="novatx:h-3.5 novatx:w-3.5 novatx:text-[#101014]" />;
    case 'error':
      return <DrawnCross className="novatx:h-3.5 novatx:w-3.5 novatx:text-[#101014]" />;
    case 'replaced':
      return <NovaSetIcon solid="ArrowPathIcon" className="novatx:h-3 novatx:w-3 novatx:text-[#101014]" />;
    case 'active':
      return <ActiveMark />;
    default:
      return (
        <span className="novatx:block novatx:h-1 novatx:w-1 novatx:rounded-[var(--tuwa-rounded-full)] novatx:bg-[var(--tuwa-border-primary)]" />
      );
  }
}

/** The line that leads to a step: it fills up in the color of a result. */
function StepLine({ status, className }: { status: StepStatus; className?: string }) {
  const reduceMotion = useReducedMotion();
  const isResult = status === 'completed' || status === 'error' || status === 'replaced';
  const isWaiting = status === 'active';

  return (
    <div
      className={cn(
        'novatx:absolute novatx:right-1/2 novatx:top-[9px] novatx:h-0.5 novatx:w-full novatx:overflow-hidden novatx:bg-[var(--tuwa-border-primary)]',
        !isResult && !isWaiting && className,
      )}
    >
      <motion.div
        className={cn(
          'novatx:h-full novatx:w-full novatx:origin-left novatx:transition-colors novatx:duration-300',
          STEP_STYLE_CONFIG[status].line,
          (isResult || isWaiting) && className,
        )}
        initial={reduceMotion ? false : { scaleX: 0 }}
        // Without motion no glint can say that the wait goes on, so the line itself says it
        animate={{ scaleX: isResult || (isWaiting && reduceMotion) ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.2, 0, 0, 1] }}
      />
    </div>
  );
}

/**
 * One glint for the whole wait: it runs from the last step passed to the end of the line, behind the circles, and not a glint of
 * its own on each line.
 *
 * @param props - Where it starts.
 * @param props.fromConfirmed - Whether the processing step is passed already.
 * @returns The glint, or nothing with `prefers-reduced-motion`.
 */
function WaitGlint({ fromConfirmed }: { fromConfirmed: boolean }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      // The centers of the first and the middle of three equal columns, and of the last one
      className={cn(
        'novatx:pointer-events-none novatx:absolute novatx:right-[16.667%] novatx:top-[9px] novatx:h-0.5 novatx:overflow-hidden',
        fromConfirmed ? 'novatx:left-1/2' : 'novatx:left-[16.667%]',
      )}
    >
      <motion.div
        className={cn('novatx:h-full novatx:w-1/3', STEP_STYLE_CONFIG.active.line)}
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: fromConfirmed ? 1.2 : 1.8, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  );
}

function Step({ status, label, isFirst = false, classNames }: StepProps) {
  const styles = STEP_STYLE_CONFIG[status];
  const statusOverride = classNames?.statusOverrides?.[status];

  return (
    <div
      className={cn(
        'novatx:relative novatx:flex novatx:min-w-[80px] novatx:flex-1 novatx:flex-col novatx:items-center',
        classNames?.container,
      )}
    >
      {!isFirst && <StepLine status={status} className={cn(classNames?.line, statusOverride?.line)} />}

      <div
        className={cn(
          'novatx:relative novatx:z-10 novatx:flex novatx:h-5 novatx:w-5 novatx:items-center novatx:justify-center novatx:rounded-[var(--tuwa-rounded-full)] novatx:transition-colors novatx:duration-300',
          styles.circle,
          classNames?.circle,
          statusOverride?.circle,
        )}
      >
        <MorphIcon iconKey={status} animateFirst={status !== 'inactive'}>
          <StepMark status={status} />
        </MorphIcon>
      </div>

      <span
        className={cn(
          'novatx:mt-2 novatx:text-center novatx:text-xs novatx:font-mono',
          status !== 'inactive'
            ? 'novatx:font-semibold novatx:text-[var(--tuwa-text-primary)]'
            : 'novatx:text-[var(--tuwa-text-secondary)]',
          classNames?.label,
          statusOverride?.label,
        )}
      >
        <MorphText>{label}</MorphText>
      </span>
    </div>
  );
}

/** Props of {@link TxProgressIndicator}. */
export interface TxProgressIndicatorProps {
  /** Whether the transaction is being submitted or is pending. */
  isProcessing?: boolean;
  /**
   * Whether the transaction reached the `confirmed` commitment (Solana `confirmationStatus` `confirmed` or
   * `finalized`): the processing step is completed and labeled as confirmed while the last step waits for the result.
   */
  isConfirmed?: boolean;
  /** Whether the transaction succeeded. */
  isSucceed?: boolean;
  /** Whether the submission or the transaction failed. */
  isFailed?: boolean;
  /** Whether the transaction was replaced by something else than a speed-up, whose record the modal goes on with. */
  isReplaced?: boolean;
  /** Whether that replacement was a cancel: the last step then says so. */
  isCancelled?: boolean;
  /** Classes of the indicator. */
  className?: string;
  /** Component that renders each step. */
  StepComponent?: ComponentType<StepProps>;
  /** ClassNames for step customization */
  stepClassNames?: StepClassNames;
}

/**
 * Three steps of the transaction lifecycle, used by the tracking modal: "created" (always completed), "processing"
 * (active while processing, completed after, and labeled "confirmed" once the transaction is confirmed) and a final
 * step that shows success, failure or replacement, active once the transaction is confirmed. One step is waited for at a
 * time: an arc runs around it, and one glint runs along the line from the last step passed to the end.
 *
 * @param props - See {@link TxProgressIndicatorProps}.
 * @returns The indicator.
 */
export function TxProgressIndicator({
  isProcessing,
  isConfirmed,
  isSucceed,
  isFailed,
  isReplaced,
  isCancelled,
  className,
  StepComponent = Step,
  stepClassNames,
}: TxProgressIndicatorProps) {
  const { trackingModal, statuses } = useLabels();

  const getStepStatus = (stepIndex: 1 | 2 | 3): StepStatus => {
    if (stepIndex === 1) return 'completed';
    if (stepIndex === 2) {
      if (isSucceed || isFailed || isReplaced || isConfirmed) return 'completed';
      if (isProcessing) return 'active';
    }
    if (stepIndex === 3) {
      if (isSucceed) return 'completed';
      if (isFailed) return 'error';
      if (isReplaced) return 'replaced';
      // One step is being waited for at a time: the last one once the processing step is passed
      if (isProcessing && isConfirmed) return 'active';
    }
    return 'inactive';
  };

  const getStepLabel = (stepIndex: 1 | 2 | 3): string => {
    if (stepIndex === 1) return trackingModal.progressIndicator.created;
    if (stepIndex === 2) return isConfirmed ? statuses.confirmed : trackingModal.progressIndicator.processing;
    if (isFailed) return statuses.failed;
    if (isCancelled) return statuses.cancelled;
    if (isReplaced) return statuses.replaced;
    return trackingModal.progressIndicator.succeed;
  };

  const steps: StepProps[] = [
    { status: getStepStatus(1), label: getStepLabel(1), isFirst: true, classNames: stepClassNames },
    { status: getStepStatus(2), label: getStepLabel(2), classNames: stepClassNames },
    { status: getStepStatus(3), label: getStepLabel(3), isLast: true, classNames: stepClassNames },
  ];

  return (
    <div className={cn('novatx:w-full novatx:px-4 novatx:pt-2 novatx:pb-1', className)}>
      <div className="novatx:relative novatx:flex novatx:w-full novatx:items-start">
        {steps.map((stepProps, index) => (
          <StepComponent key={index} {...stepProps} />
        ))}
        {isProcessing && StepComponent === Step && <WaitGlint fromConfirmed={!!isConfirmed} />}
      </div>
    </div>
  );
}
