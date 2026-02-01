/**
 * @file BalanceDisplay component with comprehensive customization options.
 * Exported for use in ConnectedModal and external applications for displaying token balances.
 */

import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import React, { ComponentPropsWithoutRef, ComponentType, useCallback, useEffect, useRef, useState } from 'react';

// --- Animation Variants ---
const DEFAULT_LOADING_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// --- Types ---

/**
 * Balance data structure
 */
export type BalanceData = {
  /** Balance value (formatted string) */
  value: string;
  /** Token symbol (e.g., ETH, USDC) */
  symbol: string;
  /** Optional icon URL or ReactNode */
  icon?: string | React.ReactNode;
};

/**
 * Labels for accessibility
 */
export type BalanceDisplayLabels = {
  loading?: string;
  walletBalance?: string;
  refreshBalance?: string;
  noBalanceAvailable?: string;
};

const DEFAULT_LABELS: Required<BalanceDisplayLabels> = {
  loading: 'Loading',
  walletBalance: 'Balance',
  refreshBalance: 'Refresh balance',
  noBalanceAvailable: 'No balance information available',
};

/**
 * Props for RefreshButton sub-component
 */
export type RefreshButtonProps = {
  isLoading: boolean;
  showSuccess: boolean;
  onRefetch: () => void;
  labels: Required<BalanceDisplayLabels>;
  className?: string;
};

/**
 * Props for LoadingState sub-component
 */
export type LoadingStateProps = {
  labels: Required<BalanceDisplayLabels>;
  className?: string;
};

/**
 * Props for BalanceValue sub-component
 */
export type BalanceValueProps = {
  balance: BalanceData;
  labels: Required<BalanceDisplayLabels>;
  className?: string;
};

/**
 * Props for EmptyState sub-component
 */
export type EmptyStateProps = {
  labels: Required<BalanceDisplayLabels>;
  className?: string;
};

/**
 * Customization options for BalanceDisplay component
 */
export type BalanceDisplayCustomization = {
  /** Override root container props */
  containerProps?: Partial<
    Omit<
      ComponentPropsWithoutRef<'div'>,
      | 'popover'
      | 'onDrag'
      | 'onDragEnd'
      | 'onDragExit'
      | 'onDragStart'
      | 'onDragStartCapture'
      | 'onAnimationStart'
      | 'onAnimationEnd'
      | 'onAnimationStartCapture'
      | 'onAnimationEndCapture'
      | 'onAnimationIteration'
      | 'onAnimationIterationCapture'
    >
  >;
  /** Custom components */
  components?: {
    /** Custom refresh button component */
    RefreshButton?: ComponentType<RefreshButtonProps>;
    /** Custom loading state component */
    LoadingState?: ComponentType<LoadingStateProps>;
    /** Custom balance value component */
    BalanceValue?: ComponentType<BalanceValueProps>;
    /** Custom empty state component */
    EmptyState?: ComponentType<EmptyStateProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate container classes */
    container?: (params: { isLoading: boolean; hasBalance: boolean }) => string;
    /** Function to generate loading state classes */
    loadingState?: () => string;
    /** Function to generate balance value wrapper classes */
    balanceValueWrapper?: () => string;
    /** Function to generate balance value classes */
    balanceValue?: () => string;
    /** Function to generate balance symbol classes */
    balanceSymbol?: () => string;
    /** Function to generate balance icon classes */
    balanceIcon?: () => string;
    /** Function to generate refresh button classes */
    refreshButton?: (params: { isLoading: boolean; showSuccess: boolean }) => string;
    /** Function to generate refresh icon classes */
    refreshIcon?: () => string;
    /** Function to generate success icon classes */
    successIcon?: () => string;
    /** Function to generate empty state classes */
    emptyState?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Loading state animation variants */
    loading?: Variants;
    /** Success indicator animation variants */
    success?: Variants;
    /** Refresh icon animation variants */
    refresh?: Variants;
  };
  /** Configuration options */
  config?: {
    /** Whether to show refresh button */
    showRefreshButton?: boolean;
    /** Whether to show icon */
    showIcon?: boolean;
    /** Success indicator duration in ms */
    successDuration?: number;
    /** Whether to disable animations */
    disableAnimation?: boolean;
  };
};

/**
 * Props for the BalanceDisplay component
 */
export interface BalanceDisplayProps {
  /** Balance data to display */
  balance: BalanceData | null;
  /** Whether balance is loading */
  isLoading?: boolean;
  /** Function to refetch balance */
  onRefetch?: () => void;
  /** Custom labels for accessibility */
  labels?: BalanceDisplayLabels;
  /** Additional className for container */
  className?: string;
  /** Customization options */
  customization?: BalanceDisplayCustomization;
  /** Test ID for testing */
  'data-testid'?: string;
}

// --- Default Sub-Components ---

const DefaultRefreshButton: React.FC<RefreshButtonProps> = ({
  isLoading,
  showSuccess,
  onRefetch,
  labels,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onRefetch}
      disabled={isLoading}
      className={cn(
        'novacon:cursor-pointer novacon:ml-2 novacon:p-1 novacon:rounded-full novacon:transition-colors',
        'novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:text-[var(--tuwa-text-tertiary)]',
        'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-text-accent)]',
        showSuccess && 'novacon:text-[var(--tuwa-success-text)]',
        className,
      )}
      aria-label={labels.refreshBalance}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CheckIcon className="novacon:w-4 novacon:h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="refresh"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: isLoading ? 360 : 0 }}
            exit={{ opacity: 0 }}
            transition={isLoading ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 }}
          >
            <ArrowPathIcon className="novacon:w-4 novacon:h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

const DefaultLoadingState: React.FC<LoadingStateProps> = ({ labels, className }) => {
  return (
    <motion.div
      variants={DEFAULT_LOADING_ANIMATION_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'novacon:animate-pulse novacon:rounded-[var(--tuwa-rounded-corners)] novacon:h-5 novacon:w-24 novacon:bg-[var(--tuwa-bg-muted)]',
        className,
      )}
      role="status"
      aria-label={labels.loading}
    >
      <span className="novacon:sr-only">
        {labels.loading} {labels.walletBalance}
      </span>
    </motion.div>
  );
};

const DefaultBalanceValue: React.FC<BalanceValueProps> = ({ balance, labels, className }) => {
  return (
    <p
      className={cn(
        'novacon:flex novacon:items-center novacon:gap-1 novacon:text-sm novacon:text-[var(--tuwa-text-tertiary)]',
        className,
      )}
      role="text"
      aria-label={`${labels.walletBalance}: ${balance.value} ${balance.symbol}`}
    >
      <span aria-hidden="true">{balance.value}</span>
      <span aria-hidden="true">{balance.symbol}</span>

      {/* Screen reader friendly version */}
      <span className="novacon:sr-only">
        {labels.walletBalance}: {balance.value} {balance.symbol}
      </span>
    </p>
  );
};

const DefaultEmptyState: React.FC<EmptyStateProps> = ({ labels, className }) => {
  return (
    <p
      className={cn('novacon:text-sm novacon:text-[var(--tuwa-text-tertiary)] novacon:opacity-75', className)}
      role="text"
      aria-label={labels.noBalanceAvailable}
    >
      <span aria-hidden="true">—</span>
      <span className="novacon:sr-only">{labels.noBalanceAvailable}</span>
    </p>
  );
};

/**
 * BalanceDisplay component for showing token balances with optional refresh functionality.
 * Fully customizable through the customization prop.
 *
 * @example
 * ```tsx
 * <BalanceDisplay
 *   balance={{ value: '1,234.56', symbol: 'USDC' }}
 *   isLoading={false}
 *   onRefetch={() => refetchBalance()}
 *   customization={{
 *     classNames: {
 *       container: () => 'flex items-center gap-2',
 *       balanceValue: () => 'text-lg font-bold',
 *       refreshButton: () => 'hover:bg-accent/10',
 *     },
 *     config: {
 *       showRefreshButton: true,
 *     },
 *   }}
 * />
 * ```
 */
export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  isLoading = false,
  onRefetch,
  labels: customLabels,
  className,
  customization,
  'data-testid': testId,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const prevLoading = useRef(isLoading);

  // Merge labels with defaults
  const labels: Required<BalanceDisplayLabels> = {
    ...DEFAULT_LABELS,
    ...customLabels,
  };

  // Extract components
  const {
    RefreshButton = DefaultRefreshButton,
    LoadingState = DefaultLoadingState,
    BalanceValue = DefaultBalanceValue,
    EmptyState = DefaultEmptyState,
  } = customization?.components ?? {};

  // Extract config
  const { showRefreshButton = true, successDuration = 1500 } = customization?.config ?? {};

  // Show success indicator when loading completes
  useEffect(() => {
    if (prevLoading.current && !isLoading) {
      // eslint-disable-next-line
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), successDuration);
      return () => clearTimeout(timer);
    }
    prevLoading.current = isLoading;
  }, [isLoading, successDuration]);

  // Handle refetch
  const handleRefetch = useCallback(() => {
    onRefetch?.();
  }, [onRefetch]);

  // Determine if we have a valid balance
  const hasBalance = Boolean(balance?.value && balance?.symbol);

  // Container classes
  const containerClasses = customization?.classNames?.container
    ? customization.classNames.container({ isLoading, hasBalance })
    : cn('novacon:flex novacon:items-center novacon:relative', className);

  // Loading state
  if (isLoading && !hasBalance) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <LoadingState labels={labels} className={customization?.classNames?.loadingState?.()} />
      </div>
    );
  }

  // Balance display
  if (hasBalance && balance) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <BalanceValue balance={balance} labels={labels} className={customization?.classNames?.balanceValue?.()} />
        {showRefreshButton && onRefetch && (
          <RefreshButton
            isLoading={isLoading}
            showSuccess={showSuccess}
            onRefetch={handleRefetch}
            labels={labels}
            className={customization?.classNames?.refreshButton?.({ isLoading, showSuccess })}
          />
        )}
      </div>
    );
  }

  // Empty state
  return (
    <div className={containerClasses} data-testid={testId}>
      <EmptyState labels={labels} className={customization?.classNames?.emptyState?.()} />
      {showRefreshButton && onRefetch && (
        <RefreshButton
          isLoading={isLoading}
          showSuccess={showSuccess}
          onRefetch={handleRefetch}
          labels={labels}
          className={customization?.classNames?.refreshButton?.({ isLoading, showSuccess })}
        />
      )}
    </div>
  );
};

BalanceDisplay.displayName = 'BalanceDisplay';
