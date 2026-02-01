/**
 * @file ConnectedModalNameAndBalance component with comprehensive customization options for wallet name and balance display.
 */

import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';
import { BaseConnector } from '@tuwaio/satellite-core';
import { AnimatePresence, type Easing, motion, type Variants } from 'framer-motion';
import React, { ComponentPropsWithoutRef, ComponentType, forwardRef, useCallback } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { BalanceDisplay as BalanceDisplayComponent, type BalanceDisplayCustomization } from '../BalanceDisplay';
import { ConnectedModalMainContentProps } from './ConnectedModalMainContent';

// --- Default Motion Variants ---
const DEFAULT_CONTAINER_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const DEFAULT_COPY_ICON_ANIMATION_VARIANTS: Variants = {
  initial: { scale: 0.6, opacity: 0, rotate: 90 },
  animate: { scale: 1, opacity: 1, rotate: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
  exit: { scale: 0.6, opacity: 0, rotate: -90, transition: { duration: 0.2, ease: 'easeInOut' } },
};

const DEFAULT_CHECK_ICON_ANIMATION_VARIANTS: Variants = {
  initial: { scale: 0.6, opacity: 0, rotate: -90 },
  animate: { scale: 1, opacity: 1, rotate: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
  exit: { scale: 0.6, opacity: 0, rotate: 90, transition: { duration: 0.2, ease: 'easeInOut' } },
};

// --- Types for Customization ---
type WalletNameDisplayProps = {
  ensNameAbbreviated?: string;
  activeConnection: BaseConnector;
  labels: Record<string, string>;
  className?: string;
};

type CopyButtonProps = {
  isCopied: boolean;
  onCopy: () => Promise<void>;
  activeConnection: BaseConnector;
  labels: Record<string, string>;
  className?: string;
  disabled?: boolean;
};

type BalanceDisplayProps = {
  balance?: ConnectedModalMainContentProps['balance'];
  balanceLoading: boolean;
  refetch: () => void;
  labels: Record<string, string>;
  className?: string;
  /** Customization for the BalanceDisplay component */
  customization?: BalanceDisplayCustomization;
};

type ScreenReaderFeedbackProps = {
  isCopied: boolean;
  activeConnection: BaseConnector;
  labels: Record<string, string>;
  className?: string;
};

type LiveRegionProps = {
  balanceLoading: boolean;
  balance?: ConnectedModalMainContentProps['balance'];
  labels: Record<string, string>;
  className?: string;
};

/**
 * Customization options for ConnectedModalNameAndBalance component
 */
export type ConnectedModalNameAndBalanceCustomization = {
  /** Override root container props */
  containerProps?: Partial<
    Omit<
      ComponentPropsWithoutRef<'section'>,
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
    /** Custom wallet name display component */
    WalletNameDisplay?: ComponentType<WalletNameDisplayProps>;
    /** Custom copy button component */
    CopyButton?: ComponentType<CopyButtonProps>;
    /** Custom balance display component */
    BalanceDisplay?: ComponentType<BalanceDisplayProps>;
    /** Custom screen reader feedback component */
    ScreenReaderFeedback?: ComponentType<ScreenReaderFeedbackProps>;
    /** Custom live region component */
    LiveRegion?: ComponentType<LiveRegionProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate container classes */
    container?: (params: {
      hasActiveWallet: boolean;
      isCopied: boolean;
      balanceLoading: boolean;
      hasBalance: boolean;
    }) => string;
    /** Function to generate wallet name header container classes */
    walletNameHeaderContainer?: () => string;
    /** Function to generate wallet name display classes */
    walletNameDisplay?: (params: { ensNameAbbreviated?: string }) => string;
    /** Function to generate copy button classes */
    copyButton?: (params: { isCopied: boolean; disabled: boolean }) => string;
    /** Function to generate copy icon classes */
    copyIcon?: () => string;
    /** Function to generate check icon classes */
    checkIcon?: () => string;
    /** Function to generate balance container wrapper classes */
    balanceContainer?: () => string;
    /** Function to generate screen reader feedback classes */
    screenReaderFeedback?: () => string;
    /** Function to generate live region classes */
    liveRegion?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Container animation variants */
    container?: Variants;
    /** Copy icon animation variants */
    copyIcon?: Variants;
    /** Check icon animation variants */
    checkIcon?: Variants;
    /** Loading animation variants */
    loading?: Variants;
  };
  /** Custom animation configuration */
  animation?: {
    /** Container animation configuration */
    container?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
    };
    /** Icon animation configuration */
    icon?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
    };
    /** Loading animation configuration */
    loading?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
    };
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom handler for copy success */
    onCopySuccess?: (address: string) => void;
    /** Custom handler for copy error */
    onCopyError?: (error: Error, address: string) => void;
    /** Custom handler for balance format */
    onBalanceFormat?: (balance: ConnectedModalMainContentProps['balance']) => string | null;
    /** Custom handler for keyboard interactions */
    onKeyboardInteraction?: (event: React.KeyboardEvent, action: 'copy') => void;
  };
  /** Configuration options */
  config?: {
    /** Whether to disable animations */
    disableAnimation?: boolean;
    /** Whether to reduce motion for accessibility */
    reduceMotion?: boolean;
    /** Custom copy button position */
    copyButtonPosition?: 'right' | 'left' | 'top' | 'bottom';
    /** Custom ARIA labels for different states */
    ariaLabels?: {
      container?: string;
      walletNameHeader?: string;
      walletNameDisplay?: string;
      copyButton?: string;
      balanceContainer?: string;
      balanceLoading?: string;
      balanceDisplay?: string;
      noBalance?: string;
      screenReaderFeedback?: string;
      liveRegion?: string;
    };
  };
  /** Child component customizations */
  childCustomizations?: {
    /** Customization for BalanceDisplay component */
    balanceDisplay?: BalanceDisplayCustomization;
  };
};

/**
 * Props for the ConnectedModalNameAndBalance component
 */
export interface ConnectedModalNameAndBalanceProps extends Pick<
  ConnectedModalMainContentProps,
  'balanceLoading' | 'ensNameAbbreviated' | 'balance'
> {
  /** Function to manually trigger a balance refresh */
  refetch: () => void;
  /** Additional CSS classes for the container */
  className?: string;
  /** Custom aria-label for the container */
  'aria-label'?: string;
  /** Customization options */
  customization?: ConnectedModalNameAndBalanceCustomization;
}

// --- Default Sub-Components ---
const DefaultWalletNameDisplay: React.FC<WalletNameDisplayProps> = ({ ensNameAbbreviated, className }) => {
  return (
    <h3
      className={cn('novacon:text-xl novacon:font-bold', className)}
      role="heading"
      aria-level={3}
      aria-label={`Wallet name: ${ensNameAbbreviated || 'Loading wallet name'}`}
    >
      {ensNameAbbreviated}
    </h3>
  );
};

const DefaultCopyButton: React.FC<CopyButtonProps> = ({
  isCopied,
  onCopy,
  activeConnection,
  labels,
  className,
  disabled,
}) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void onCopy();
      }
    },
    [onCopy],
  );

  const getCopyButtonAriaLabel = useCallback(() => {
    const baseLabel = isCopied ? labels.copied : `Copy ${labels.walletAddress}`;
    const addressInfo = activeConnection?.address ? ` (${activeConnection.address})` : '';
    return `${baseLabel}${addressInfo}`;
  }, [isCopied, labels, activeConnection]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      onKeyDown={handleKeyDown}
      className={cn(
        'novacon:cursor-pointer novacon:flex novacon:items-center novacon:justify-center novacon:text-sm novacon:transition-all novacon:duration-200 novacon:absolute novacon:right-[-40px]',
        'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1.5 novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-text-accent)] novacon:focus:ring-opacity-50',
        'novacon:hover:scale-110 novacon:active:scale-95',
        isCopied
          ? [
              'novacon:text-[var(--tuwa-success-text)]',
              'novacon:hover:text-[var(--tuwa-success-text)]',
              'novacon:bg-[var(--tuwa-success-text)] novacon:bg-opacity-10',
            ]
          : [
              'novacon:text-[var(--tuwa-text-tertiary)]',
              'novacon:hover:text-[var(--tuwa-text-primary)]',
              'novacon:hover:bg-[var(--tuwa-bg-muted)]',
            ],
        className,
      )}
      aria-label={getCopyButtonAriaLabel()}
      aria-describedby="copy-feedback"
      disabled={disabled}
      data-testid="copy-address-button"
    >
      {/* Animated Icon Transition */}
      <AnimatePresence mode="wait" initial={false}>
        {isCopied ? (
          <motion.div
            key="check-icon"
            variants={DEFAULT_CHECK_ICON_ANIMATION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CheckIcon className="novacon:w-5 novacon:h-5" aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="copy-icon"
            variants={DEFAULT_COPY_ICON_ANIMATION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DocumentDuplicateIcon className="novacon:w-5 novacon:h-5" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

const DefaultBalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  balanceLoading,
  refetch,
  labels,
  className,
  customization,
}) => {
  // Convert balance format for BalanceDisplayComponent
  // Convert balance format for BalanceDisplayComponent
  const balanceData =
    balance?.value && balance?.symbol
      ? {
          value: balance.value,
          symbol: balance.symbol,
        }
      : null;

  // Merge labels for BalanceDisplayComponent
  // Merge labels for BalanceDisplayComponent
  const balanceLabels = {
    loading: labels.loading,
    walletBalance: labels.walletBalance,
    refreshBalance: 'Refresh balance',
    noBalanceAvailable: 'No balance information available',
  };

  return (
    <BalanceDisplayComponent
      balance={balanceData}
      isLoading={balanceLoading}
      onRefetch={refetch}
      labels={balanceLabels}
      className={className}
      customization={customization}
      data-testid="wallet-balance-display"
    />
  );
};

const DefaultScreenReaderFeedback: React.FC<ScreenReaderFeedbackProps> = ({
  isCopied,
  activeConnection,
  labels,
  className,
}) => {
  return (
    <span id="copy-feedback" className={cn('novacon:sr-only', className)} aria-live="polite" role="status">
      {isCopied ? `${labels.copied} ${activeConnection.address}` : ''}
    </span>
  );
};

const DefaultLiveRegion: React.FC<LiveRegionProps> = ({ balanceLoading, balance, className }) => {
  const balanceDisplay = balance?.value && balance?.symbol ? `${balance.value} ${balance.symbol}` : null;

  return (
    <div className={cn('novacon:sr-only', className)} aria-live="polite" aria-atomic="true" role="status">
      {/* This will announce balance updates to screen readers */}
      {!balanceLoading && balanceDisplay && `Balance updated: ${balanceDisplay}`}
    </div>
  );
};

/**
 * Component that displays wallet name/ENS and balance information with copy functionality and comprehensive customization options.
 *
 * This component provides a comprehensive display of wallet identification and balance:
 * - ENS name or abbreviated wallet address
 * - Animated copy button with visual feedback
 * - Loading states for balance information
 * - Proper accessibility support with ARIA labels
 * - Smooth animations for state transitions
 * - Comprehensive customization for all UI elements and behaviors
 * - Animation support with reduced motion options
 * - Custom event handlers for enhanced interactivity
 * - Performance-optimized with memoized calculations
 *
 * The component automatically handles wallet address copying with visual feedback
 * and provides screen reader friendly content throughout all interactions.
 *
 * @example Basic usage
 * ```tsx
 * <ConnectedModalNameAndBalance
 *   ensNameAbbreviated="wallet.eth"
 *   balanceLoading={false}
 *   balance={{ value: "1.23", symbol: "ETH" }}
 *   refetch={() => {}}
 * />
 * ```
 *
 * @example With full customization
 * ```tsx
 * <ConnectedModalNameAndBalance
 *   ensNameAbbreviated="wallet.eth"
 *   balanceLoading={false}
 *   balance={{ value: "1.23", symbol: "ETH" }}
 *   refetch={() => {}}
 *   customization={{
 *     classNames: {
 *       container: ({ hasActiveWallet }) =>
 *         `custom-container ${hasActiveWallet ? 'has-wallet' : 'no-wallet'}`,
 *       walletNameDisplay: () => "text-2xl font-bold text-blue-600",
 *       copyButton: ({ isCopied }) =>
 *         `copy-btn ${isCopied ? 'success' : 'default'}`,
 *     },
 *     components: {
 *       WalletNameDisplay: ({ ensNameAbbreviated, className }) =>
 *         <h2 className={className}>{ensNameAbbreviated}</h2>,
 *     },
 *     handlers: {
 *       onCopySuccess: (address) => console.log(`Copied: ${address}`),
 *       onCopyError: (error, address) =>
 *         console.error(`Failed to copy ${address}:`, error),
 *     },
 *     config: {
 *       copyButtonPosition: 'left',
 *       ariaLabels: {
 *         container: 'Wallet information section',
 *       },
 *     },
 *   }}
 * />
 * ```
 */
export const ConnectedModalNameAndBalance = forwardRef<HTMLElement, ConnectedModalNameAndBalanceProps>(
  (
    {
      ensNameAbbreviated,
      balanceLoading,
      balance,
      refetch,
      className,
      'aria-label': ariaLabel,
      customization,
      ...props
    },
    ref,
  ) => {
    const labels = useNovaConnectLabels();
    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
    const { copy, isCopied } = useCopyToClipboard();

    // Extract custom components and config
    const {
      WalletNameDisplay = DefaultWalletNameDisplay,
      CopyButton = DefaultCopyButton,
      BalanceDisplay = DefaultBalanceDisplay,
      ScreenReaderFeedback = DefaultScreenReaderFeedback,
      LiveRegion = DefaultLiveRegion,
    } = customization?.components ?? {};

    const { disableAnimation = false, reduceMotion = false, ariaLabels } = customization?.config ?? {};

    /**
     * Calculations for state
     */
    const hasActiveWallet = Boolean(activeConnection?.isConnected);
    const hasBalance = Boolean(balance?.value && balance?.symbol);

    /**
     * Handle copying wallet address with proper error handling and custom handlers
     */
    const handleCopyAddress = useCallback(async () => {
      if (!activeConnection?.address) {
        console.warn('No wallet address available to copy');
        return;
      }

      try {
        await copy(activeConnection.address);
        customization?.handlers?.onCopySuccess?.(activeConnection.address);
      } catch (error) {
        console.error('Failed to copy wallet address:', error);
        customization?.handlers?.onCopyError?.(error as Error, activeConnection.address);
      }
    }, [activeConnection, copy, customization]);

    /**
     * Container classes
     */
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({
          hasActiveWallet,
          isCopied,
          balanceLoading,
          hasBalance,
        })
      : cn(
          'novacon:flex novacon:w-full novacon:flex-col novacon:items-center novacon:justify-start novacon:gap-2 novacon:min-h-[60px]',
          className,
        );

    /**
     * Animation variants
     */
    const containerVariants = customization?.variants?.container || DEFAULT_CONTAINER_ANIMATION_VARIANTS;

    /**
     * Merge container props
     */
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'region' as const,
      'aria-label':
        ariaLabel || ariaLabels?.container || `${labels.walletBalance} and ${labels.walletAddress} information`,
    };

    // Early return if no active wallet
    if (!hasActiveWallet || !activeConnection) {
      return null;
    }

    const content = (
      <>
        {/* Wallet Name/ENS and Copy Button */}
        <div
          className={cn(
            'novacon:flex novacon:items-center novacon:gap-3 novacon:relative novacon:text-[var(--tuwa-text-primary)]',
            customization?.classNames?.walletNameHeaderContainer?.(),
          )}
          role="group"
          aria-label={`${labels.walletAddress}: ${ensNameAbbreviated || 'Loading...'}`}
        >
          {/* Wallet Name/ENS Display */}
          <WalletNameDisplay
            ensNameAbbreviated={ensNameAbbreviated}
            activeConnection={activeConnection}
            labels={labels}
            className={customization?.classNames?.walletNameDisplay?.({ ensNameAbbreviated })}
          />

          {/* Copy Address Button */}
          <CopyButton
            isCopied={isCopied}
            onCopy={handleCopyAddress}
            activeConnection={activeConnection}
            labels={labels}
            className={customization?.classNames?.copyButton?.({
              isCopied,
              disabled: !activeConnection?.address,
            })}
            disabled={!activeConnection?.address}
          />

          {/* Screen Reader Only Feedback */}
          <ScreenReaderFeedback
            isCopied={isCopied}
            activeConnection={activeConnection}
            labels={labels}
            className={customization?.classNames?.screenReaderFeedback?.()}
          />
        </div>

        {/* Balance Information */}
        <div
          className={cn(
            'novacon:flex novacon:items-center novacon:justify-center',
            customization?.classNames?.balanceContainer?.(),
          )}
          role="group"
          aria-label={labels.walletBalance}
        >
          <BalanceDisplay
            balance={balance}
            balanceLoading={balanceLoading}
            refetch={refetch}
            labels={labels}
            customization={customization?.childCustomizations?.balanceDisplay}
          />
        </div>

        {/* Hidden Live Region for Dynamic Updates */}
        <LiveRegion
          balanceLoading={balanceLoading}
          balance={balance}
          labels={labels}
          className={customization?.classNames?.liveRegion?.()}
        />
      </>
    );

    if (disableAnimation || reduceMotion) {
      return <section {...containerProps}>{content}</section>;
    }

    return (
      <motion.section
        {...containerProps}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: customization?.animation?.container?.duration ?? 0.3,
          ease: customization?.animation?.container?.ease ?? 'easeOut',
          delay: customization?.animation?.container?.delay ?? 0,
        }}
      >
        {content}
      </motion.section>
    );
  },
);

ConnectedModalNameAndBalance.displayName = 'ConnectedModalNameAndBalance';
