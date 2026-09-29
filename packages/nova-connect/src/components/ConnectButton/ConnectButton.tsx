import { cn } from '@tuwaio/nova-core';
import { BaseConnector } from '@tuwaio/satellite-core';
import { motion } from 'framer-motion';
import React, { ComponentPropsWithoutRef, ComponentType, forwardRef, memo, useCallback } from 'react';

import { NovaConnectProviderProps, useNovaConnect, useNovaConnectLabels } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { ChainSelector, ChainSelectorCustomization } from '../Chains/ChainSelector';
import { ConnectedContent, ConnectedContentCustomization } from './ConnectedContent';
import { WaitForConnectionContent, WaitForConnectionContentCustomization } from './WaitForConnectionContent';

/**
 * Connect button data for customization context
 */
export interface ConnectButtonData {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether balance should be shown */
  withBalance?: boolean;
  /** Whether chain selector should be shown */
  withChain?: boolean;
  /** Whether impersonated wallets are enabled */
  withImpersonated?: boolean;
  /** Current labels from i18n */
  labels: ReturnType<typeof useNovaConnectLabels>;
  /** Active wallet information */
  activeConnection: BaseConnector | undefined;
}

// --- Component Props Types ---
/**
 * Props of the outer element of {@link ConnectButton} (`customization.components.Navigation`, a `<nav>` by default).
 */
export type ConnectButtonNavigationProps = {
  /** Classes from `customization.classNames.navigation`. */
  className?: string;
  /** The container with the chain selector and the button. */
  children: React.ReactNode;
  /** Accessible label (`customization.config.ariaLabels.navigation`, or the `walletControls` label). */
  'aria-label'?: string;
  /** ARIA role. */
  role?: string;
  /** State of the button (connection, options, labels). */
  buttonData: ConnectButtonData;
} & React.RefAttributes<HTMLElement>;

/** Props of the container of the chain selector and the button (`customization.components.Container`). */
export type ConnectButtonContainerProps = {
  /** Classes from `customization.classNames.container`. */
  className?: string;
  /** The chain selector and the button. */
  children: React.ReactNode;
  /** State of the button (connection, options, labels). */
  buttonData: ConnectButtonData;
} & React.RefAttributes<HTMLDivElement>;

/** Props of the wrapper of the button (`customization.components.ButtonContainer`). */
export type ConnectButtonButtonContainerProps = {
  /** Classes from `customization.classNames.buttonContainer`. */
  className?: string;
  /** The button. */
  children: React.ReactNode;
  /** State of the button (connection, options, labels). */
  buttonData: ConnectButtonData;
} & React.RefAttributes<HTMLDivElement>;

/** Props of the button element (`customization.components.Button`). */
export type ConnectButtonButtonProps = {
  /** Classes from `customization.classNames.button`, or the default ones. */
  className?: string;
  /** The content: the connected wallet, or the connect prompt. */
  children: React.ReactNode;
  /** Opens the connect modal, or the connected modal when a wallet is connected. */
  onClick: () => void;
  /**
   * Runs `onClick` on Enter or Space.
   *
   * @param event - The keyboard event.
   */
  onKeyDown: (event: React.KeyboardEvent) => void;
  /** Accessible label (`customization.config.ariaLabels.button`, or labels of the connection state). */
  'aria-label'?: string;
  /** Whether a wallet is connected. */
  'aria-pressed'?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** State of the button (connection, options, labels). */
  buttonData: ConnectButtonData;
} & React.RefAttributes<HTMLButtonElement>;

/**
 * Customization options for ConnectButton component
 */
export type ConnectButtonCustomization = {
  /** Custom components */
  components?: {
    /** Custom navigation wrapper */
    Navigation?: ComponentType<ConnectButtonNavigationProps>;
    /** Custom container div */
    Container?: ComponentType<ConnectButtonContainerProps>;
    /** Custom button container with motion */
    ButtonContainer?: ComponentType<ConnectButtonButtonContainerProps>;
    /** Custom button element */
    Button?: ComponentType<ConnectButtonButtonProps>;
    /** Custom motion div */
    MotionDiv?: ComponentType<ComponentPropsWithoutRef<typeof motion.div>>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the outer element.
     *
     * @param params - The button state.
     * @param params.buttonData - State of the button.
     * @returns The classes.
     */
    navigation?: (params: { buttonData: ConnectButtonData }) => string;
    /**
     * Returns the classes of the container of the chain selector and the button.
     *
     * @param params - The button state.
     * @param params.buttonData - State of the button.
     * @returns The classes.
     */
    container?: (params: { buttonData: ConnectButtonData }) => string;
    /**
     * Returns the classes of the wrapper of the button.
     *
     * @param params - The button state.
     * @param params.buttonData - State of the button.
     * @returns The classes.
     */
    buttonContainer?: (params: { buttonData: ConnectButtonData }) => string;
    /**
     * Returns the classes of the button, instead of the default ones and `className`.
     *
     * @param params - The button state.
     * @param params.buttonData - State of the button.
     * @returns The classes.
     */
    button?: (params: { buttonData: ConnectButtonData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click handler: call `originalHandler()` to open the connect or connected modal.
     *
     * @param buttonData - State of the button.
     * @param originalHandler - The default handler.
     */
    onButtonClick?: (buttonData: ConnectButtonData, originalHandler: () => void) => void;
    /**
     * Wraps the key handler: call `originalHandler(event)` to run the default behavior (Enter and Space click).
     *
     * @param event - The keyboard event.
     * @param buttonData - State of the button.
     * @param originalHandler - The default handler.
     */
    onKeyDown?: (
      event: React.KeyboardEvent,
      buttonData: ConnectButtonData,
      originalHandler: (event: React.KeyboardEvent) => void,
    ) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the accessible label of the outer element.
       *
       * @param buttonData - State of the button.
       * @returns The label.
       */
      navigation?: (buttonData: ConnectButtonData) => string;
      /**
       * Returns the accessible label of the button.
       *
       * @param buttonData - State of the button.
       * @returns The label.
       */
      button?: (buttonData: ConnectButtonData) => string;
    };
    /** Animation configuration */
    animation?: {
      /** Layout transition duration */
      layoutDuration?: number;
      /** Layout transition easing */
      layoutEase?: [number, number, number, number];
      /** Disable animations */
      disabled?: boolean;
    };
  };
  /** Child component customizations */
  childComponents?: {
    /** ChainSelector customization */
    chainSelector?: ChainSelectorCustomization;
    /** ConnectedContent customization */
    connectedContent?: ConnectedContentCustomization;
    /** WaitForConnectionContent customization */
    waitForConnectionContent?: WaitForConnectionContentCustomization;
  };
};

// --- Default Sub-Components ---
const DefaultNavigation = forwardRef<HTMLElement, ConnectButtonNavigationProps>(
  ({ className, children, buttonData, ...props }, ref) => (
    <nav ref={ref} role="navigation" aria-label={buttonData.labels.walletControls} className={className} {...props}>
      {children}
    </nav>
  ),
);
DefaultNavigation.displayName = 'DefaultNavigation';

const DefaultContainer = forwardRef<HTMLDivElement, ConnectButtonContainerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, children, buttonData, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('novacon:flex novacon:items-center novacon:gap-2 novacon:sm:gap-3', className)}
      {...props}
    >
      {children}
    </div>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultButtonContainer = forwardRef<HTMLDivElement, ConnectButtonButtonContainerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, children, buttonData, ...props }, ref) => (
    <div ref={ref} className={cn('novacon:relative', className)} {...props}>
      {children}
    </div>
  ),
);
DefaultButtonContainer.displayName = 'DefaultButtonContainer';

const DefaultButton = forwardRef<HTMLButtonElement, ConnectButtonButtonProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, children, onClick, onKeyDown, buttonData, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      className={className}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </button>
  ),
);
DefaultButton.displayName = 'DefaultButton';

/**
 * Base props for ConnectButton component
 */
export type ConnectButtonProps = Pick<NovaConnectProviderProps, 'transactionPool'> & {
  /** CSS classes to apply to the button */
  className?: string;
  /** Customization options */
  customization?: ConnectButtonCustomization;
};

/**
 * The main button of Nova Connect. Without a connected wallet it shows the connect prompt
 * ({@link WaitForConnectionContent}) and opens the connect modal; with one it shows the connected wallet
 * ({@link ConnectedContent}: avatar, name, balance with `withBalance`, the status of the latest transaction from
 * `transactionPool`) and opens the connected modal. With `withChain`, a {@link ChainSelector} is shown next to it.
 * The options (`withBalance`, `withChain`, `appChains`, `solanaRPCUrls`) come from `NovaConnectProvider`, so the button
 * must be rendered inside it.
 *
 * Props: {@link ConnectButtonProps}.
 *
 * @example
 * ```tsx
 * import { ConnectButton } from '@tuwaio/nova-connect/components';
 *
 * export const Button = (
 *   <ConnectButton
 *     customization={{
 *       classNames: {
 *         button: ({ buttonData }) => (buttonData.isConnected ? 'custom-connected' : 'custom-disconnected'),
 *       },
 *     }}
 *   />
 * );
 * ```
 */
export const ConnectButton = memo<ConnectButtonProps>(({ className, transactionPool, customization = {} }) => {
  const labels = useNovaConnectLabels();

  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const {
    setIsConnectedModalOpen,
    setIsConnectModalOpen,
    withBalance,
    withChain,
    appChains,
    solanaRPCUrls,
    withImpersonated,
  } = useNovaConnect();

  const isConnected = Boolean(activeConnection?.isConnected);

  // Button data for customization context
  const buttonData: ConnectButtonData = {
    isConnected,
    labels,
    activeConnection,
    withChain,
    withBalance,
    withImpersonated,
  };

  // Extract customization options
  const { components = {}, classNames = {}, handlers = {}, config = {}, childComponents = {} } = customization;

  // Component selections with defaults
  const Navigation = components.Navigation || DefaultNavigation;
  const Container = components.Container || DefaultContainer;
  const ButtonContainer = components.ButtonContainer || DefaultButtonContainer;
  const Button = components.Button || DefaultButton;
  const CustomMotionDiv = components.MotionDiv || motion.div;

  /**
   * Handle button click with custom handler support
   */
  const handleConnectButtonClick = useCallback(() => {
    const originalHandler = () => {
      if (isConnected) {
        setIsConnectedModalOpen(true);
      } else {
        setIsConnectModalOpen(true);
      }
    };

    if (handlers.onButtonClick) {
      handlers.onButtonClick(buttonData, originalHandler);
    } else {
      originalHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, buttonData]);

  /**
   * Handle key down events with custom handler support
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const originalHandler = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleConnectButtonClick();
        }
      };

      if (handlers.onKeyDown) {
        handlers.onKeyDown(event, buttonData, originalHandler);
      } else {
        originalHandler(event);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleConnectButtonClick, buttonData],
  );

  // Button aria-label
  const buttonAriaLabel = config.ariaLabels?.button
    ? config.ariaLabels.button(buttonData)
    : isConnected
      ? `${labels.walletConnected}. ${labels.openWalletModal}`
      : `${labels.walletNotConnected}. ${labels.connectWallet}`;

  // Navigation aria-label
  const navigationAriaLabel = config.ariaLabels?.navigation
    ? config.ariaLabels.navigation(buttonData)
    : labels.walletControls;

  // Button class names
  const buttonClasses =
    classNames.button?.({ buttonData }) ||
    cn(
      'novacon:cursor-pointer novacon:inline-flex novacon:items-center novacon:justify-center novacon:gap-2 novacon:px-3 novacon:min-h-[42px] novacon:py-1',
      'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:font-mono novacon:font-medium novacon:text-sm novacon:transition-all novacon:duration-200',
      'novacon:hover:scale-[1.02] novacon:active:scale-[0.98]',
      'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)]',
      'novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
      'novacon:disabled:opacity-50 novacon:disabled:cursor-not-allowed novacon:disabled:hover:scale-100',
      isConnected
        ? [
            'novacon:bg-[var(--tuwa-bg-secondary)]',
            'novacon:text-[var(--tuwa-text-primary)]',
            'novacon:hover:bg-[var(--tuwa-bg-muted)]',
            'novacon:focus:ring-[var(--tuwa-text-secondary)]',
            'novacon:border novacon:border-[var(--tuwa-border-primary)]',
          ]
        : [
            'novacon:bg-[var(--tuwa-button-gradient-from)]',
            'novacon:text-[var(--tuwa-text-on-accent)]',
            'novacon:hover:bg-[var(--tuwa-button-gradient-from-hover)]',
            'novacon:focus:ring-[var(--tuwa-text-accent)]',
          ],
      className,
    );

  // Animation configuration
  const animationConfig = config.animation?.disabled
    ? {}
    : {
        layout: true,
        transition: {
          layout: {
            duration: config.animation?.layoutDuration ?? 0.2,
            ease: config.animation?.layoutEase ?? [0.1, 0.1, 0.2, 1],
          },
        },
      };

  return (
    <Navigation
      className={classNames.navigation?.({ buttonData })}
      aria-label={navigationAriaLabel}
      buttonData={buttonData}
    >
      <Container className={classNames.container?.({ buttonData })} buttonData={buttonData}>
        {/* Chain Selector - only show when connected and withChain is enabled */}
        {withChain && isConnected && (
          <ChainSelector
            appChains={appChains}
            solanaRPCUrls={solanaRPCUrls}
            customization={childComponents.chainSelector}
          />
        )}

        {/* Main Connect Button */}
        <CustomMotionDiv {...animationConfig}>
          <ButtonContainer className={classNames.buttonContainer?.({ buttonData })} buttonData={buttonData}>
            <Button
              onClick={handleConnectButtonClick}
              onKeyDown={handleKeyDown}
              className={buttonClasses}
              aria-label={buttonAriaLabel}
              aria-pressed={isConnected}
              buttonData={buttonData}
            >
              {isConnected ? (
                <ConnectedContent
                  withBalance={withBalance}
                  transactionPool={transactionPool}
                  customization={childComponents.connectedContent}
                />
              ) : (
                <WaitForConnectionContent customization={childComponents.waitForConnectionContent} />
              )}
            </Button>
          </ButtonContainer>
        </CustomMotionDiv>
      </Container>
    </Navigation>
  );
});

ConnectButton.displayName = 'ConnectButton';
