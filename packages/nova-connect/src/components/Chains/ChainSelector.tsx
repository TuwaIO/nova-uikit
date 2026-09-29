/**
 * @file ChainSelector component - A highly customizable chain selector with support for desktop and mobile devices.
 */

import * as Select from '@radix-ui/react-select';
import {
  ChevronArrowWithAnim,
  CloseIcon,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  getChainName,
  NetworkIcon,
} from '@tuwaio/nova-core';
import { formatConnectorChainId, getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import React, { ComponentPropsWithoutRef, ComponentType, ReactNode, useCallback } from 'react';

import { useNovaConnect, useNovaConnectLabels, useWalletChainsList } from '../../hooks';
import { useSatelliteConnectStore } from '../../satellite';
import { InitialChains } from '../../types';
import { SelectContentAnimated, SelectContentAnimatedProps } from '../SelectContentAnimated';
import { ChainListRenderer, ChainListRendererCustomization } from './ChainListRenderer';
import { ScrollableChainList, ScrollableChainListCustomization } from './ScrollableChainList';

/**
 * Context for the chain selection trigger button.
 */
export type ChainSelectorTriggerButtonContext = {
  /** The currently formatted chain ID */
  currentFormattedChainId: string | number;
  /** Value for the Select component */
  selectValue: string;
  /** Whether the chain list is open */
  isChainsListOpen: boolean;
  /** Whether the device is mobile */
  isMobile: boolean;
  /** The name of the chain */
  chainName: string;
};

/**
 * Props for a custom trigger icon component.
 */
export type ChainSelectorTriggerIconProps = {
  /** Chain ID */
  chainId: string | number;
  /** CSS class */
  className?: string;
  /** Whether hidden from screen readers */
  'aria-hidden'?: boolean;
};

/**
 * Props for a custom trigger content component.
 */
export type ChainSelectorTriggerContentProps = {
  /** Chain icon */
  icon: ReactNode;
  /** Chain name */
  chainName: string;
  /** Whether the device is mobile */
  isMobile: boolean;
  /** Whether the list is open */
  isOpen: boolean;
  /** The currently formatted chain ID */
  currentFormattedChainId: string | number;
};

/**
 * Props for a custom trigger arrow component.
 */
export type ChainSelectorTriggerArrowProps = {
  /** Whether the list is open */
  isOpen: boolean;
  /** CSS class */
  className?: string;
  /** Whether hidden from screen readers */
  'aria-hidden'?: boolean;
};

/**
 * Props for a custom display for a single chain (when no selector is needed).
 */
export type ChainSelectorSingleChainDisplayProps = {
  /** Chain ID */
  chainId: string | number;
  /** Chain name */
  chainName: string;
  /** CSS class */
  className?: string;
  /** ARIA label */
  'aria-label': string;
};

/**
 * Props for a custom desktop selector wrapper.
 */
export type ChainSelectorDesktopSelectorProps = {
  /** Child elements */
  children: ReactNode;
  /** CSS class */
  className?: string;
  /** ARIA label */
  'aria-label': string;
};

/**
 * Props for a custom mobile selector wrapper.
 */
export type ChainSelectorMobileSelectorProps = {
  /** Child elements */
  children: ReactNode;
  /** CSS class */
  className?: string;
  /** ARIA label */
  'aria-label': string;
};

/**
 * Props for a custom close button component.
 */
export type ChainSelectorCloseButtonProps = {
  /** Close handler */
  onClose: () => void;
  /** CSS class */
  className?: string;
  /** ARIA label */
  'aria-label': string;
  /** Icon element */
  icon: ReactNode;
};

/**
 * Props for a custom dialog header component.
 */
export type ChainSelectorDialogHeaderProps = {
  /** Title text */
  title: string;
  /** Close handler */
  onClose: () => void;
  /** CSS class */
  className?: string;
  /** Close button customization */
  closeButton?: {
    /** Close button component */
    Component?: ComponentType<ChainSelectorCloseButtonProps>;
    /** Close button props */
    props?: Partial<ComponentPropsWithoutRef<'button'>>;
    /** Close button classes */
    className?: string;
    /** Close button icon classes */
    iconClassName?: string;
  };
};

/**
 * Customization options for the ChainTriggerButton.
 */
export type ChainTriggerButtonCustomization = {
  /** Overrides for the button/trigger props */
  buttonProps?: Partial<ComponentPropsWithoutRef<'button'>>;
  /** Overrides for the Select.Trigger props (desktop only) */
  selectTriggerProps?: Partial<ComponentPropsWithoutRef<typeof Select.Trigger>>;
  /** Custom component overrides */
  components?: {
    /** Custom chain icon component */
    Icon?: ComponentType<ChainSelectorTriggerIconProps>;
    /** Custom trigger content wrapper */
    Content?: ComponentType<ChainSelectorTriggerContentProps>;
    /** Custom arrow/chevron component */
    Arrow?: ComponentType<ChainSelectorTriggerArrowProps>;
  };
  /** Custom CSS class generators */
  classNames?: {
    /**
     * Returns the classes of the wrapper `div`, instead of the default ones.
     *
     * @param params - The trigger state.
     * @param params.isMobile - Whether this is the mobile trigger.
     * @param params.isOpen - Whether the chain list is open.
     * @returns The classes.
     */
    wrapper?: (params: { isMobile: boolean; isOpen: boolean }) => string;
    /**
     * Returns the classes of the trigger button, instead of the default ones.
     *
     * @param params - The trigger state.
     * @param params.isMobile - Whether this is the mobile trigger.
     * @param params.isOpen - Whether the chain list is open.
     * @param params.hasMultipleChains - Whether more than one chain is available (always `true`: with one chain,
     * `ChainSelector` renders no trigger).
     * @returns The classes.
     */
    button?: (params: { isMobile: boolean; isOpen: boolean; hasMultipleChains: boolean }) => string;
    /**
     * Returns the classes of the content inside the button, instead of the default ones.
     *
     * @param params - The trigger state.
     * @param params.isMobile - Whether this is the mobile trigger.
     * @param params.isOpen - Whether the chain list is open.
     * @returns The classes.
     */
    innerContent?: (params: { isMobile: boolean; isOpen: boolean }) => string;
    /**
     * Returns the classes of the arrow wrapper (empty by default).
     *
     * @param params - The trigger state.
     * @param params.isMobile - Whether this is the mobile trigger.
     * @returns The classes.
     */
    arrowWrapper?: (params: { isMobile: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the click handler of the mobile trigger: call `originalHandler()` to open the chain dialog. The desktop
     * trigger opens its list through Radix Select.
     *
     * @param originalHandler - Opens the chain list.
     * @param event - The click event.
     * @param context - State of the trigger.
     */
    onClick?: (
      originalHandler: () => void,
      event: React.MouseEvent<HTMLButtonElement>,
      context: ChainSelectorTriggerButtonContext,
    ) => void;
    /**
     * Wraps the key handler: call `originalHandler(event)` to toggle the list on Enter and Space and to close it on
     * Escape.
     *
     * @param originalHandler - The default handler.
     * @param event - The keyboard event.
     * @param context - State of the trigger.
     */
    onKeyDown?: (
      originalHandler: (event: React.KeyboardEvent) => void,
      event: React.KeyboardEvent,
      context: ChainSelectorTriggerButtonContext,
    ) => void;
  };
};

/**
 * Comprehensive customization options for the ChainSelector.
 */
export type ChainSelectorCustomization = {
  /** Custom component overrides */
  components?: {
    /** Custom component for displaying a single chain */
    SingleChainDisplay?: ComponentType<ChainSelectorSingleChainDisplayProps>;
    /** Custom wrapper for the desktop selector */
    DesktopSelector?: ComponentType<ChainSelectorDesktopSelectorProps>;
    /** Custom wrapper for the mobile selector */
    MobileSelector?: ComponentType<ChainSelectorMobileSelectorProps>;
    /** Custom dialog header component */
    DialogHeader?: ComponentType<ChainSelectorDialogHeaderProps>;
  };
  /** Custom CSS class generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the `className` prop.
     *
     * @param params - The selector state.
     * @param params.hasMultipleChains - Whether more than one chain is available.
     * @returns The classes.
     */
    container?: (params: { hasMultipleChains: boolean }) => string;
    /**
     * Returns the classes of the desktop wrapper, instead of the default ones (hidden below the `sm` breakpoint).
     *
     * @param params - The selector state.
     * @param params.chainCount - Number of available chains.
     * @returns The classes.
     */
    desktopWrapper?: (params: { chainCount: number }) => string;
    /**
     * Returns the classes of the mobile wrapper, instead of the default ones (hidden from the `sm` breakpoint).
     *
     * @param params - The selector state.
     * @param params.chainCount - Number of available chains.
     * @returns The classes.
     */
    mobileWrapper?: (params: { chainCount: number }) => string;
    /** Classes for the single chain display */
    singleChainDisplay?: () => string;
    /**
     * Returns the classes of the mobile dialog content, instead of the default ones.
     *
     * @param params - The selector state.
     * @param params.chainCount - Number of available chains.
     * @returns The classes.
     */
    dialogContent?: (params: { chainCount: number }) => string;
    /** Classes for the dialog inner container */
    dialogInnerContainer?: () => string;
    /** Classes for the dialog header */
    dialogHeader?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the chain change: call `originalHandler(newChainId)` to run `switchNetwork` of the Satellite store (the
     * wallet may ask to confirm).
     *
     * @param originalHandler - Switches the network of the active connection.
     * @param newChainId - The selected chain ID (formatted as the connector expects).
     */
    onChainChange?: (originalHandler: (newChainId: string) => void, newChainId: string) => void;
    /**
     * Wraps the close button of the mobile dialog: call `originalHandler()` to close the dialog.
     *
     * @param originalHandler - Closes the dialog.
     */
    onDialogClose?: (originalHandler: () => void) => void;
  };
  /** Dialog header customization */
  dialogHeader?: {
    /** Close button customization */
    closeButton?: {
      /** Close button props */
      props?: Partial<ComponentPropsWithoutRef<'button'>>;
      /** Close button classes */
      className?: string;
      /** Close button icon classes */
      iconClassName?: string;
    };
  };
  /** Customization for sub-components */
  triggerButton?: ChainTriggerButtonCustomization;
  /** Customization for the Select content */
  selectContent?: Partial<SelectContentAnimatedProps>;
  /** Customization for the chain list renderer (desktop) */
  chainListRenderer?: ChainListRendererCustomization;
  /** Customization for the scrollable chain list (mobile) */
  scrollableChainList?: ScrollableChainListCustomization;
};

/**
 * Props for the ChainTriggerButton component.
 */
interface ChainTriggerButtonProps {
  /** The currently formatted chain ID */
  currentFormattedChainId: string | number;
  /** The value of the select component */
  selectValue: string;
  /** Whether the chain list is currently open */
  isChainsListOpen: boolean;
  /** Function to toggle the visibility of the chain list */
  onToggle: () => void;
  /** Whether it's displayed on a mobile device */
  isMobile: boolean;
  /** Whether multiple chains are available */
  hasMultipleChains?: boolean;
  /** Customization options */
  customization?: ChainTriggerButtonCustomization;
}

// --- Default Components ---

/**
 * Default trigger icon.
 */
const DefaultTriggerIcon = ({ chainId, className, ...props }: ChainSelectorTriggerIconProps) => {
  return <NetworkIcon chainId={chainId} className={className} {...props} />;
};

/**
 * Default trigger content.
 */
const DefaultTriggerContent = ({ icon, chainName, isMobile }: ChainSelectorTriggerContentProps) => {
  return (
    <div className="novacon:flex novacon:items-center novacon:sm:space-x-2 novacon:[&_svg]:w-6 novacon:[&_svg]:h-6">
      <div aria-hidden="true">{icon}</div>
      {isMobile ? (
        <span className="novacon:hidden novacon:sm:inline-block novacon:sr-only novacon:sm:not-sr-only">
          {chainName}
        </span>
      ) : (
        <Select.Value className="novacon:hidden novacon:sm:inline-block novacon:sr-only novacon:sm:not-sr-only">
          {chainName}
        </Select.Value>
      )}
    </div>
  );
};

/**
 * Default trigger arrow.
 */
const DefaultTriggerArrow = ({ isOpen, className, ...props }: ChainSelectorTriggerArrowProps) => {
  return <ChevronArrowWithAnim isOpen={isOpen} className={className} {...props} />;
};

/**
 * Default display for a single chain.
 */
const DefaultSingleChainDisplay = ({
  chainId,
  chainName,
  className,
  'aria-label': ariaLabel,
}: ChainSelectorSingleChainDisplayProps) => {
  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <NetworkIcon chainId={chainId ?? ''} />
      <span className="novacon:sr-only">{chainName}</span>
    </div>
  );
};

/**
 * Default desktop selector wrapper.
 */
const DefaultDesktopSelector = ({
  children,
  className,
  'aria-label': ariaLabel,
}: ChainSelectorDesktopSelectorProps) => {
  return (
    <div className={className} role="region" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

/**
 * Default mobile selector wrapper.
 */
const DefaultMobileSelector = ({ children, className, 'aria-label': ariaLabel }: ChainSelectorMobileSelectorProps) => {
  return (
    <div className={className} role="region" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

/**
 * Default close button component.
 */
const DefaultCloseButton = ({ onClose, className, 'aria-label': ariaLabel, icon }: ChainSelectorCloseButtonProps) => {
  return (
    <button type="button" aria-label={ariaLabel} className={className} onClick={onClose}>
      {icon}
    </button>
  );
};

/**
 * Default dialog header component.
 */
const DefaultDialogHeader = ({ title, onClose, className, closeButton }: ChainSelectorDialogHeaderProps) => {
  const labels = useNovaConnectLabels();

  const {
    Component: CloseButtonComponent = DefaultCloseButton,
    props: closeButtonProps,
    className: closeButtonClassName,
    iconClassName: closeIconClassName,
  } = closeButton ?? {};

  const defaultCloseButtonClasses = cn(
    'novacon:cursor-pointer novacon:rounded-[var(--tuwa-rounded-corners)] novacon:p-1',
    'novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors',
    'novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]',
    'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
  );

  const finalCloseButtonClasses = closeButtonClassName || defaultCloseButtonClasses;

  const closeIconElement = <CloseIcon className={closeIconClassName} />;

  return (
    <DialogHeader className={className}>
      <DialogTitle>{title}</DialogTitle>
      <DialogClose asChild>
        <CloseButtonComponent
          onClose={onClose}
          className={finalCloseButtonClasses}
          aria-label={labels.closeModal}
          icon={closeIconElement}
          {...closeButtonProps}
        />
      </DialogClose>
    </DialogHeader>
  );
};

// --- Default Event Handlers ---

const defaultClickHandler = (
  originalHandler: () => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: React.MouseEvent<HTMLButtonElement>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: ChainSelectorTriggerButtonContext,
) => {
  originalHandler();
};

const defaultKeyDownHandler = (
  originalHandler: (event: React.KeyboardEvent) => void,
  event: React.KeyboardEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: ChainSelectorTriggerButtonContext,
) => {
  originalHandler(event);
};

const defaultChainChangeHandler = (originalHandler: (newChainId: string) => void, newChainId: string) => {
  originalHandler(newChainId);
};

const defaultDialogCloseHandler = (originalHandler: () => void) => {
  originalHandler();
};

/**
 * Trigger button component for chain selection.
 */
const ChainTriggerButton: React.FC<ChainTriggerButtonProps> = ({
  currentFormattedChainId,
  isChainsListOpen,
  onToggle,
  isMobile,
  hasMultipleChains = true,
  customization,
}) => {
  const labels = useNovaConnectLabels();
  const chainName = getChainName(currentFormattedChainId).name;

  const {
    Icon = DefaultTriggerIcon,
    Content = DefaultTriggerContent,
    Arrow = DefaultTriggerArrow,
  } = customization?.components ?? {};

  const { onClick: customClickHandler = defaultClickHandler, onKeyDown: customKeyDownHandler = defaultKeyDownHandler } =
    customization?.handlers ?? {};

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const context: ChainSelectorTriggerButtonContext = {
        currentFormattedChainId,
        selectValue: String(currentFormattedChainId),
        isChainsListOpen,
        isMobile,
        chainName,
      };

      const originalHandler = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
        if (e.key === 'Escape' && isChainsListOpen) {
          e.preventDefault();
          onToggle();
        }
      };

      customKeyDownHandler(originalHandler, event, context);
    },
    [customKeyDownHandler, currentFormattedChainId, isChainsListOpen, isMobile, chainName, onToggle],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const context: ChainSelectorTriggerButtonContext = {
        currentFormattedChainId,
        selectValue: String(currentFormattedChainId),
        isChainsListOpen,
        isMobile,
        chainName,
      };

      customClickHandler(onToggle, event, context);
    },
    [customClickHandler, currentFormattedChainId, isChainsListOpen, isMobile, chainName, onToggle],
  );

  // Generate classes directly without useMemo (React 19 auto-memoizes)
  const wrapperClasses = customization?.classNames?.wrapper
    ? customization.classNames.wrapper({ isMobile, isOpen: isChainsListOpen })
    : 'novacon:relative';

  const buttonClasses = customization?.classNames?.button
    ? customization.classNames.button({ isMobile, isOpen: isChainsListOpen, hasMultipleChains })
    : cn(
        'novacon:cursor-pointer novacon:inline-flex novacon:items-center novacon:justify-center novacon:min-h-[42px] novacon:py-1',
        'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:font-mono novacon:font-medium novacon:text-sm novacon:transition-all novacon:duration-200',
        'novacon:hover:scale-[1.02] novacon:active:scale-[0.98]',
        'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)] novacon:focus:ring-[var(--tuwa-text-secondary)]',
        'novacon:bg-[var(--tuwa-bg-secondary)] novacon:text-[var(--tuwa-text-primary)] novacon:hover:bg-[var(--tuwa-bg-muted)]',
        'novacon:[&_svg]:w-4 novacon:[&_svg]:h-4',
        'novacon:border novacon:border-[var(--tuwa-border-primary)]',
        {
          'novacon:ring-[length:var(--tuwa-ring-width)] novacon:ring-[var(--tuwa-text-secondary)]': isChainsListOpen,
        },
      );

  const innerContentClasses = customization?.classNames?.innerContent
    ? customization.classNames.innerContent({ isMobile, isOpen: isChainsListOpen })
    : 'novacon:inline-flex novacon:items-center novacon:justify-center novacon:gap-2 novacon:px-2 sm:novacon:px-4 novacon:min-w-[60px]';

  const arrowWrapperClasses = customization?.classNames?.arrowWrapper
    ? customization.classNames.arrowWrapper({ isMobile })
    : '';

  const iconElement = <Icon chainId={currentFormattedChainId} aria-hidden={true} />;
  const arrowElement = <Arrow isOpen={isChainsListOpen} aria-hidden={true} />;

  const ariaLabel = `${labels.chainSelector}: ${labels.currentChain} ${chainName}. ${labels.openChainSelector}`;
  const ariaExpanded = isChainsListOpen;
  const ariaHaspopup = 'listbox' as const;

  const mobileButtonProps = {
    ...customization?.buttonProps,
    type: 'button' as const,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    className: buttonClasses,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  const selectTriggerProps = {
    ...customization?.selectTriggerProps,
    'aria-label': ariaLabel,
    className: buttonClasses,
    onKeyDown: handleKeyDown,
  };

  return (
    <div className={wrapperClasses}>
      {isMobile ? (
        <button {...mobileButtonProps}>
          <div className={innerContentClasses}>
            <Content
              icon={iconElement}
              chainName={chainName}
              isMobile={isMobile}
              isOpen={isChainsListOpen}
              currentFormattedChainId={currentFormattedChainId}
            />
            <div className={arrowWrapperClasses} aria-hidden="true">
              {arrowElement}
            </div>
          </div>
        </button>
      ) : (
        <Select.Trigger {...selectTriggerProps}>
          <div className={innerContentClasses}>
            <Content
              icon={iconElement}
              chainName={chainName}
              isMobile={isMobile}
              isOpen={isChainsListOpen}
              currentFormattedChainId={currentFormattedChainId}
            />
            <Select.Icon asChild>
              <div className={arrowWrapperClasses} aria-hidden="true">
                {arrowElement}
              </div>
            </Select.Icon>
          </div>
        </Select.Trigger>
      )}
    </div>
  );
};

/**
 * Props for the ChainSelector component.
 */
export interface ChainSelectorProps extends InitialChains {
  /** Comprehensive customization options */
  customization?: ChainSelectorCustomization;
  /** Custom CSS classes for the main container */
  className?: string;
  /** Custom ARIA label for the selector */
  'aria-label'?: string;
}

/**
 * The main chain selector component.
 * Supports both desktop (dropdown) and mobile (dialog modal) interfaces.
 */
export function ChainSelector({
  appChains,
  solanaRPCUrls,
  customization,
  className,
  'aria-label': ariaLabel,
}: ChainSelectorProps) {
  const labels = useNovaConnectLabels();
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const switchNetwork = useSatelliteConnectStore((store) => store.switchNetwork);
  const { isChainsListOpen, setIsChainsListOpen, isChainsListOpenMobile, setIsChainsListOpenMobile } = useNovaConnect();

  const {
    SingleChainDisplay = DefaultSingleChainDisplay,
    DesktopSelector = DefaultDesktopSelector,
    MobileSelector = DefaultMobileSelector,
    DialogHeader = DefaultDialogHeader,
  } = customization?.components ?? {};

  const {
    onChainChange: customChainChangeHandler = defaultChainChangeHandler,
    onDialogClose: customDialogCloseHandler = defaultDialogCloseHandler,
  } = customization?.handlers ?? {};

  const { chainsList } = useWalletChainsList({
    activeConnection,
    appChains,
    solanaRPCUrls,
  });

  const containerClasses = customization?.classNames?.container
    ? customization.classNames.container({
        hasMultipleChains: chainsList.length > 1,
      })
    : className;

  const singleChainDisplayClasses = customization?.classNames?.singleChainDisplay
    ? customization.classNames.singleChainDisplay()
    : 'novacon:flex novacon:items-center novacon:space-x-2 novacon:[&_svg]:w-6 novacon:[&_svg]:h-6';

  const desktopWrapperClasses = customization?.classNames?.desktopWrapper
    ? customization.classNames.desktopWrapper({ chainCount: chainsList.length })
    : 'novacon:hidden novacon:sm:block';

  const mobileWrapperClasses = customization?.classNames?.mobileWrapper
    ? customization.classNames.mobileWrapper({ chainCount: chainsList.length })
    : 'novacon:sm:hidden';

  const dialogContentClasses = customization?.classNames?.dialogContent
    ? customization.classNames.dialogContent({ chainCount: chainsList.length })
    : cn('novacon:w-full novacon:sm:max-w-md');

  const dialogInnerContainerClasses = customization?.classNames?.dialogInnerContainer
    ? customization.classNames.dialogInnerContainer()
    : cn('novacon:relative novacon:flex novacon:w-full novacon:flex-col');

  const dialogHeaderClasses = customization?.classNames?.dialogHeader
    ? customization.classNames.dialogHeader()
    : undefined;

  const handleChainChange = useCallback(
    (newChainId: string) => {
      const originalHandler = async (chainId: string) => {
        await switchNetwork(chainId);
      };
      customChainChangeHandler(originalHandler, newChainId);
    },
    [switchNetwork, customChainChangeHandler],
  );

  const getChainData = useCallback(
    (chain: string | number) => {
      if (!activeConnection) return { formattedChainId: chain, chain };
      return {
        formattedChainId: formatConnectorChainId(chain, getAdapterFromConnectorType(activeConnection.connectorType)),
        chain,
      };
    },
    [activeConnection],
  );

  const handleDialogClose = useCallback(() => {
    const originalHandler = () => setIsChainsListOpenMobile(false);
    customDialogCloseHandler(originalHandler);
  }, [customDialogCloseHandler, setIsChainsListOpenMobile]);

  if (!activeConnection) return null;

  const currentFormattedChainId = formatConnectorChainId(
    activeConnection.chainId,
    getAdapterFromConnectorType(activeConnection.connectorType),
  );

  const selectValue = String(currentFormattedChainId);
  const chainName = getChainName(currentFormattedChainId).name;

  if (chainsList.length <= 1) {
    return (
      <SingleChainDisplay
        chainId={currentFormattedChainId}
        chainName={chainName}
        className={singleChainDisplayClasses}
        aria-label={`${labels.currentChain}: ${chainName}`}
      />
    );
  }

  const finalAriaLabel = ariaLabel || labels.chainSelector;

  return (
    <div className={containerClasses}>
      <DesktopSelector className={desktopWrapperClasses} aria-label={finalAriaLabel}>
        <Select.Root
          value={selectValue}
          onValueChange={handleChainChange}
          open={isChainsListOpen}
          onOpenChange={setIsChainsListOpen}
        >
          <ChainTriggerButton
            currentFormattedChainId={currentFormattedChainId}
            isChainsListOpen={isChainsListOpen}
            onToggle={() => setIsChainsListOpen(!isChainsListOpen)}
            selectValue={selectValue}
            isMobile={false}
            hasMultipleChains={chainsList.length > 1}
            customization={customization?.triggerButton}
          />
          <SelectContentAnimated className="novacon:w-[210px]" {...customization?.selectContent}>
            <ChainListRenderer
              chainsList={chainsList}
              selectValue={selectValue}
              handleValueChange={handleChainChange}
              getChainData={getChainData}
              onClose={() => setIsChainsListOpen(false)}
              isMobile={false}
              customization={customization?.chainListRenderer}
            />
          </SelectContentAnimated>
        </Select.Root>
      </DesktopSelector>

      <MobileSelector className={mobileWrapperClasses} aria-label={finalAriaLabel}>
        <ChainTriggerButton
          currentFormattedChainId={currentFormattedChainId}
          isChainsListOpen={isChainsListOpenMobile}
          onToggle={() => setIsChainsListOpenMobile(true)}
          selectValue={selectValue}
          isMobile={true}
          hasMultipleChains={chainsList.length > 1}
          customization={customization?.triggerButton}
        />

        <Dialog open={isChainsListOpenMobile} onOpenChange={setIsChainsListOpenMobile}>
          <DialogContent className={dialogContentClasses} aria-describedby="chain-selector-description">
            <div className={dialogInnerContainerClasses}>
              <DialogHeader
                title={labels.switchNetworks}
                onClose={handleDialogClose}
                className={dialogHeaderClasses}
                closeButton={customization?.dialogHeader?.closeButton}
              />

              <div id="chain-selector-description" className="novacon:sr-only">
                {labels.selectChain}
              </div>

              <ScrollableChainList
                chainsList={chainsList}
                selectValue={selectValue}
                handleValueChange={handleChainChange}
                getChainData={getChainData}
                onClose={() => setIsChainsListOpenMobile(false)}
                customization={customization?.scrollableChainList}
              />
            </div>
          </DialogContent>
        </Dialog>
      </MobileSelector>
    </div>
  );
}
