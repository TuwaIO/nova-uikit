/**
 * @file This file contains the `TxStatusVisual` component, which displays a large icon representing the transaction's
 * status.
 */

import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cn, MorphIcon, QuasarLoader } from '@tuwaio/nova-core';
import { ComponentType } from 'react';

/**
 * State shown by {@link TxStatusVisual}: the first that applies of succeed, failed, replaced and processing, else
 * initializing.
 */
export type TxStatusVisualStatusKey = 'succeed' | 'failed' | 'replaced' | 'processing' | 'initializing';

/** Class names of the icon of {@link TxStatusVisual}. */
export type TxStatusVisualClassNames = {
  /** Base icon className applied to all statuses */
  icon?: string;
  /** Status-specific icon overrides */
  statusOverrides?: Partial<Record<TxStatusVisualStatusKey, string>>;
};

/** Props of {@link TxStatusVisual}. */
export type TxStatusVisualProps = {
  /** True if the transaction is currently being processed (e.g., in the mempool). */
  isProcessing?: boolean;
  /** True if the transaction has successfully completed. */
  isSucceed?: boolean;
  /** True if the transaction has failed or was reverted. */
  isFailed?: boolean;
  /** True if the transaction was replaced by something else than a speed-up, whose record the modal goes on with. */
  isReplaced?: boolean;
  /** Additional class names for the container */
  className?: string;
  /** ClassNames for icon styling */
  iconClassNames?: TxStatusVisualClassNames;
};

const RESULT_ICONS: Record<
  Exclude<TxStatusVisualStatusKey, 'processing' | 'initializing'>,
  { Icon: ComponentType<{ className?: string }>; className: string }
> = {
  succeed: {
    Icon: CheckCircleIcon,
    className: 'novatx:text-[var(--tuwa-success-icon)]',
  },
  failed: {
    Icon: ExclamationCircleIcon,
    className: 'novatx:text-[var(--tuwa-error-icon)]',
  },
  replaced: {
    Icon: ArrowPathIcon,
    className: 'novatx:text-[var(--tuwa-info-icon)]',
  },
};

/**
 * The large visual of the state of a transaction in the tracking modal: the Quasar loader in the pending color while it is
 * being submitted and processed, which then gives way to the icon of the result.
 *
 * @param props - See {@link TxStatusVisualProps}.
 * @returns The visual in its container.
 */
export function TxStatusVisual({
  isProcessing,
  isSucceed,
  isFailed,
  isReplaced,
  className: containerClassName,
  iconClassNames,
}: TxStatusVisualProps) {
  const statusKey: TxStatusVisualStatusKey =
    (isSucceed && 'succeed') ||
    (isFailed && 'failed') ||
    (isReplaced && 'replaced') ||
    (isProcessing && 'processing') ||
    'initializing';

  const statusOverride = iconClassNames?.statusOverrides?.[statusKey];
  const isWaiting = statusKey === 'processing' || statusKey === 'initializing';
  const result = isWaiting ? null : RESULT_ICONS[statusKey as keyof typeof RESULT_ICONS];

  return (
    <div className={cn('novatx:flex novatx:justify-center novatx:py-4', containerClassName)}>
      {/* The same key for both waits: the loader must not restart when the wallet signs */}
      <MorphIcon iconKey={isWaiting ? 'waiting' : statusKey}>
        {result ? (
          <result.Icon
            className={cn('novatx:h-16 novatx:w-16', result.className, iconClassNames?.icon, statusOverride)}
          />
        ) : (
          <QuasarLoader
            size={64}
            accent="var(--tuwa-pending-icon)"
            className={cn('novatx:text-[var(--tuwa-text-primary)]', iconClassNames?.icon, statusOverride)}
          />
        )}
      </MorphIcon>
    </div>
  );
}
