/**
 * @file ConnectedContent component displays wallet connection status with transaction monitoring and comprehensive
 * customization options.
 */

import { ChevronArrowWithAnim, cn, MorphText } from '@tuwaio/nova-core';
import { isSameAdapterAddress } from '@tuwaio/orbit-core';
import type { Transaction } from '@tuwaio/pulsar-core';
import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  ButtonTxStatus,
  NovaConnectProviderProps,
  useGetWalletNameAndAvatar,
  useNovaConnect,
  useNovaConnectLabels,
  useWalletNativeBalance,
} from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { WalletAvatar, WalletAvatarCustomization } from '../WalletAvatar';
import { connectedStatusFor, isTxResult, nextConnectedStatus } from './connectedStatus';
import { DEFAULT_STATUS_PATHS, StatusIcon, StatusIconCustomization } from './StatusIcon';

// --- Types for Customization ---
/** What {@link ConnectedContent} shows for the current button status. */
export type ConnectedContentStatusDisplayData = {
  /** The wallet name (ENS or SNS name, or the shortened address), or the status label of a finished transaction. */
  displayName: ReactNode;
  /** The wallet avatar, or the status icon of a finished transaction. */
  avatarIcon: ReactNode;
  /** Accessible label of the status. */
  ariaLabel: string;
};

/** Props of the balance of {@link ConnectedContent} (`customization.components.BalanceContainer`). */
export type ConnectedContentBalanceContainerProps = {
  /** Native balance of the active wallet with three decimals, without the symbol (`'—'` when unknown). */
  formattedBalance: string;
  /** The labels of Nova Connect. */
  labels: Record<string, string>;
  /** Classes from `customization.classNames.balanceContainer`. */
  className?: string;
  /** Accessible label of the balance. */
  'aria-label'?: string;
};

/** Props of the main content of {@link ConnectedContent} (`customization.components.MainContent`): avatar and name. */
export type ConnectedContentMainContentProps = {
  /** What to show for the current status. */
  statusDisplay: ConnectedContentStatusDisplayData;
  /** The status of the latest transaction of the wallet. */
  connectedButtonStatus: ButtonTxStatus;
  /** Whether the connected modal is open. */
  isConnectedModalOpen: boolean;
  /** Whether the balance is shown. */
  withBalance: boolean;
  /** The labels of Nova Connect. */
  labels: Record<string, string>;
  /** Classes from `customization.classNames.mainContent`. */
  className?: string;
};

/** Props of the animation shown while a transaction is pending (`customization.components.LoadingAnimation`). */
export type ConnectedContentLoadingAnimationProps = {
  /** The status of the latest transaction of the wallet. */
  connectedButtonStatus: ButtonTxStatus;
  /** Classes from `customization.classNames.loadingAnimation`. */
  className?: string;
};

/** Props of the divider between the balance and the wallet (`customization.components.BalanceDivider`). */
export type ConnectedContentBalanceDividerProps = {
  /** Classes from `customization.classNames.balanceDivider`. */
  className?: string;
};

/**
 * Customization options for ConnectedContent component
 */
export type ConnectedContentCustomization = {
  /** Override root container props */
  containerProps?: Partial<ComponentPropsWithoutRef<'div'>>;
  /** Custom components */
  components?: {
    /** Custom balance container component */
    BalanceContainer?: ComponentType<ConnectedContentBalanceContainerProps>;
    /** Custom main content wrapper component */
    MainContent?: ComponentType<ConnectedContentMainContentProps>;
    /** Custom loading animation component */
    LoadingAnimation?: ComponentType<ConnectedContentLoadingAnimationProps>;
    /** Custom balance divider component */
    BalanceDivider?: ComponentType<ConnectedContentBalanceDividerProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container.
     *
     * @param params - The content state.
     * @param params.connectedButtonStatus - The status of the latest transaction of the wallet.
     * @param params.withBalance - Whether the balance is shown.
     * @returns The classes.
     */
    container?: (params: { connectedButtonStatus: ButtonTxStatus; withBalance: boolean }) => string;
    /**
     * Returns the classes of the balance.
     *
     * @param params - The content state.
     * @param params.formattedBalance - The shown balance.
     * @returns The classes.
     */
    balanceContainer?: (params: { formattedBalance: string }) => string;
    /** Function to generate balance divider classes */
    balanceDivider?: () => string;
    /**
     * Returns the classes of the main content.
     *
     * @param params - The content state.
     * @param params.withBalance - Whether the balance is shown.
     * @returns The classes.
     */
    mainContent?: (params: { withBalance: boolean }) => string;
    /**
     * Returns the classes of the loading animation.
     *
     * @param params - The content state.
     * @param params.connectedButtonStatus - The status of the latest transaction of the wallet.
     * @returns The classes.
     */
    loadingAnimation?: (params: { connectedButtonStatus: ButtonTxStatus }) => string;
  };
  /** Customization options for child components */
  childCustomizations?: {
    /** WalletAvatar customization for idle and loading states */
    walletAvatar?: WalletAvatarCustomization;
    /** StatusIcon customization for transaction states */
    statusIcon?: {
      /** StatusIcon customization for success state */
      succeed?: StatusIconCustomization;
      /** StatusIcon customization for failed state */
      failed?: StatusIconCustomization;
      /** StatusIcon customization for replaced state */
      replaced?: StatusIconCustomization;
    };
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called when the balance is clicked.
     *
     * @param formattedBalance - The shown balance.
     * @param event - The click event.
     */
    onBalanceClick?: (formattedBalance: string, event: React.MouseEvent<HTMLDivElement>) => void;
  };
  /** Configuration options */
  config?: {
    /** How long the result of a finished transaction is shown, in milliseconds. Defaults to `2000`. */
    statusResetTimeout?: number;
    /** Whether to show loading animation */
    showLoadingAnimation?: boolean;
    /** Whether to show balance divider */
    showBalanceDivider?: boolean;
  };
};

/** Props of {@link ConnectedContent}. The other props are passed to the container `<div>`. */
export interface ConnectedContentProps extends Pick<NovaConnectProviderProps, 'transactionPool' | 'withBalance'> {
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom aria-label for the container */
  'aria-label'?: string;
  /** Customization options */
  customization?: ConnectedContentCustomization;
}

// --- Default Sub-Components ---
/** What the button shows for a balance that is not known, as `BalanceDisplay` does. */
const UNKNOWN_BALANCE = '—';

const DefaultBalanceContainer = ({
  formattedBalance,
  labels,
  className,
  ...props
}: ConnectedContentBalanceContainerProps) => {
  return (
    <div
      className={cn(
        'novacon:relative novacon:hidden novacon:sm:flex novacon:items-center novacon:pr-2 novacon:gap-2 novacon:text-[var(--tuwa-text-secondary)]',
        className,
      )}
      role="text"
      aria-label={
        formattedBalance === UNKNOWN_BALANCE
          ? labels.noBalanceAvailable
          : `${labels.walletBalance}: ${formattedBalance}`
      }
      {...props}
    >
      {/* The place of `0.000` whatever is in it: from a dash to a number the button grew by 34 px on every change of network,
          and the row around it moved */}
      <span
        className="novacon:mr-1 novacon:inline-block novacon:min-w-[5ch] novacon:text-center novacon:font-semibold"
        aria-hidden="true"
      >
        {formattedBalance}
      </span>
    </div>
  );
};

const DefaultMainContent = ({
  statusDisplay,
  isConnectedModalOpen,
  withBalance,
  className,
}: ConnectedContentMainContentProps) => {
  return (
    <div
      className={cn(
        'novacon:flex novacon:items-center novacon:space-x-2',
        { 'novacon:sm:pl-2': withBalance },
        className,
      )}
    >
      {statusDisplay.avatarIcon}
      <span className="novacon:text-[var(--tuwa-text-primary)] novacon:font-medium novacon:hidden novacon:min-[480px]:block">
        {typeof statusDisplay.displayName === 'string' ? (
          <MorphText>{statusDisplay.displayName}</MorphText>
        ) : (
          statusDisplay.displayName
        )}
      </span>
      <div aria-hidden="true">
        <ChevronArrowWithAnim isOpen={isConnectedModalOpen} className="novacon:xs:hidden" />
      </div>
    </div>
  );
};

const DefaultLoadingAnimation = ({ connectedButtonStatus, className }: ConnectedContentLoadingAnimationProps) => {
  if (connectedButtonStatus !== 'loading') return null;

  return (
    <div
      className={cn(
        // Paper and ink: a frame with a segment of the pending color running round it (`tuwa-square-chase`)
        'tuwa-square-chase novacon:absolute novacon:inset-[-4px] novacon:rounded-[var(--tuwa-rounded-full)] novacon:border novacon:border-[color-mix(in_srgb,var(--tuwa-pending-icon)_35%,transparent)] novacon:[--tuwa-chase-border:1px]',
        className,
      )}
      aria-hidden="true"
    />
  );
};

const DefaultBalanceDivider = ({ className }: ConnectedContentBalanceDividerProps) => {
  return (
    <div
      className={cn(
        'novacon:hidden novacon:sm:block novacon:absolute novacon:top-1/2 novacon:right-0 novacon:transform novacon:-translate-y-1/2 novacon:h-4 novacon:w-[1px] novacon:bg-[var(--tuwa-border-primary)]',
        className,
      )}
      aria-hidden="true"
    />
  );
};

/**
 * The content of the connect button while a wallet is connected: the native balance with three decimals (with
 * `withBalance`, from the `sm` breakpoint), the avatar and the ENS or SNS name (or shortened address) of the active
 * wallet. While a transaction of the wallet in `transactionPool` is pending it shows a loading animation; when a
 * transaction finishes it shows the result (succeeded, failed, cancelled, replaced) for
 * `customization.config.statusResetTimeout` milliseconds, even while another transaction is still pending, and then goes back
 * to the animation. A speed-up is no result: the button stays busy until the record of the new hash has one. A change of name
 * morphs the text. The status is kept in `connectedButtonStatus` of `NovaConnectProvider`.
 *
 * Props: {@link ConnectedContentProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { ConnectedContent } from '@tuwaio/nova-connect/components';
 * import type { Transaction, TransactionPool } from '@tuwaio/pulsar-core';
 *
 * export function WalletContent({ transactionPool }: { transactionPool: TransactionPool<Transaction> }) {
 *   return (
 *     <ConnectedContent
 *       transactionPool={transactionPool}
 *       withBalance
 *       customization={{
 *         classNames: { balanceContainer: () => 'custom-balance' },
 *         handlers: { onBalanceClick: (balance) => console.log('Balance clicked:', balance) },
 *         config: { statusResetTimeout: 3000 },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const ConnectedContent = forwardRef<HTMLDivElement, ConnectedContentProps>(
  ({ transactionPool, withBalance, className, 'aria-label': ariaLabel, customization, ...props }, ref) => {
    const labels = useNovaConnectLabels();

    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
    const { isConnectedModalOpen, setConnectedButtonStatus, connectedButtonStatus } = useNovaConnect();

    const { ensAvatar, ensNameAbbreviated } = useGetWalletNameAndAvatar({
      abbreviateSymbols: 6,
      maxNameLength: 30,
      autoRetry: false,
      retryDelay: 3000,
    });

    const { balance, refetch: refetchBalance } = useWalletNativeBalance({ enabled: Boolean(withBalance) });

    // Not `0.000`: an RPC that does not answer says nothing of a wallet holding 5 ETH
    const parsedBalance = balance?.value ? parseFloat(balance.value) : NaN;
    const formattedBalance = Number.isFinite(parsedBalance) ? parsedBalance.toFixed(3) : UNKNOWN_BALANCE;

    // Once, not on every render: the pool can be long
    const prevTxPoolRef = useRef<Transaction[] | null>(null);
    if (prevTxPoolRef.current === null) {
      prevTxPoolRef.current = Object.values(transactionPool ?? {}).filter(
        (tx) =>
          tx?.from && activeConnection?.address && isSameAdapterAddress(tx.adapter, tx.from, activeConnection.address),
      );
    }

    // Extract custom components and config
    const {
      BalanceContainer = DefaultBalanceContainer,
      MainContent = DefaultMainContent,
      LoadingAnimation = DefaultLoadingAnimation,
      BalanceDivider = DefaultBalanceDivider,
    } = customization?.components ?? {};

    const {
      statusResetTimeout = 2000,
      showLoadingAnimation = true,
      showBalanceDivider = true,
    } = customization?.config ?? {};

    // Reset status on mount and cleanup
    useEffect(() => {
      setConnectedButtonStatus('idle');
      return () => setConnectedButtonStatus('idle');
    }, [setConnectedButtonStatus]);

    // Reset status when wallet address changes
    useEffect(() => {
      setConnectedButtonStatus('idle');
    }, [activeConnection?.address, setConnectedButtonStatus]);

    const prevAddressRef = useRef(activeConnection?.address);

    // Monitor transaction pool changes
    useEffect(() => {
      if (!activeConnection || !activeConnection?.isConnected) {
        return;
      }

      const currentPool =
        Object.values(transactionPool ?? {}).filter(
          (tx) =>
            tx?.from &&
            activeConnection?.address &&
            isSameAdapterAddress(tx.adapter, tx.from, activeConnection.address),
        ) || [];

      const prevPool = prevTxPoolRef.current || [];
      // Another wallet: what is shown now is of the old one, and the reset above must stand
      if (prevAddressRef.current === activeConnection.address) {
        const computedStatus = connectedStatusFor(currentPool, prevPool);
        // Goes to idle when nothing is pending any more, for example as the tracking of the last transaction was stopped
        setConnectedButtonStatus(nextConnectedStatus(connectedButtonStatus, computedStatus));
        // The wallet paid: for a value, or only the fee of a transaction that failed
        if (isTxResult(computedStatus)) refetchBalance();
      } else if (currentPool.some((tx) => tx.pending)) {
        setConnectedButtonStatus('loading');
      }
      prevAddressRef.current = activeConnection.address;

      prevTxPoolRef.current = currentPool;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionPool, activeConnection?.address, activeConnection?.isConnected, setConnectedButtonStatus]);

    // Auto-reset status after showing success/error states
    useEffect(() => {
      if (['succeed', 'failed', 'replaced', 'cancelled'].includes(connectedButtonStatus)) {
        const timer = setTimeout(() => {
          // Back to busy if another transaction is still pending, which a result does not end
          setConnectedButtonStatus(prevTxPoolRef.current?.some((tx) => tx.pending) ? 'loading' : 'idle');
        }, statusResetTimeout);
        return () => clearTimeout(timer);
      }
    }, [connectedButtonStatus, statusResetTimeout, setConnectedButtonStatus]);

    // Get status-specific aria label
    const getStatusAriaLabel = useCallback(
      (status: ButtonTxStatus) => {
        switch (status) {
          case 'succeed':
            return labels.transactionSuccess;
          case 'failed':
            return labels.transactionError;
          case 'replaced':
            return labels.transactionReplaced;
          case 'cancelled':
            return labels.transactionCancelled;
          case 'loading':
            return labels.transactionLoading;
          default:
            return labels.walletAddress;
        }
      },
      [labels],
    );

    // Memoized status display configuration
    const statusDisplay = (() => {
      if (!activeConnection) return { displayName: null, avatarIcon: null, ariaLabel: '' };

      const baseAriaLabel = `${labels.transactionStatus}: ${getStatusAriaLabel(connectedButtonStatus)}`;

      switch (connectedButtonStatus) {
        case 'succeed':
          return {
            displayName: labels.success,
            avatarIcon: (
              <StatusIcon
                txStatus="succeed"
                colorVar="success"
                aria-label={labels.transactionSuccess}
                customization={customization?.childCustomizations?.statusIcon?.succeed}
              >
                {DEFAULT_STATUS_PATHS.succeed}
              </StatusIcon>
            ),
            ariaLabel: baseAriaLabel,
          };
        case 'failed':
          return {
            displayName: labels.error,
            avatarIcon: (
              <StatusIcon
                txStatus="failed"
                colorVar="error"
                aria-label={labels.transactionError}
                customization={customization?.childCustomizations?.statusIcon?.failed}
              >
                {DEFAULT_STATUS_PATHS.failed}
              </StatusIcon>
            ),
            ariaLabel: baseAriaLabel,
          };
        case 'replaced':
        case 'cancelled':
          return {
            displayName: connectedButtonStatus === 'cancelled' ? labels.cancelled : labels.replaced,
            avatarIcon: (
              <StatusIcon
                txStatus="replaced"
                colorVar="text"
                aria-label={
                  connectedButtonStatus === 'cancelled' ? labels.transactionCancelled : labels.transactionReplaced
                }
                customization={customization?.childCustomizations?.statusIcon?.replaced}
              >
                {DEFAULT_STATUS_PATHS.replaced}
              </StatusIcon>
            ),
            ariaLabel: baseAriaLabel,
          };
        case 'loading':
          return {
            displayName: ensNameAbbreviated,
            avatarIcon: (
              <div className="novacon:relative">
                {showLoadingAnimation && (
                  <LoadingAnimation
                    connectedButtonStatus={connectedButtonStatus}
                    className={customization?.classNames?.loadingAnimation?.({ connectedButtonStatus })}
                  />
                )}
                <WalletAvatar
                  address={activeConnection?.address}
                  ensAvatar={ensAvatar}
                  className="novacon:relative novacon:z-2"
                  aria-label={`${labels.walletAvatar}: ${ensNameAbbreviated}`}
                  customization={customization?.childCustomizations?.walletAvatar}
                />
              </div>
            ),
            ariaLabel: `${labels.transactionLoading}. ${labels.walletAddress}: ${ensNameAbbreviated}`,
          };
        case 'idle':
        default:
          return {
            displayName: ensNameAbbreviated,
            avatarIcon: (
              <WalletAvatar
                address={activeConnection?.address}
                ensAvatar={ensAvatar}
                className="novacon:relative novacon:z-2"
                aria-label={`${labels.walletAvatar}: ${ensNameAbbreviated}`}
                customization={customization?.childCustomizations?.walletAvatar}
              />
            ),
            ariaLabel: `${labels.walletAddress}: ${ensNameAbbreviated}`,
          };
      }
    })();

    // Event handlers
    const handleBalanceClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (customization?.handlers?.onBalanceClick) {
          customization?.handlers?.onBalanceClick(formattedBalance, event);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customization?.handlers?.onBalanceClick, formattedBalance],
    );

    // Generate container classes
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ connectedButtonStatus, withBalance: Boolean(withBalance) })
      : cn('novacon:flex novacon:items-center novacon:gap-2 novacon:sm:gap-3', className);

    // Merge container props
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'status',
      'aria-live': 'polite' as const,
      'aria-label': ariaLabel || statusDisplay.ariaLabel,
    };

    if (!activeConnection) return null;

    return (
      <div {...containerProps}>
        {/* Balance Display */}
        {withBalance && (
          <div className="novacon:relative novacon:hidden novacon:sm:block" onClick={handleBalanceClick}>
            <BalanceContainer
              formattedBalance={formattedBalance}
              labels={labels}
              className={customization?.classNames?.balanceContainer?.({ formattedBalance })}
            />
            {showBalanceDivider && <BalanceDivider className={customization?.classNames?.balanceDivider?.()} />}
          </div>
        )}

        {/* Main Content */}
        <MainContent
          statusDisplay={statusDisplay}
          connectedButtonStatus={connectedButtonStatus}
          isConnectedModalOpen={isConnectedModalOpen}
          withBalance={Boolean(withBalance)}
          labels={labels}
          className={customization?.classNames?.mainContent?.({ withBalance: Boolean(withBalance) })}
        />
      </div>
    );
  },
);

ConnectedContent.displayName = 'ConnectedContent';
