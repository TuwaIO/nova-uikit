/**
 * @file ConnectedModalTxHistory component with comprehensive customization options for transaction history display.
 */

import { ExclamationTriangleIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';
import { cn } from '@tuwaio/nova-core';
import { type Easing, motion, type Variants } from 'framer-motion';
import React, {
  Component,
  ComponentPropsWithoutRef,
  ComponentType,
  forwardRef,
  lazy,
  ReactNode,
  Suspense,
  useCallback,
} from 'react';

import { NovaConnectProviderProps, useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { useSatelliteConnectStore } from '../../satellite';

// --- Default Motion Variants ---
const DEFAULT_CONTAINER_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

const DEFAULT_ERROR_ANIMATION_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

// ─────────────────────────────────────────────────────────────────────
// Local Types for TransactionsHistory (copied to preserve dynamic loading)
// These types mirror @tuwaio/nova-transactions types without importing
// ─────────────────────────────────────────────────────────────────────

/**
 * Local mirror of TxInMemoryPagination from @tuwaio/pulsar-core.
 * Defined inline because pulsar-core is an optional peer dependency in nova-connect.
 */
export type LocalTxPagination = {
  /** Indicates whether the store is currently loading transaction history. */
  isLoading: boolean;
  /** Indicates whether the last loading request ended with an error. */
  isError: boolean;
  /** Indicates whether more history pages are available. */
  hasMore: boolean;
  /** The current page number in the paginated history. */
  currentPage: number;
  /**
   * Loads the next page of transaction history and appends it to the pool.
   *
   * @param walletAddress - The address whose history is loaded.
   * @returns Resolves when the page is loaded.
   */
  fetchNextPage: (walletAddress: string) => Promise<void>;
};

/**
 * Local customization options for TransactionsHistory component.
 * This is a copy of the type from @tuwaio/nova-transactions to avoid
 * breaking dynamic import logic.
 */
export type LocalTransactionsHistoryCustomization = {
  /** Custom title for the transactions history section */
  title?: string;
  /** Custom class name generators */
  classNames?: {
    /** Classes for the outer container */
    container?: string;
    /** Classes for the title element */
    titleText?: string;
    /** Classes for the list wrapper container */
    listWrapper?: string;
    /** Classes for the placeholder container */
    placeholderContainer?: string;
    /** Classes for the placeholder title */
    placeholderTitle?: string;
    /** Classes for the placeholder message */
    placeholderMessage?: string;
    /** Classes for the infinite scroll loader container */
    loaderContainer?: string;
    /** Classes for the infinite scroll loader icon (spinner) */
    loaderIcon?: string;
    /** Classes for the error indicator container */
    errorContainer?: string;
    /** Classes for the error indicator icon */
    errorIcon?: string;
    // --- TransactionHistoryItem classNames ---
    /** Classes for individual transaction item container */
    itemContainer?: string;
    /** Classes for the icon wrapper */
    itemIconWrapper?: string;
    /** Classes for the icon itself */
    itemIcon?: string;
    /** Classes for the content wrapper */
    itemContentWrapper?: string;
    /** Classes for the title text */
    itemTitle?: string;
    /** Classes for the timestamp text */
    itemTimestamp?: string;
    /** Classes for the description text */
    itemDescription?: string;
    /** Classes for the status badge container */
    itemStatusBadge?: string;
    /** Classes for the status badge icon */
    itemStatusBadgeIcon?: string;
    /** Classes for the status badge label */
    itemStatusBadgeLabel?: string;
    /** Classes for the transaction key container */
    itemTxKeyContainer?: string;
    /** Classes for the default hash link label */
    itemHashLabel?: string;
    /** Classes for the default hash link */
    itemHashLink?: string;
    /** Classes for the default hash copy button */
    itemHashCopyButton?: string;
    /** Classes for the original hash link label (replaced transactions) */
    itemOriginalHashLabel?: string;
    /** Classes for the original hash link (replaced transactions) */
    itemOriginalHashLink?: string;
    /** Classes for the original hash copy button (replaced transactions) */
    itemOriginalHashCopyButton?: string;
  };
};

// --- Types for Customization ---
/**
 * Props for a custom loading state (shown while `@tuwaio/nova-transactions` loads).
 */
export type ConnectedModalTxHistoryLoadingContainerProps = {
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.loadingContainer` */
  className?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.loadingSpinner` */
    spinner?: string;
    /** From `classNames.loadingText` */
    text?: string;
  };
};

/**
 * Props for a custom error state (shown when `@tuwaio/nova-transactions` cannot be loaded or its component throws).
 */
export type ConnectedModalTxHistoryErrorContainerProps = {
  /** Classes from `classNames.errorContainer` */
  className?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.errorIconContainer` */
    iconContainer?: string;
    /** From `classNames.errorIcon` */
    icon?: string;
    /** From `classNames.errorContent` */
    content?: string;
    /** From `classNames.errorTitle` */
    title?: string;
    /** From `classNames.errorDescription` */
    description?: string;
  };
};

/**
 * Props for a custom state without a connected wallet.
 */
export type ConnectedModalTxHistoryNoWalletContainerProps = {
  /** Classes from `classNames.noWalletContainer` */
  className?: string;
  /** Granular classNames for sub-elements */
  classNames?: {
    /** From `classNames.noWalletText` */
    text?: string;
  };
};

/**
 * Props for a custom wrapper of the `TransactionsHistory` of `@tuwaio/nova-transactions`.
 */
export type ConnectedModalTxHistoryTransactionsHistoryWrapperProps = {
  /** The transaction history */
  children: ReactNode;
  /** The active address */
  activeConnectionAddress: string;
  /** The `transactionPool` prop */
  transactionPool: NonNullable<NovaConnectProviderProps['transactionPool']>;
  /** The `pulsarAdapter` prop */
  pulsarAdapter: NonNullable<NovaConnectProviderProps['pulsarAdapter']>;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.transactionsHistoryWrapper` */
  className?: string;
};

/**
 * Customization options of {@link ConnectedModalTxHistory}.
 */
export type ConnectedModalTxHistoryCustomization = {
  /** Props of the container (the component props, `className` and `aria-label` take precedence) */
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
    /** Custom loading container component */
    LoadingContainer?: ComponentType<ConnectedModalTxHistoryLoadingContainerProps>;
    /** Custom error container component */
    ErrorContainer?: ComponentType<ConnectedModalTxHistoryErrorContainerProps>;
    /** Custom no wallet container component */
    NoWalletContainer?: ComponentType<ConnectedModalTxHistoryNoWalletContainerProps>;
    /** Custom transactions history wrapper component */
    TransactionsHistoryWrapper?: ComponentType<ConnectedModalTxHistoryTransactionsHistoryWrapperProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop.
     *
     * @param params - The state.
     * @param params.hasActiveWallet - Whether a wallet is connected.
     * @param params.hasValidAdapter - Whether `transactionPool` and `pulsarAdapter` are set.
     * @returns The classes.
     */
    container?: (params: { hasActiveWallet: boolean; hasValidAdapter: boolean }) => string;
    /**
     * Returns classes of the loading state, added to the default ones.
     *
     * @returns The classes.
     */
    loadingContainer?: () => string;
    /**
     * Returns classes of the loading spinner, added to the default ones.
     *
     * @returns The classes.
     */
    loadingSpinner?: () => string;
    /**
     * Returns classes of the loading text, added to the default ones.
     *
     * @returns The classes.
     */
    loadingText?: () => string;
    /**
     * Returns classes of the error state, added to the default ones.
     *
     * @returns The classes.
     */
    errorContainer?: () => string;
    /**
     * Returns classes of the error icon container, added to the default ones.
     *
     * @returns The classes.
     */
    errorIconContainer?: () => string;
    /**
     * Returns classes of the error icon, added to the default ones.
     *
     * @returns The classes.
     */
    errorIcon?: () => string;
    /**
     * Returns classes of the error texts, added to the default ones.
     *
     * @returns The classes.
     */
    errorContent?: () => string;
    /**
     * Returns classes of the error title, added to the default ones.
     *
     * @returns The classes.
     */
    errorTitle?: () => string;
    /**
     * Returns classes of the error description, added to the default ones.
     *
     * @returns The classes.
     */
    errorDescription?: () => string;
    /**
     * Returns classes of the state without a wallet, added to the default ones.
     *
     * @returns The classes.
     */
    noWalletContainer?: () => string;
    /**
     * Returns classes of the text without a wallet, added to the default ones.
     *
     * @returns The classes.
     */
    noWalletText?: () => string;
    /**
     * Returns classes of the "Pulsar adapter required" state, instead of the default ones.
     *
     * @returns The classes.
     */
    pulsarRequiredContainer?: () => string;
    /**
     * Returns classes of its icon container, instead of the default ones.
     *
     * @returns The classes.
     */
    pulsarRequiredIconContainer?: () => string;
    /**
     * Returns classes of its icon, instead of the default ones.
     *
     * @returns The classes.
     */
    pulsarRequiredIcon?: () => string;
    /**
     * Returns classes of its texts, instead of the default ones.
     *
     * @returns The classes.
     */
    pulsarRequiredContent?: () => string;
    /**
     * Returns classes of its title, instead of the default ones.
     *
     * @returns The classes.
     */
    pulsarRequiredTitle?: () => string;
    /**
     * Returns classes of its description, instead of the default ones.
     *
     * @returns The classes.
     */
    pulsarRequiredDescription?: () => string;
    /**
     * Returns classes of the transaction history wrapper, added to the default ones.
     *
     * @returns The classes.
     */
    transactionsHistoryWrapper?: () => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Container animation variants (`initial`, `animate`, `exit`) */
    container?: Variants;
    /** Variants of the "Pulsar adapter required" state */
    error?: Variants;
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
    /** Animation of the "Pulsar adapter required" state */
    error?: {
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
     * Called when `@tuwaio/nova-transactions` fails to load or its `TransactionsHistory` throws.
     *
     * @param packageName - `config.packageName`.
     * @param error - The error.
     */
    onPackageLoadingFailure?: (packageName: string, error: Error) => void;
  };
  /** Configuration options */
  config?: {
    /** Renders without Framer Motion (default: `false`) */
    disableAnimation?: boolean;
    /** Same as `disableAnimation` (default: `false`) */
    reduceMotion?: boolean;
    /** Name passed to `handlers.onPackageLoadingFailure` (default: `@tuwaio/nova-transactions`) */
    packageName?: string;
    /** Custom aria labels for different states */
    ariaLabels?: {
      /** ARIA label of the container, after the `aria-label` prop (default: the `transactionsInApp` label) */
      transactionsHistory?: string;
    };
  };
  /**
   * Customization for the TransactionsHistory component (from @tuwaio/nova-transactions).
   * Passed through to the dynamically loaded component.
   */
  transactionsHistory?: LocalTransactionsHistoryCustomization;
};

/**
 * Props for the {@link ConnectedModalTxHistory} component. Without `transactionPool` and `pulsarAdapter` (Pulsar)
 * the "Pulsar adapter required" state is shown. Other props are passed to the container.
 */
export interface ConnectedModalTxHistoryProps extends Pick<
  NovaConnectProviderProps,
  'transactionPool' | 'pulsarAdapter'
> {
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** ARIA label of the container (default: the `transactionsInApp` label) */
  'aria-label'?: string;
  /** Customization options */
  customization?: ConnectedModalTxHistoryCustomization;
  /** Pagination state for infinite scroll, forwarded to TransactionsHistory. */
  pagination?: LocalTxPagination;
}

// Loaded on the first render of the history, in a chunk of its own
const TransactionsHistory = lazy(() =>
  import('@tuwaio/nova-transactions').then((module) => ({ default: module.TransactionsHistory })),
);

// --- Default Sub-Components ---
const DefaultLoadingContainer: React.FC<ConnectedModalTxHistoryLoadingContainerProps> = ({
  labels,
  className,
  classNames,
}) => {
  return (
    <div
      className={cn(
        'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-8 novacon:gap-4',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'novacon:animate-spin novacon:rounded-full novacon:h-8 novacon:w-8 novacon:border-2 novacon:border-[var(--tuwa-text-accent)] novacon:border-t-transparent',
          classNames?.spinner,
        )}
      />
      <p className={cn('novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]', classNames?.text)}>
        {labels.loading} {labels.transactionsInApp.toLowerCase()}...
      </p>
    </div>
  );
};

const DefaultErrorContainer: React.FC<ConnectedModalTxHistoryErrorContainerProps> = ({ className, classNames }) => {
  const labels = useNovaConnectLabels();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:text-center novacon:gap-4 novacon:p-6',
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={cn(
          'novacon:w-12 novacon:h-12 novacon:p-2 novacon:rounded-full novacon:bg-[var(--tuwa-warning-bg)] novacon:text-[var(--tuwa-warning-text)]',
          classNames?.iconContainer,
        )}
      >
        <ExclamationTriangleIcon className={cn('novacon:w-full novacon:h-full', classNames?.icon)} />
      </div>

      <div className={cn('novacon:space-y-2', classNames?.content)}>
        <h2
          className={cn(
            'novacon:text-lg novacon:font-semibold novacon:font-mono novacon:text-[var(--tuwa-text-primary)]',
            classNames?.title,
          )}
        >
          {labels.transactionHistoryNotAvailable}
        </h2>
        <p
          className={cn(
            'novacon:text-sm novacon:text-[var(--tuwa-text-secondary)] novacon:max-w-md',
            classNames?.description,
          )}
        >
          {labels.transactionHistoryLoadError}
        </p>
      </div>
    </motion.div>
  );
};

const DefaultNoWalletContainer: React.FC<ConnectedModalTxHistoryNoWalletContainerProps> = ({
  className,
  classNames,
}) => {
  const labels = useNovaConnectLabels();
  return (
    <div
      className={cn('novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-6', className)}
      role="status"
    >
      <p className={cn('novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]', classNames?.text)}>
        {labels.walletNotConnected}
      </p>
    </div>
  );
};

const DefaultTransactionsHistoryWrapper: React.FC<ConnectedModalTxHistoryTransactionsHistoryWrapperProps> = ({
  children,
  activeConnectionAddress,
  labels,
  className,
}) => {
  return (
    <div
      className={cn('novacon:w-full', className)}
      aria-label={formatLabel(labels.transactionsInAppFor, { address: activeConnectionAddress })}
    >
      {children}
    </div>
  );
};

/**
 * Pulsar adapter required fallback component
 */
function PulsarAdapterRequired({
  labels,
  customization,
}: {
  labels: Record<string, string>;
  customization?: ConnectedModalTxHistoryCustomization;
}) {
  const containerClasses =
    customization?.classNames?.pulsarRequiredContainer?.() ??
    'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:text-center novacon:gap-4 novacon:p-6';
  const iconContainerClasses =
    customization?.classNames?.pulsarRequiredIconContainer?.() ??
    'novacon:w-12 novacon:h-12 novacon:p-2 novacon:rounded-full novacon:bg-gradient-to-r novacon:from-[var(--tuwa-button-gradient-from)] novacon:to-[var(--tuwa-button-gradient-to)] novacon:text-[var(--tuwa-text-on-accent)]';
  const iconClasses = customization?.classNames?.pulsarRequiredIcon?.() ?? 'novacon:w-full novacon:h-full';
  const contentClasses = customization?.classNames?.pulsarRequiredContent?.() ?? 'novacon:space-y-2';
  const titleClasses =
    customization?.classNames?.pulsarRequiredTitle?.() ??
    'novacon:text-lg novacon:font-semibold novacon:font-mono novacon:text-[var(--tuwa-text-primary)]';
  const descriptionClasses =
    customization?.classNames?.pulsarRequiredDescription?.() ??
    'novacon:text-sm novacon:text-[var(--tuwa-text-secondary)] novacon:max-w-md novacon:leading-relaxed';

  const errorVariants = customization?.variants?.error || DEFAULT_ERROR_ANIMATION_VARIANTS;
  const disableAnimation = customization?.config?.disableAnimation || customization?.config?.reduceMotion;

  const content = (
    <div className={containerClasses} role="alert">
      <div className={iconContainerClasses}>
        <PuzzlePieceIcon className={iconClasses} />
      </div>

      <div className={contentClasses}>
        <h2 className={titleClasses}>{labels.pulsarAdapterRequired}</h2>
        <p className={descriptionClasses}>{labels.pulsarAdapterDescription}</p>
      </div>
    </div>
  );

  if (disableAnimation) {
    return content;
  }

  return (
    <motion.div
      variants={errorVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: customization?.animation?.error?.duration ?? 0.2,
        ease: customization?.animation?.error?.ease ?? 'easeOut',
        delay: customization?.animation?.error?.delay ?? 0,
      }}
    >
      {content}
    </motion.div>
  );
}

/**
 * Simple Error Boundary component for handling TransactionsHistory loading errors
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('TransactionsHistory component failed to load:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * The transaction history screen of the connected modal: the `TransactionsHistory` of `@tuwaio/nova-transactions`
 * for the active address (loaded with a dynamic import, without the details view). Shows a loading state while the
 * package loads, an error state when it cannot be loaded, a "Pulsar adapter required" state without
 * `transactionPool` and `pulsarAdapter`, and a message without a connected wallet.
 *
 * Props: {@link ConnectedModalTxHistoryProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { ConnectedModalTxHistory } from '@tuwaio/nova-connect/components';
 * import type { NovaConnectProviderProps } from '@tuwaio/nova-connect/hooks';
 *
 * type HistoryProps = Pick<NovaConnectProviderProps, 'transactionPool' | 'pulsarAdapter'>;
 *
 * export function History({ transactionPool, pulsarAdapter }: HistoryProps) {
 *   return (
 *     <ConnectedModalTxHistory
 *       transactionPool={transactionPool}
 *       pulsarAdapter={pulsarAdapter}
 *       customization={{
 *         classNames: { loadingContainer: () => 'bg-blue-100' },
 *         handlers: {
 *           onPackageLoadingFailure: (packageName, error) => console.error(packageName, error),
 *         },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const ConnectedModalTxHistory = forwardRef<HTMLDivElement, ConnectedModalTxHistoryProps>(
  (
    { transactionPool, pulsarAdapter, className, 'aria-label': ariaLabel, customization, pagination, ...props },
    ref,
  ) => {
    const labels = useNovaConnectLabels();
    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);

    // Extract custom components and config
    const {
      LoadingContainer = DefaultLoadingContainer,
      ErrorContainer = DefaultErrorContainer,
      NoWalletContainer = DefaultNoWalletContainer,
      TransactionsHistoryWrapper = DefaultTransactionsHistoryWrapper,
    } = customization?.components ?? {};

    const {
      disableAnimation = false,
      reduceMotion = false,
      packageName = '@tuwaio/nova-transactions',
      ariaLabels,
    } = customization?.config ?? {};

    /**
     * Memoized check for active wallet availability
     */
    /**
     * Check for active wallet availability
     */
    const hasActiveWallet = Boolean(activeConnection?.isConnected);

    /**
     * Check for adapter availability
     */
    const hasValidAdapter = Boolean(transactionPool && pulsarAdapter);

    /**
     * Generate container classes with custom generator
     */
    /**
     * Generate container classes with custom generator
     */
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ hasActiveWallet, hasValidAdapter })
      : cn('novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-4', className);

    /**
     * Error handler callbacks
     */
    const handlePackageLoadingFailure = useCallback(
      (error: Error) => {
        if (customization?.handlers?.onPackageLoadingFailure) {
          customization.handlers.onPackageLoadingFailure(packageName, error);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customization?.handlers?.onPackageLoadingFailure, packageName],
    );

    /**
     * Animation variants
     */
    const containerVariants = customization?.variants?.container || DEFAULT_CONTAINER_ANIMATION_VARIANTS;

    /**
     * Merge container props
     */
    /**
     * Merge container props
     */
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      'aria-label': ariaLabel || ariaLabels?.transactionsHistory || `${labels.transactionsInApp}`,
    };

    /**
     * Loading component with customization
     */
    /**
     * Loading component with customization
     */
    const loadingComponent = (
      <LoadingContainer
        labels={labels}
        className={customization?.classNames?.loadingContainer?.()}
        classNames={{
          spinner: customization?.classNames?.loadingSpinner?.(),
          text: customization?.classNames?.loadingText?.(),
        }}
      />
    );

    /**
     * Error fallback component with customization
     */
    const errorComponent = (
      <ErrorContainer
        className={customization?.classNames?.errorContainer?.()}
        classNames={{
          iconContainer: customization?.classNames?.errorIconContainer?.(),
          icon: customization?.classNames?.errorIcon?.(),
          content: customization?.classNames?.errorContent?.(),
          title: customization?.classNames?.errorTitle?.(),
          description: customization?.classNames?.errorDescription?.(),
        }}
      />
    );

    /**
     * No wallet component with customization
     */
    const noWalletComponent = (
      <NoWalletContainer
        className={customization?.classNames?.noWalletContainer?.()}
        classNames={{
          text: customization?.classNames?.noWalletText?.(),
        }}
      />
    );

    const content = (() => {
      // Early return if no active wallet
      if (!hasActiveWallet) {
        return noWalletComponent;
      }

      if (hasValidAdapter && transactionPool && pulsarAdapter) {
        return (
          <Suspense fallback={loadingComponent}>
            <ErrorBoundary fallback={errorComponent} onError={handlePackageLoadingFailure}>
              <TransactionsHistoryWrapper
                activeConnectionAddress={activeConnection!.address}
                transactionPool={transactionPool}
                pulsarAdapter={pulsarAdapter}
                labels={labels}
                className={customization?.classNames?.transactionsHistoryWrapper?.()}
              >
                <TransactionsHistory
                  transactionsPool={transactionPool}
                  adapter={pulsarAdapter}
                  connectedWalletAddress={activeConnection!.address}
                  className="novacon:w-full"
                  customization={customization?.transactionsHistory}
                  pagination={pagination}
                  canViewDetails={false}
                />
              </TransactionsHistoryWrapper>
            </ErrorBoundary>
          </Suspense>
        );
      }

      return <PulsarAdapterRequired labels={labels} customization={customization} />;
    })();

    if (disableAnimation || reduceMotion) {
      return <div {...containerProps}>{content}</div>;
    }

    return (
      <motion.div
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
      </motion.div>
    );
  },
);

ConnectedModalTxHistory.displayName = 'ConnectedModalTxHistory';
