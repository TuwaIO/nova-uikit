/**
 * @file ConnectedModalNameAndBalance component with comprehensive customization options for wallet name and balance
 * display.
 */

import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { cn, useCopyToClipboard } from '@tuwaio/nova-core';
import { BaseConnector } from '@tuwaio/satellite-core';
import { AnimatePresence, type Easing, motion, type Variants } from 'framer-motion';
import React, { ComponentPropsWithoutRef, ComponentType, forwardRef, useCallback } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
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
/**
 * Props for a custom wallet name.
 */
export type ConnectedModalNameAndBalanceWalletNameDisplayProps = {
  /** The `ensNameAbbreviated` prop (the default heading is empty without it) */
  ensNameAbbreviated?: string;
  /** The active connection */
  activeConnection: BaseConnector;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.walletNameDisplay` */
  className?: string;
};

/**
 * Props for a custom copy button.
 */
export type ConnectedModalNameAndBalanceCopyButtonProps = {
  /** Whether the address was copied in the last 2 seconds */
  isCopied: boolean;
  /** Copies the active address to the clipboard and calls `handlers.onCopySuccess` */
  onCopy: () => Promise<void>;
  /** The active connection */
  activeConnection: BaseConnector;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.copyButton` */
  className?: string;
  /** Whether the connection has no address */
  disabled?: boolean;
};

/**
 * Props for a custom balance (the default one renders `BalanceDisplay` with a refresh button).
 */
export type ConnectedModalNameAndBalanceBalanceDisplayProps = {
  /** The `balance` prop */
  balance?: ConnectedModalMainContentProps['balance'];
  /** The `balanceLoading` prop */
  balanceLoading: boolean;
  /** The `refetch` prop */
  refetch: () => void;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Customization for the BalanceDisplay component */
  customization?: BalanceDisplayCustomization;
};

/**
 * Props for a custom screen reader announcement of the copy (a visually hidden live region by default).
 */
export type ConnectedModalNameAndBalanceScreenReaderFeedbackProps = {
  /** Whether the address was just copied */
  isCopied: boolean;
  /** The active connection */
  activeConnection: BaseConnector;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.screenReaderFeedback` */
  className?: string;
};

/**
 * Props for a custom screen reader announcement of the balance (a visually hidden live region by default).
 */
export type ConnectedModalNameAndBalanceLiveRegionProps = {
  /** The `balanceLoading` prop */
  balanceLoading: boolean;
  /** The `balance` prop */
  balance?: ConnectedModalMainContentProps['balance'];
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.liveRegion` */
  className?: string;
};

/**
 * Customization options of {@link ConnectedModalNameAndBalance}.
 */
export type ConnectedModalNameAndBalanceCustomization = {
  /** Props of the `section` element (the component props, `className`, `role` and `aria-label` take precedence) */
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
    WalletNameDisplay?: ComponentType<ConnectedModalNameAndBalanceWalletNameDisplayProps>;
    /** Custom copy button component */
    CopyButton?: ComponentType<ConnectedModalNameAndBalanceCopyButtonProps>;
    /** Custom balance display component */
    BalanceDisplay?: ComponentType<ConnectedModalNameAndBalanceBalanceDisplayProps>;
    /** Custom screen reader feedback component */
    ScreenReaderFeedback?: ComponentType<ConnectedModalNameAndBalanceScreenReaderFeedbackProps>;
    /** Custom live region component */
    LiveRegion?: ComponentType<ConnectedModalNameAndBalanceLiveRegionProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the section, instead of the default ones and the `className` prop.
     *
     * @param params - The section state.
     * @param params.hasActiveWallet - Always `true` (nothing is rendered without a connected wallet).
     * @param params.isCopied - Whether the address was just copied.
     * @param params.balanceLoading - The `balanceLoading` prop.
     * @param params.hasBalance - Whether `balance` has a value and a symbol.
     * @returns The classes.
     */
    container?: (params: {
      hasActiveWallet: boolean;
      isCopied: boolean;
      balanceLoading: boolean;
      hasBalance: boolean;
    }) => string;
    /**
     * Returns classes of the row with the name and the copy button, added to the default ones.
     *
     * @returns The classes.
     */
    walletNameHeaderContainer?: () => string;
    /**
     * Returns classes added to the wallet name.
     *
     * @param params - The name.
     * @param params.ensNameAbbreviated - The `ensNameAbbreviated` prop.
     * @returns The classes.
     */
    walletNameDisplay?: (params: { ensNameAbbreviated?: string }) => string;
    /**
     * Returns classes added to the copy button.
     *
     * @param params - The button state.
     * @param params.isCopied - Whether the address was just copied.
     * @param params.disabled - Whether the connection has no address.
     * @returns The classes.
     */
    copyButton?: (params: { isCopied: boolean; disabled: boolean }) => string;
    /**
     * Returns classes of the balance row, added to the default ones.
     *
     * @returns The classes.
     */
    balanceContainer?: () => string;
    /**
     * Returns classes of the copy announcement, added to the default ones.
     *
     * @returns The classes.
     */
    screenReaderFeedback?: () => string;
    /**
     * Returns classes of the balance announcement, added to the default ones.
     *
     * @returns The classes.
     */
    liveRegion?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Section animation variants (`initial`, `animate`, `exit`) */
    container?: Variants;
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
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called after the address is copied to the clipboard.
     *
     * @param address - The copied address.
     */
    onCopySuccess?: (address: string) => void;
    /**
     * Called when the clipboard write fails (for example when the browser denies the clipboard permission).
     *
     * @param error - The error of `navigator.clipboard.writeText`.
     * @param address - The address that was not copied.
     */
    onCopyError?: (error: Error, address: string) => void;
  };
  /** Configuration options */
  config?: {
    /** Renders the section without Framer Motion (default: `false`) */
    disableAnimation?: boolean;
    /** Same as `disableAnimation` (default: `false`) */
    reduceMotion?: boolean;
    /** Custom ARIA labels for different states */
    ariaLabels?: {
      /** ARIA label of the section, after the `aria-label` prop */
      container?: string;
    };
  };
  /** Child component customizations */
  childCustomizations?: {
    /** Customization for BalanceDisplay component */
    balanceDisplay?: BalanceDisplayCustomization;
  };
};

/**
 * Props for the {@link ConnectedModalNameAndBalance} component. Other props are passed to the `section` element.
 */
export interface ConnectedModalNameAndBalanceProps extends Pick<
  ConnectedModalMainContentProps,
  'balanceLoading' | 'ensNameAbbreviated' | 'balance'
> {
  /** Function to manually trigger a balance refresh */
  refetch: () => void;
  /** Classes added to the default section classes (ignored when `classNames.container` is set) */
  className?: string;
  /** ARIA label of the section (default: the `walletBalance` and `walletAddress` labels) */
  'aria-label'?: string;
  /** Customization options */
  customization?: ConnectedModalNameAndBalanceCustomization;
}

// --- Default Sub-Components ---
const DefaultWalletNameDisplay: React.FC<ConnectedModalNameAndBalanceWalletNameDisplayProps> = ({
  ensNameAbbreviated,
  labels,
  className,
}) => {
  return (
    <h3
      className={cn('novacon:text-xl novacon:font-bold novacon:font-mono', className)}
      role="heading"
      aria-level={3}
      aria-label={formatLabel(labels.walletName, { name: ensNameAbbreviated || labels.loadingWalletName })}
    >
      {ensNameAbbreviated}
    </h3>
  );
};

const DefaultCopyButton: React.FC<ConnectedModalNameAndBalanceCopyButtonProps> = ({
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
    const baseLabel = isCopied ? labels.copied : labels.copyWalletAddress;
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
        'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1.5 novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-text-accent)] novacon:focus:ring-opacity-50 novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
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

const DefaultBalanceDisplay: React.FC<ConnectedModalNameAndBalanceBalanceDisplayProps> = ({
  balance,
  balanceLoading,
  refetch,
  labels,
  customization,
}) => {
  // Convert balance format for BalanceDisplayComponent
  const balanceData =
    balance?.value && balance?.symbol
      ? {
          value: balance.value,
          symbol: balance.symbol,
        }
      : null;

  // Merge labels for BalanceDisplayComponent
  const balanceLabels = {
    loading: labels.loading,
    walletBalance: labels.walletBalance,
    refreshBalance: labels.refreshBalance,
    noBalanceAvailable: labels.noBalanceAvailable,
  };

  return (
    <BalanceDisplayComponent
      balance={balanceData}
      isLoading={balanceLoading}
      onRefetch={refetch}
      labels={balanceLabels}
      customization={customization}
      data-testid="wallet-balance-display"
    />
  );
};

const DefaultScreenReaderFeedback: React.FC<ConnectedModalNameAndBalanceScreenReaderFeedbackProps> = ({
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

const DefaultLiveRegion: React.FC<ConnectedModalNameAndBalanceLiveRegionProps> = ({
  balanceLoading,
  balance,
  labels,
  className,
}) => {
  const balanceDisplay = balance?.value && balance?.symbol ? `${balance.value} ${balance.symbol}` : null;

  return (
    <div className={cn('novacon:sr-only', className)} aria-live="polite" aria-atomic="true" role="status">
      {/* This will announce balance updates to screen readers */}
      {!balanceLoading && balanceDisplay && formatLabel(labels.balanceUpdated, { balance: balanceDisplay })}
    </div>
  );
};

/**
 * The name and balance of the connected modal: the ENS or SNS name with a button that copies the active address to
 * the clipboard, and the native balance with a refresh button. Renders nothing without a connected wallet.
 *
 * Props: {@link ConnectedModalNameAndBalanceProps}; the ref is forwarded to the `section` element.
 *
 * @example
 * ```tsx
 * import { ConnectedModalNameAndBalance } from '@tuwaio/nova-connect/components';
 *
 * export const NameAndBalance = (
 *   <ConnectedModalNameAndBalance
 *     ensNameAbbreviated="vitalik.eth"
 *     balanceLoading={false}
 *     balance={{ value: '1.23', symbol: 'ETH' }}
 *     refetch={() => console.log('refresh the balance')}
 *     customization={{
 *       classNames: { walletNameDisplay: () => 'text-2xl text-blue-600' },
 *       handlers: { onCopySuccess: (address) => console.log('copied', address) },
 *     }}
 *   />
 * );
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

      const result = await copy(activeConnection.address);
      if (result.copied) {
        customization?.handlers?.onCopySuccess?.(activeConnection.address);
      } else {
        customization?.handlers?.onCopyError?.(result.error, activeConnection.address);
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
          aria-label={`${labels.walletAddress}: ${ensNameAbbreviated || `${labels.loading}...`}`}
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
