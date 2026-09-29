/**
 * @file IconButton component with comprehensive customization options for wallet and chain interactions.
 */

import { ChevronArrowWithAnim, cn, NetworkIcon } from '@tuwaio/nova-core';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { type Easing, motion, type Variants } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode, useCallback } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { WalletIcon } from '../WalletIcon';

// --- Default Motion Variants ---
const DEFAULT_BUTTON_ANIMATION_VARIANTS: Variants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
  loading: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: 'linear' } },
};

// --- Types for Customization ---
/**
 * Props for a custom wallet icon container (rendered when `walletName` is set).
 */
export type IconButtonWalletIconContainerProps = {
  /** The `walletName` prop */
  walletName?: string;
  /** The `walletIcon` prop */
  walletIcon?: string;
  /** The `loading` prop */
  showLoading: boolean;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** Classes from `classNames.walletIconContainer`, added to the defaults */
  className?: string;
};

/**
 * Props for a custom chain icon container (rendered when `walletChainId` is set).
 */
export type IconButtonChainIconContainerProps = {
  /** Chain ID for `NetworkIcon` (a string chain ID becomes `solana:<chainId>`, or `config.chainIdFormatter` output) */
  chainId: string | number;
  /** The `walletChainId` prop */
  walletChainId?: string | number;
  /** Classes from `classNames.chainIconContainer`, added to the defaults */
  className?: string;
};

/**
 * Props for a custom chevron container (rendered when the button is clickable).
 */
export type IconButtonChevronContainerProps = {
  /** The `isOpen` prop */
  isOpen: boolean;
  /** Classes from `classNames.chevronContainer`, added to the defaults */
  className?: string;
};

/**
 * Props for a custom loading overlay (the default one shows a spinner while `loading` is `true`).
 */
export type IconButtonLoadingOverlayProps = {
  /** The `loading` prop */
  loading: boolean;
  /** Classes from `classNames.loadingOverlay`, added to the defaults */
  className?: string;
};

/**
 * Props for a custom button content (the default one renders the four elements in order).
 */
export type IconButtonContentProps = {
  /** The wallet icon container, or `null` */
  walletIconContainer: ReactNode;
  /** The chain icon container, or `null` */
  chainIconContainer: ReactNode;
  /** The chevron container, or `null` */
  chevronContainer: ReactNode;
  /** The loading overlay, or `null` when `config.showLoadingOverlay` is `false` */
  loadingOverlay: ReactNode;
  /** Whether the wallet icon is shown */
  hasWalletIcon: boolean;
  /** Whether the chain icon is shown */
  hasChainIcon: boolean;
  /** Whether the chevron is shown */
  hasChevron: boolean;
  /** The `loading` prop */
  loading: boolean;
  /** The `disabled` prop */
  disabled: boolean;
  /** Whether the button is clickable (`onClick` set, `items` above 1, not disabled or loading) */
  isClickable: boolean;
};

/**
 * Customization options of {@link IconButton}.
 */
export type IconButtonCustomization = {
  /** Props of the button element, applied last (they override the generated ones) */
  buttonProps?: Partial<
    Omit<
      ComponentPropsWithoutRef<'button'>,
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
    /** Custom wallet icon container component */
    WalletIconContainer?: ComponentType<IconButtonWalletIconContainerProps>;
    /** Custom chain icon container component */
    ChainIconContainer?: ComponentType<IconButtonChainIconContainerProps>;
    /** Custom chevron container component */
    ChevronContainer?: ComponentType<IconButtonChevronContainerProps>;
    /** Custom loading overlay component */
    LoadingOverlay?: ComponentType<IconButtonLoadingOverlayProps>;
    /** Custom button content wrapper component */
    ButtonContent?: ComponentType<IconButtonContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the button, instead of the default ones and the `className` prop.
     *
     * @param params - The button state.
     * @param params.isClickable - Whether the button is clickable.
     * @param params.disabled - The `disabled` prop.
     * @param params.loading - The `loading` prop.
     * @param params.hasMultipleIcons - Whether more than one of the wallet icon, chain icon and chevron is shown.
     * @returns The classes.
     */
    button?: (params: {
      isClickable: boolean;
      disabled: boolean;
      loading: boolean;
      hasMultipleIcons: boolean;
    }) => string;
    /**
     * Returns classes added to the wallet icon container.
     *
     * @param params - The icon state.
     * @param params.showLoading - The `loading` prop.
     * @param params.hasWalletIcon - Always `true` (the container is rendered only with a wallet icon).
     * @returns The classes.
     */
    walletIconContainer?: (params: { showLoading: boolean; hasWalletIcon: boolean }) => string;
    /**
     * Returns classes added to the chain icon container.
     *
     * @param params - The icon state.
     * @param params.hasChainIcon - Always `true` (the container is rendered only with a chain icon).
     * @returns The classes.
     */
    chainIconContainer?: (params: { hasChainIcon: boolean }) => string;
    /**
     * Returns classes added to the chevron container.
     *
     * @param params - The chevron state.
     * @param params.isOpen - The `isOpen` prop.
     * @param params.isClickable - Always `true` (the chevron is rendered only on a clickable button).
     * @returns The classes.
     */
    chevronContainer?: (params: { isOpen: boolean; isClickable: boolean }) => string;
    /**
     * Returns classes added to the loading overlay.
     *
     * @param params - The loading state.
     * @param params.loading - The `loading` prop.
     * @returns The classes.
     */
    loadingOverlay?: (params: { loading: boolean }) => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Button variants `idle`, `hover`, `tap` and `loading` */
    button?: Variants;
  };
  /** Custom animation configuration */
  animation?: {
    /** Button animation configuration */
    button?: {
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
     * Wraps the click of a clickable button: call `originalHandler()` to run the `onClick` prop.
     *
     * @param originalHandler - Runs the `onClick` prop.
     * @param event - The click event.
     */
    onClick?: (originalHandler: () => void, event: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Called when the pointer enters or leaves the button.
     *
     * @param isHovering - `true` on enter, `false` on leave.
     * @param event - The mouse event.
     */
    onHover?: (isHovering: boolean, event: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Called when the button gets focus.
     *
     * @param event - The focus event.
     */
    onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
    /**
     * Called when the button loses focus.
     *
     * @param event - The focus event.
     */
    onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  };
  /** Custom aria labels and accessibility */
  accessibility?: {
    /**
     * Returns the ARIA label, before the `aria-label` prop (default: a description such as `MetaMask wallet, button`).
     *
     * @param params - The button state.
     * @param params.walletName - The `walletName` prop.
     * @param params.walletChainId - The `walletChainId` prop.
     * @param params.isClickable - Whether the button is clickable.
     * @param params.loading - The `loading` prop.
     * @param params.disabled - The `disabled` prop.
     * @returns The label.
     */
    ariaLabel?: (params: {
      walletName?: string;
      walletChainId?: string | number;
      isClickable: boolean;
      loading: boolean;
      disabled: boolean;
    }) => string;
    /**
     * Returns the `title`, before the `title` prop (default: an English description of the button).
     *
     * @param params - The button state.
     * @param params.walletName - The `walletName` prop.
     * @param params.walletChainId - The `walletChainId` prop.
     * @param params.isClickable - Whether the button is clickable.
     * @param params.loading - The `loading` prop.
     * @param params.disabled - The `disabled` prop.
     * @returns The tooltip.
     */
    tooltip?: (params: {
      walletName?: string;
      walletChainId?: string | number;
      isClickable: boolean;
      loading: boolean;
      disabled: boolean;
    }) => string;
    /** `role` of the button (default: `button`) */
    role?: string;
    /** `aria-describedby` of the button */
    ariaDescribedBy?: string;
  };
  /** Configuration options */
  config?: {
    /** Renders a plain button without Framer Motion (default: `false`) */
    disableAnimation?: boolean;
    /** Same as `disableAnimation` (default: `false`) */
    reduceMotion?: boolean;
    /**
     * Formats `walletChainId` for the network icon, instead of the default (a string becomes `solana:<chainId>`).
     *
     * @param chainId - The `walletChainId` prop.
     * @returns The chain ID for `NetworkIcon` of `@tuwaio/nova-core`.
     */
    chainIdFormatter?: (chainId: string | number) => string | number;
    /** Whether to show the wallet icon when `walletName` is set (default: `true`) */
    showWalletIcon?: boolean;
    /** Whether to show the chain icon when `walletChainId` is set (default: `true`) */
    showChainIcon?: boolean;
    /** Whether to show the chevron on a clickable button (default: `true`) */
    showChevron?: boolean;
    /** Whether to render the loading overlay (default: `true`) */
    showLoadingOverlay?: boolean;
    /** `data-testid` of the button (default: `icon-button`) */
    buttonTestId?: string;
  };
};

/**
 * Props for the {@link IconButton} component.
 */
export interface IconButtonProps {
  /** Custom icon URL for the wallet */
  walletIcon?: string;
  /** Name of the wallet (shows the wallet icon) */
  walletName?: string;
  /** Chain ID for the network icon: an EVM chain ID, or a Solana cluster moniker such as `devnet` */
  walletChainId?: string | number;
  /** Number of available options; the button is clickable and shows a chevron only above 1 (default: `0`) */
  items?: number;
  /** Click handler, called only when the button is clickable */
  onClick?: () => void;
  /** Classes added to the default button classes (ignored when `classNames.button` is set) */
  className?: string;
  /** Whether the button is currently disabled (default: `false`) */
  disabled?: boolean;
  /** Shows the loading overlay and disables the button (default: `false`) */
  loading?: boolean;
  /** ARIA label of the button (default: an English description) */
  'aria-label'?: string;
  /** Custom tooltip text */
  title?: string;
  /** Whether chevron should show as open (default: `false`) */
  isOpen?: boolean;
  /** Custom button id */
  id?: string;
  /** Customization options */
  customization?: IconButtonCustomization;
}

// --- Default Sub-Components ---
const DefaultWalletIconContainer: React.FC<IconButtonWalletIconContainerProps> = ({
  walletName,
  walletIcon,
  showLoading,
  labels,
  className,
}) => {
  if (!walletName) return null;

  return (
    <div className={cn('novacon:flex-shrink-0 novacon:leading-[0]', className)}>
      <WalletIcon
        name={walletName}
        icon={walletIcon}
        altText={`${walletName} ${labels.walletIcon}`}
        showLoading={showLoading}
      />
    </div>
  );
};

const DefaultChainIconContainer: React.FC<IconButtonChainIconContainerProps> = ({
  chainId,
  walletChainId,
  className,
}) => {
  const labels = useNovaConnectLabels();
  return (
    <div
      className={cn('novacon:flex-shrink-0 novacon:leading-[0]', className)}
      title={formatLabel(labels.networkWithId, { chainId: walletChainId ?? '' })}
    >
      <NetworkIcon chainId={chainId} className="novacon:w-6 novacon:h-6" />
    </div>
  );
};

const DefaultChevronContainer: React.FC<IconButtonChevronContainerProps> = ({ isOpen, className }) => {
  return (
    <div className={cn('novacon:flex-shrink-0 novacon:leading-[0]', className)}>
      <ChevronArrowWithAnim isOpen={isOpen} className="novacon:w-4 novacon:h-4" aria-hidden="true" />
    </div>
  );
};

const DefaultLoadingOverlay: React.FC<IconButtonLoadingOverlayProps> = ({ loading, className }) => {
  if (!loading) return null;

  return (
    <div
      className={cn(
        'novacon:absolute novacon:inset-0 novacon:bg-[var(--tuwa-bg-primary)]/50 novacon:rounded-full novacon:flex novacon:items-center novacon:justify-center',
        className,
      )}
      aria-hidden="true"
    >
      <div className="novacon:w-3 novacon:h-3 novacon:border-2 novacon:border-[var(--tuwa-text-accent)] novacon:border-t-transparent novacon:rounded-full novacon:animate-spin" />
    </div>
  );
};

const DefaultButtonContent: React.FC<IconButtonContentProps> = ({
  walletIconContainer,
  chainIconContainer,
  chevronContainer,
  loadingOverlay,
}) => {
  return (
    <>
      {walletIconContainer}
      {chainIconContainer}
      {chevronContainer}
      {loadingOverlay}
    </>
  );
};

/**
 * A round button with a wallet icon and/or a network icon, used by the connected modal to open the connections and
 * network screens. It is clickable, with a chevron, only when `onClick` is set and `items` is above 1.
 *
 * Props: {@link IconButtonProps}; the ref is forwarded to the button.
 *
 * @example
 * ```tsx
 * import { IconButton } from '@tuwaio/nova-connect/components';
 *
 * export const NetworkButton = (
 *   <IconButton
 *     walletChainId="devnet"
 *     items={3}
 *     onClick={() => console.log('open the network list')}
 *     customization={{
 *       classNames: {
 *         chevronContainer: ({ isOpen }) => (isOpen ? 'chevron-open' : 'chevron-closed'),
 *       },
 *       animation: { button: { duration: 0.3, ease: 'easeOut' } },
 *     }}
 *   />
 * );
 * ```
 */
export const IconButton = forwardRef<Omit<HTMLButtonElement, 'style'>, IconButtonProps>(
  (
    {
      walletIcon,
      walletName,
      walletChainId,
      items = 0,
      onClick,
      className,
      disabled = false,
      loading = false,
      'aria-label': ariaLabel,
      title,
      isOpen = false,
      id,
      customization,
    },
    ref,
  ) => {
    const labels = useNovaConnectLabels();

    // Extract custom components and config
    const {
      WalletIconContainer = DefaultWalletIconContainer,
      ChainIconContainer = DefaultChainIconContainer,
      ChevronContainer = DefaultChevronContainer,
      LoadingOverlay = DefaultLoadingOverlay,
      ButtonContent = DefaultButtonContent,
    } = customization?.components ?? {};

    const {
      showWalletIcon = true,
      showChainIcon = true,
      showChevron = true,
      showLoadingOverlay = true,
      buttonTestId = 'icon-button',
      chainIdFormatter,
      disableAnimation = false,
      reduceMotion = false,
    } = customization?.config ?? {};

    /**
     * Determine if the button should be interactive
     */
    const isClickable = Boolean(onClick && !disabled && !loading && items > 1);

    /**
     * Generate chain ID for Web3Icon with custom formatting
     */
    const formattedChainId = (() => {
      if (!walletChainId) return undefined;

      if (chainIdFormatter) {
        return chainIdFormatter(walletChainId);
      }

      // If it's a string, assume it's a Solana network identifier
      if (typeof walletChainId === 'string') {
        return `${OrbitAdapter.SOLANA}:${walletChainId}`;
      }

      // If it's a number, use it directly as EVM chain ID
      return walletChainId;
    })();

    /**
     * Check which icons are present
     */
    const hasWalletIcon = Boolean(walletName && showWalletIcon);
    const hasChainIcon = Boolean(formattedChainId && showChainIcon);
    const hasChevron = Boolean(isClickable && showChevron);
    const hasMultipleIcons = [hasWalletIcon, hasChainIcon, hasChevron].filter(Boolean).length > 1;

    /**
     * Generate accessible label with custom generator
     */
    const accessibleLabel = (() => {
      const customAriaLabel = customization?.accessibility?.ariaLabel;
      if (customAriaLabel) {
        return customAriaLabel({
          walletName,
          walletChainId,
          isClickable,
          loading,
          disabled,
        });
      }

      if (ariaLabel) return ariaLabel;

      const parts: string[] = [];

      if (walletName) parts.push(formatLabel(labels.walletWithName, { name: walletName }));
      if (walletChainId) parts.push(labels.networkSelector);
      if (isClickable) parts.push(labels.buttonRole);
      if (loading) parts.push(labels.loadingState);
      if (disabled) parts.push(labels.disabledState);

      return parts.join(', ') || labels.walletControls;
    })();

    /**
     * Generate tooltip text with custom generator
     */
    const tooltipText = (() => {
      const customTooltip = customization?.accessibility?.tooltip;
      if (customTooltip) {
        return customTooltip({
          walletName,
          walletChainId,
          isClickable,
          loading,
          disabled,
        });
      }

      if (title) return title;
      if (loading) return `${labels.loading}...`;
      if (disabled) return labels.buttonDisabled;
      if (isClickable) {
        return walletName ? formatLabel(labels.selectWalletOptions, { name: walletName }) : labels.selectOptions;
      }
      return walletName ? formatLabel(labels.walletWithName, { name: walletName }) : labels.walletInformation;
    })();

    /**
     * Generate button classes with custom generator
     */
    const buttonClasses = customization?.classNames?.button
      ? customization.classNames.button({
          isClickable,
          disabled,
          loading,
          hasMultipleIcons,
        })
      : cn(
          // Base styles
          'novacon:flex novacon:items-center novacon:justify-center novacon:gap-1 novacon:rounded-full novacon:leading-[0]',
          'novacon:bg-[var(--tuwa-bg-primary)] novacon:border novacon:border-[var(--tuwa-border-primary)]',
          'novacon:p-1.5 novacon:transition-all novacon:duration-200 novacon:relative',

          // Icon sizing
          'novacon:[&_svg]:w-6! novacon:[&_svg]:h-6! novacon:[&_svg]:transition-transform novacon:[&_svg]:duration-200 novacon:[&_img]:w-6! novacon:[&_img]:h-6! novacon:[&_img]:transition-transform novacon:[&_img]:duration-200',

          // Interactive states
          {
            'novacon:cursor-pointer novacon:hover:[&_svg]:scale-95 novacon:active:[&_svg]:scale-85 novacon:hover:[&_img]:scale-95 novacon:active:[&_img]:scale-85 novacon:hover:shadow-sm':
              isClickable,
            'novacon:cursor-not-allowed novacon:opacity-50': disabled && !loading,
            'novacon:cursor-wait novacon:opacity-75': loading,
            'novacon:cursor-default': !isClickable && !disabled && !loading,
          },

          // Focus states for accessibility
          'novacon:focus-visible:outline-none novacon:focus-visible:ring-[length:var(--tuwa-ring-width)] novacon:focus-visible:ring-[var(--tuwa-border-accent)] novacon:focus-visible:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus-visible:ring-offset-[var(--tuwa-border-secondary)]',

          className,
        );

    /**
     * Event handlers with customization support
     */
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isClickable && onClick) {
          const originalHandler = () => onClick();

          const customClickHandler = customization?.handlers?.onClick;
          if (customClickHandler) {
            customClickHandler(originalHandler, event);
          } else {
            originalHandler();
          }
        }
      },
      [isClickable, onClick, customization?.handlers?.onClick],
    );

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const customHoverHandler = customization?.handlers?.onHover;
        if (customHoverHandler) {
          customHoverHandler(true, event);
        }
      },
      [customization?.handlers?.onHover],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const customHoverHandler = customization?.handlers?.onHover;
        if (customHoverHandler) {
          customHoverHandler(false, event);
        }
      },
      [customization?.handlers?.onHover],
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        const customFocusHandler = customization?.handlers?.onFocus;
        if (customFocusHandler) {
          customFocusHandler(event);
        }
      },
      [customization?.handlers?.onFocus],
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        const customBlurHandler = customization?.handlers?.onBlur;
        if (customBlurHandler) {
          customBlurHandler(event);
        }
      },
      [customization?.handlers?.onBlur],
    );

    /**
     * Generate child components
     */
    /**
     * Generate child components
     */
    const walletIconContainer = (() => {
      if (!hasWalletIcon) return null;

      const walletIconCustomClasses = customization?.classNames?.walletIconContainer;

      return (
        <WalletIconContainer
          walletName={walletName}
          walletIcon={walletIcon}
          showLoading={loading}
          labels={labels}
          className={walletIconCustomClasses?.({
            showLoading: loading,
            hasWalletIcon,
          })}
        />
      );
    })();

    const chainIconContainer = (() => {
      if (!hasChainIcon || !formattedChainId) return null;

      const chainIconCustomClasses = customization?.classNames?.chainIconContainer;

      return (
        <ChainIconContainer
          chainId={formattedChainId}
          walletChainId={walletChainId}
          className={chainIconCustomClasses?.({ hasChainIcon })}
        />
      );
    })();

    const chevronContainer = (() => {
      if (!hasChevron) return null;
      const chevronCustomClasses = customization?.classNames?.chevronContainer;
      return <ChevronContainer isOpen={isOpen} className={chevronCustomClasses?.({ isOpen, isClickable })} />;
    })();

    const loadingOverlay = (() => {
      if (!showLoadingOverlay) return null;
      const loadingCustomClasses = customization?.classNames?.loadingOverlay;
      return <LoadingOverlay loading={loading} className={loadingCustomClasses?.({ loading })} />;
    })();

    /**
     * Animation variants
     */
    const buttonVariants = customization?.variants?.button || DEFAULT_BUTTON_ANIMATION_VARIANTS;

    /**
     * Base button props without motion-specific properties
     */
    const baseButtonProps = {
      type: 'button' as const,
      id,
      className: buttonClasses,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled: disabled || loading,
      'aria-label': accessibleLabel,
      'aria-describedby': customization?.accessibility?.ariaDescribedBy,
      title: tooltipText,
      role: customization?.accessibility?.role || 'button',
      tabIndex: disabled || loading ? -1 : 0,
      'data-testid': buttonTestId,
      ...customization?.buttonProps,
    };

    const buttonContent = (
      <ButtonContent
        walletIconContainer={walletIconContainer}
        chainIconContainer={chainIconContainer}
        chevronContainer={chevronContainer}
        loadingOverlay={loadingOverlay}
        hasWalletIcon={hasWalletIcon}
        hasChainIcon={hasChainIcon}
        hasChevron={hasChevron}
        loading={loading}
        disabled={disabled}
        isClickable={isClickable}
      />
    );

    if (disableAnimation || reduceMotion) {
      return (
        <button ref={ref as React.ForwardedRef<HTMLButtonElement>} {...baseButtonProps}>
          {buttonContent}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        {...baseButtonProps}
        variants={buttonVariants}
        initial="idle"
        whileHover={isClickable ? 'hover' : 'idle'}
        whileTap={isClickable ? 'tap' : 'idle'}
        animate={loading ? 'loading' : 'idle'}
        transition={{
          duration: customization?.animation?.button?.duration ?? 0.2,
          ease: customization?.animation?.button?.ease ?? 'easeInOut',
          delay: customization?.animation?.button?.delay ?? 0,
        }}
      >
        {buttonContent}
      </motion.button>
    );
  },
);

IconButton.displayName = 'IconButton';
