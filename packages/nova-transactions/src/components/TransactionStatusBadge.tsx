/**
 * @file This file contains the `TransactionStatusBadge` component for visually displaying a transaction's status.
 */

import { cn, DrawnCheck, DrawnCross, MorphIcon, MorphText, NovaSetIcon, QuasarLoader } from '@tuwaio/nova-core';
import { Transaction, TransactionStatus } from '@tuwaio/pulsar-core';

import { useLabels } from '../providers/NovaTransactionsLabelsProvider';
import { statusLabelOf } from '../utils/txStatus';

/** The icon of a replaced transaction, from the icon set of `NovaIconsProvider`. */
const ReplacedIcon = ({ className }: { className?: string }) => (
  <NovaSetIcon solid="ArrowPathIcon" className={className} />
);

const SuccessIcon = ({ className }: { className?: string }) => <DrawnCheck variant="disc" className={className} />;
const FailedIcon = ({ className }: { className?: string }) => <DrawnCross variant="disc" className={className} />;

const VISUALS = {
  pending: {
    Icon: null,
    color: 'novatx:text-[var(--tuwa-pending-text)]',
    background: 'novatx:bg-[var(--tuwa-pending-bg)]',
    iconColor: 'novatx:text-[var(--tuwa-pending-icon)]',
  },
  confirmed: {
    Icon: SuccessIcon,
    color: 'novatx:text-[var(--tuwa-success-text)]',
    background: 'novatx:bg-[var(--tuwa-success-bg)]',
    iconColor: 'novatx:text-[var(--tuwa-success-icon)]',
  },
  [TransactionStatus.Success]: {
    Icon: SuccessIcon,
    color: 'novatx:text-[var(--tuwa-success-text)]',
    background: 'novatx:bg-[var(--tuwa-success-bg)]',
    iconColor: 'novatx:text-[var(--tuwa-success-icon)]',
  },
  [TransactionStatus.Failed]: {
    Icon: FailedIcon,
    color: 'novatx:text-[var(--tuwa-error-text)]',
    background: 'novatx:bg-[var(--tuwa-error-bg)]',
    iconColor: 'novatx:text-[var(--tuwa-error-icon)]',
  },
  [TransactionStatus.Replaced]: {
    Icon: ReplacedIcon,
    color: 'novatx:text-[var(--tuwa-info-text)]',
    background: 'novatx:bg-[var(--tuwa-info-bg)]',
    iconColor: 'novatx:text-[var(--tuwa-info-icon)]',
  },
} as const;

/**
 * Props of {@link TransactionStatusBadge}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionStatusBadgeProps<T extends Transaction> = {
  /** The transaction whose status is shown. */
  tx: T;
  /** `badge` is a colored pill. `plain` is the icon and label alone, for the status line of a card. Defaults to `badge`. */
  variant?: 'badge' | 'plain';
  /** Classes of the badge. */
  className?: string;
  /** Granular class names for sub-elements */
  classNames?: {
    /** Classes for the badge container */
    container?: string;
    /** Classes for the status icon */
    icon?: string;
    /** Classes for the label text */
    label?: string;
  };
};

/**
 * The icon and the label of the transaction status, colored by it: pending (while `tx.pending`, with the Quasar loader in
 * the pending color), confirmed (still pending, but with `confirmationStatus: 'confirmed'`, as the Solana tracker of Pulsar
 * sets it about a second after sending), success, failed, sped up, cancelled or replaced, or a neutral badge when the status
 * is not set. A change of status morphs the label and swaps the icon.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link TransactionStatusBadgeProps}.
 * @returns The badge.
 */
export function TransactionStatusBadge<T extends Transaction>({
  tx,
  variant = 'badge',
  className,
  classNames,
}: TransactionStatusBadgeProps<T>) {
  const { statuses } = useLabels();

  const isPlain = variant === 'plain';
  const baseClasses = cn(
    'novatx:inline-flex novatx:items-center novatx:gap-x-1.5 novatx:text-xs novatx:font-mono novatx:font-medium novatx:transition-colors novatx:duration-300',
    !isPlain && 'novatx:rounded-[var(--tuwa-rounded-corners)] novatx:px-2 novatx:py-1',
  );

  const isConfirmed =
    'confirmationStatus' in tx && (tx.confirmationStatus === 'confirmed' || tx.confirmationStatus === 'finalized');
  const visualKey = tx.pending ? (isConfirmed ? 'confirmed' : 'pending') : tx.status;
  const visual = visualKey ? VISUALS[visualKey as keyof typeof VISUALS] : null;
  const label = statusLabelOf(tx, statuses);

  if (!visual) {
    return (
      <div
        className={cn(
          baseClasses,
          'novatx:text-[var(--tuwa-info-text)]',
          !isPlain && 'novatx:bg-[var(--tuwa-info-bg)]',
          classNames?.container,
          className,
        )}
      >
        <span className={classNames?.label}>{label}</span>
      </div>
    );
  }

  const { Icon, color, background, iconColor } = visual;

  return (
    <div className={cn(baseClasses, color, !isPlain && background, classNames?.container, className)}>
      {/* A row of a list is simply shown when the list opens: old results must not all draw at once */}
      <MorphIcon iconKey={visualKey as string} animateFirst={isPlain}>
        {Icon ? (
          <Icon className={cn('novatx:h-4 novatx:w-4', iconColor, classNames?.icon)} />
        ) : (
          <QuasarLoader size={16} accent="var(--tuwa-pending-icon)" className={cn(iconColor, classNames?.icon)} />
        )}
      </MorphIcon>
      <span className={classNames?.label}>
        <MorphText>{label}</MorphText>
      </span>
    </div>
  );
}
