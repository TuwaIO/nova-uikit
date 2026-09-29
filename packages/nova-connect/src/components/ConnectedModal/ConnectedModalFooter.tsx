/**
 * @file ConnectedModalFooter component with comprehensive customization options and wallet control actions.
 */

import { cn, standardButtonClasses } from '@tuwaio/nova-core';
import { getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import { motion, type Variants } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode, useCallback } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';
import { useSatelliteConnectStore } from '../../satellite';

// --- Default Motion Variants ---
const DEFAULT_PATH_ANIMATION_VARIANTS: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

// --- Types for Customization ---
/**
 * Props for a custom disconnect button.
 */
export type ConnectedModalFooterDisconnectButtonProps = {
  /**
   * Disconnects all wallets (through the disconnect handlers) and closes the modal.
   *
   * @param event - The click event.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** The Nova Connect labels, with `labels.disconnectText` applied */
  labels: Record<string, string>;
  /** Classes from `classNames.disconnectButton`, added to `standardButtonClasses` of `@tuwaio/nova-core` */
  className?: string;
  /** `config.disconnectButtonTestId` or `disconnect-button` */
  'data-testid'?: string;
  /** `disconnect-description` */
  'aria-describedby'?: string;
  /** Number of connected wallets (the default button says "Disconnect all" when there are several) */
  connectionsCount: number;
};

/**
 * Props for a custom explorer link.
 */
export type ConnectedModalFooterExplorerLinkProps = {
  /** Explorer page of the active address, or `config.explorerUrlFallback` */
  href: string;
  /** The Nova Connect labels, with `labels.explorerText` applied */
  labels: Record<string, string>;
  /** The active address */
  walletAddress: string;
  /** Whether the chain has an explorer (the default link is a disabled button otherwise) */
  isValidUrl: boolean;
  /** Classes from `classNames.explorerLink`, added to `standardButtonClasses` of `@tuwaio/nova-core` */
  className?: string;
  /** `config.explorerLinkTestId` or `explorer-link` */
  'data-testid'?: string;
  /** `explorer-description` */
  'aria-describedby'?: string;
  /**
   * Calls `handlers.onExplorerClick`; the link still opens in a new tab.
   *
   * @param event - The click event.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Props for a custom footer content (the default one renders the two elements side by side).
 */
export type ConnectedModalFooterContentProps = {
  /** The disconnect button, or `null` when `config.showDisconnectButton` is `false` */
  disconnectButton: ReactNode;
  /** The explorer link, or `null` when `config.showExplorerLink` is `false` */
  explorerLink: ReactNode;
  /** Whether the chain has an explorer */
  isValidExplorerUrl: boolean;
  /** The active address */
  walletAddress: string;
  /** The Nova Connect labels, with the custom labels applied */
  labels: Record<string, string>;
};

/**
 * Customization options of {@link ConnectedModalFooter}.
 */
export type ConnectedModalFooterCustomization = {
  /** Props of the `footer` element (the component props, `className`, `role` and `aria-label` take precedence) */
  containerProps?: Partial<ComponentPropsWithoutRef<'footer'>>;
  /** Custom components */
  components?: {
    /** Custom disconnect button component */
    DisconnectButton?: ComponentType<ConnectedModalFooterDisconnectButtonProps>;
    /** Custom explorer link component */
    ExplorerLink?: ComponentType<ConnectedModalFooterExplorerLinkProps>;
    /** Custom footer content component (wraps everything) */
    FooterContent?: ComponentType<ConnectedModalFooterContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the footer, instead of the default ones and the `className` prop.
     *
     * @param params - The footer state.
     * @param params.isValidExplorerUrl - Whether the chain has an explorer.
     * @param params.walletAddress - The active address.
     * @returns The classes.
     */
    container?: (params: { isValidExplorerUrl: boolean; walletAddress: string }) => string;
    /**
     * Returns classes added to the disconnect button.
     *
     * @returns The classes.
     */
    disconnectButton?: () => string;
    /**
     * Returns classes added to the explorer link.
     *
     * @param params - The link state.
     * @param params.isValidUrl - Whether the chain has an explorer.
     * @param params.disabled - Whether the link is disabled (no explorer).
     * @returns The classes.
     */
    explorerLink?: (params: { isValidUrl: boolean; disabled?: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the disconnect: call `originalHandler()` to disconnect all wallets (`disconnect` of the Satellite store)
     * and close the modal.
     *
     * @param originalHandler - Disconnects and closes the modal.
     * @param event - The click event.
     */
    onDisconnectClick?: (originalHandler: () => void, event: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Called when the explorer link is clicked; the link still opens in a new tab.
     *
     * @param explorerUrl - The explorer page.
     * @param walletAddress - The active address.
     * @param event - The click event.
     */
    onExplorerClick?: (explorerUrl: string, walletAddress: string, event: React.MouseEvent<HTMLAnchorElement>) => void;
    /**
     * Called before the disconnect. Return `false` to cancel.
     *
     * @returns Whether to disconnect.
     */
    onBeforeDisconnect?: () => boolean | Promise<boolean>;
    /** Called right after the disconnect starts (it does not wait for the wallets) */
    onAfterDisconnect?: () => void;
  };
  /** Custom text and aria labels */
  labels?: {
    /** Text of the disconnect button with one connected wallet (default: the `disconnect` label) */
    disconnectText?: string;
    /** Text of the explorer link (default: the `viewOnExplorer` label) */
    explorerText?: string;
    /** ARIA label of the footer, after the `aria-label` prop (default: the `walletControls` label) */
    footerAriaLabel?: string;
  };
  /** Configuration options */
  config?: {
    /** Whether to show disconnect button (default: `true`) */
    showDisconnectButton?: boolean;
    /** Whether to show explorer link (default: `true`) */
    showExplorerLink?: boolean;
    /** `data-testid` of the disconnect button (default: `disconnect-button`) */
    disconnectButtonTestId?: string;
    /** `data-testid` of the explorer link (default: `explorer-link`) */
    explorerLinkTestId?: string;
    /** Whether to close modal after disconnect (default: `true`) */
    closeModalAfterDisconnect?: boolean;
    /** `href` passed to the explorer link when the chain has no explorer; the link is disabled then (default: `#`) */
    explorerUrlFallback?: string;
  };
};

/**
 * Props for the {@link ConnectedModalFooter} component. Other props are passed to the `footer` element.
 */
export interface ConnectedModalFooterProps {
  /**
   * Opens or closes the connected modal (called with `false` after the disconnect).
   *
   * @param isOpen - Whether the modal is open.
   */
  setIsOpen: (isOpen: boolean) => void;
  /** Classes added to the default footer classes (ignored when `classNames.container` is set) */
  className?: string;
  /** ARIA label of the footer (default: the `walletControls` label) */
  'aria-label'?: string;
  /** Customization options */
  customization?: ConnectedModalFooterCustomization;
}

// --- Default Sub-Components ---
const DefaultDisconnectButton: React.FC<
  ConnectedModalFooterDisconnectButtonProps & Omit<ComponentPropsWithoutRef<'button'>, 'onClick' | 'style'>
> = ({
  onClick,
  labels,
  className,
  'data-testid': testId,
  'aria-describedby': ariaDescribedBy,
  connectionsCount,
  ...props
}) => {
  const iconPath =
    'M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15';

  return (
    <button
      type="button"
      className={cn(standardButtonClasses, className)}
      onClick={onClick}
      aria-describedby={ariaDescribedBy}
      data-testid={testId}
      {...props}
    >
      <DefaultFooterIcon pathData={iconPath} className="novacon:w-5 novacon:h-5" />
      <span id={ariaDescribedBy} className="novacon:sr-only">
        {labels.disconnectAllDescription}
      </span>
      {connectionsCount > 1 ? labels.disconnectAll : labels.disconnect}
    </button>
  );
};

const DefaultExplorerLink: React.FC<
  ConnectedModalFooterExplorerLinkProps &
    Omit<ComponentPropsWithoutRef<'a'>, 'onClick' | 'style'> &
    Pick<ComponentPropsWithoutRef<'button'>, 'type'>
> = ({
  href,
  labels,
  walletAddress,
  isValidUrl,
  className,
  'data-testid': testId,
  'aria-describedby': ariaDescribedBy,
  onClick,
  type,
  ...props
}) => {
  const iconPath =
    'M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25';

  if (isValidUrl) {
    return (
      <a
        href={href}
        className={cn(standardButtonClasses, className)}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
        onClick={onClick}
        {...props}
      >
        <span className="novacon:flex novacon:items-center novacon:gap-2">
          {labels.viewOnExplorer}
          <DefaultFooterIcon pathData={iconPath} className="novacon:w-4 novacon:h-4" />
        </span>
        <span id={ariaDescribedBy} className="novacon:sr-only">
          {formatLabel(labels.explorerLinkDescription, { address: walletAddress })}
        </span>
      </a>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      className={cn(standardButtonClasses, 'novacon:opacity-50 novacon:cursor-not-allowed', className)}
      disabled
      aria-describedby={ariaDescribedBy}
      title={labels.explorerNotAvailable}
    >
      <span className="novacon:flex novacon:items-center novacon:gap-2">
        {labels.viewOnExplorer}
        <DefaultFooterIcon pathData={iconPath} className="novacon:w-4 novacon:h-4" isAnimated={false} />
      </span>
      <span id={ariaDescribedBy} className="novacon:sr-only">
        {labels.explorerNotAvailable}
      </span>
    </button>
  );
};

// Icon of the default buttons: an SVG path, drawn with an animation unless `isAnimated` is `false`
const DefaultFooterIcon: React.FC<{ pathData: string; className: string; isAnimated?: boolean }> = ({
  pathData,
  className,
  isAnimated = true,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    {isAnimated ? (
      <motion.path
        d={pathData}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={DEFAULT_PATH_ANIMATION_VARIANTS}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: 'easeInOut', delay: 0 }}
      />
    ) : (
      <path d={pathData} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const DefaultFooterContent: React.FC<Pick<ConnectedModalFooterContentProps, 'disconnectButton' | 'explorerLink'>> = ({
  disconnectButton,
  explorerLink,
}) => {
  return (
    <>
      {disconnectButton}
      {explorerLink}
    </>
  );
};

/**
 * The footer of the connected modal: a button that disconnects all wallets (`disconnect` of the Satellite store) and
 * closes the modal, and a link to the active address on the block explorer of its chain (opens in a new tab; a
 * disabled button when the chain has no explorer). Renders nothing without an active connection.
 *
 * Props: {@link ConnectedModalFooterProps}; the ref is forwarded to the `footer` element.
 *
 * @example
 * ```tsx
 * import { ConnectedModalFooter } from '@tuwaio/nova-connect/components';
 * import { useNovaConnect } from '@tuwaio/nova-connect/hooks';
 *
 * export function Footer() {
 *   const { setIsConnectedModalOpen } = useNovaConnect();
 *
 *   return (
 *     <ConnectedModalFooter
 *       setIsOpen={setIsConnectedModalOpen}
 *       customization={{
 *         classNames: {
 *           explorerLink: ({ isValidUrl }) => (isValidUrl ? 'explorer-active' : 'explorer-disabled'),
 *         },
 *         handlers: {
 *           onBeforeDisconnect: () => window.confirm('Disconnect all wallets?'),
 *         },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const ConnectedModalFooter = forwardRef<HTMLElement, ConnectedModalFooterProps>(
  ({ setIsOpen, className, 'aria-label': ariaLabel, customization, ...props }, ref) => {
    const labels = useNovaConnectLabels();

    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
    const connections = useSatelliteConnectStore((store) => store.connections);
    const getAdapter = useSatelliteConnectStore((store) => store.getAdapter);
    const disconnect = useSatelliteConnectStore((store) => store.disconnect);

    // Extract custom components and config
    const {
      DisconnectButton = DefaultDisconnectButton,
      ExplorerLink = DefaultExplorerLink,
      FooterContent = DefaultFooterContent,
    } = customization?.components ?? {};

    const {
      showDisconnectButton = true,
      showExplorerLink = true,
      disconnectButtonTestId = 'disconnect-button',
      explorerLinkTestId = 'explorer-link',
      closeModalAfterDisconnect = true,
      explorerUrlFallback = '#',
    } = customization?.config ?? {};

    // Custom labels
    const finalLabels = {
      ...labels,
      ...(customization?.labels && {
        disconnect: customization.labels.disconnectText ?? labels.disconnect,
        viewOnExplorer: customization.labels.explorerText ?? labels.viewOnExplorer,
        walletControls: customization.labels.footerAriaLabel ?? labels.walletControls,
      }),
    };

    /**
     * Generate explorer URL for the current wallet address
     * Memoized to prevent unnecessary recalculations
     */
    /**
     * Generate explorer URL for the current wallet address
     */
    const explorerUrl = (() => {
      if (!activeConnection) return explorerUrlFallback;

      try {
        const adapter = getAdapter(getAdapterFromConnectorType(activeConnection.connectorType));
        return (
          adapter?.getExplorerUrl(`/address/${activeConnection.address}`, activeConnection.chainId) ||
          explorerUrlFallback
        );
      } catch (error) {
        console.warn('Failed to generate explorer URL:', error);
        return explorerUrlFallback;
      }
    })();

    /**
     * Check if explorer URL is valid for link functionality
     */
    const isValidExplorerUrl = explorerUrl !== '#' && explorerUrl !== explorerUrlFallback;

    /**
     * Handle wallet disconnection with custom hooks
     */
    const handleDisconnect = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        try {
          // Custom before disconnect handler
          if (customization?.handlers?.onBeforeDisconnect) {
            const shouldProceed = await customization.handlers.onBeforeDisconnect();
            if (!shouldProceed) return;
          }

          // Custom disconnect click handler
          const originalHandler = () => {
            disconnect();
            if (closeModalAfterDisconnect) {
              setIsOpen(false);
            }
          };

          if (customization?.handlers?.onDisconnectClick) {
            customization.handlers.onDisconnectClick(originalHandler, event);
          } else {
            originalHandler();
          }

          // Custom after disconnect handler
          if (customization?.handlers?.onAfterDisconnect) {
            customization.handlers.onAfterDisconnect();
          }
        } catch (error) {
          console.error('Error during disconnect:', error);
        }
      },
      [disconnect, setIsOpen, customization, closeModalAfterDisconnect],
    );

    /**
     * Handle explorer link click with custom handler
     */
    const handleExplorerClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (customization?.handlers?.onExplorerClick && activeConnection) {
          customization.handlers.onExplorerClick(explorerUrl, activeConnection.address, event);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customization?.handlers?.onExplorerClick, explorerUrl, activeConnection?.address],
    );

    // Generate container classes
    const containerClasses =
      customization?.classNames?.container && activeConnection
        ? customization.classNames.container({
            isValidExplorerUrl,
            walletAddress: activeConnection.address,
          })
        : cn(
            'novacon:flex novacon:flex-wrap novacon:gap-4 novacon:w-full novacon:items-center novacon:justify-between novacon:border-t novacon:border-[var(--tuwa-border-primary)] novacon:p-4 novacon:flex-col-reverse novacon:sm:flex-row',
            className,
          );

    // Generate disconnect button element
    const disconnectButtonElement =
      showDisconnectButton && activeConnection ? (
        <DisconnectButton
          onClick={handleDisconnect}
          labels={finalLabels}
          className={customization?.classNames?.disconnectButton?.()}
          data-testid={disconnectButtonTestId}
          aria-describedby="disconnect-description"
          connectionsCount={Object.keys(connections).length}
        />
      ) : null;

    // Generate explorer link element
    const explorerLinkElement =
      showExplorerLink && activeConnection ? (
        <ExplorerLink
          href={explorerUrl}
          labels={finalLabels}
          walletAddress={activeConnection.address}
          isValidUrl={isValidExplorerUrl}
          className={customization?.classNames?.explorerLink?.({
            isValidUrl: isValidExplorerUrl,
            disabled: !isValidExplorerUrl,
          })}
          data-testid={explorerLinkTestId}
          aria-describedby="explorer-description"
          onClick={handleExplorerClick}
        />
      ) : null;

    // Merge container props
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'contentinfo' as const,
      'aria-label': ariaLabel || finalLabels.walletControls,
    };

    // Early return if no active wallet
    if (!activeConnection) return null;

    return (
      <footer {...containerProps}>
        <FooterContent
          disconnectButton={disconnectButtonElement}
          explorerLink={explorerLinkElement}
          isValidExplorerUrl={isValidExplorerUrl}
          walletAddress={activeConnection.address}
          labels={finalLabels}
        />
      </footer>
    );
  },
);

ConnectedModalFooter.displayName = 'ConnectedModalFooter';
