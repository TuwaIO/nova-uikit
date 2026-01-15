/**
 * @file ChainSelector component - A highly customizable chain selector with support for desktop and mobile devices.
 * @module ChainSelector
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
type ChainTriggerButtonContext = {
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
type CustomTriggerIconProps = {
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
type CustomTriggerContentProps = {
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
type CustomTriggerArrowProps = {
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
type CustomSingleChainDisplayProps = {
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
type CustomDesktopSelectorProps = {
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
type CustomMobileSelectorProps = {
  /** Child elements */
  children: ReactNode;
  /** CSS class */
  className?: string;
  /** ARIA label */
  'aria-label': string;
};

/**
 * Props for a custom dialog header component.
 */
type CustomDialogHeaderProps = {
  /** Title text */
  title: string;
  /** Close handler */
  onClose: () => void;
  /** CSS class */
  className?: string;
};

/**
 * Animation easing parameters for framer-motion.
 */
type AnimationEasing = [number, number, number, number] | string;

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
    Icon?: ComponentType<CustomTriggerIconProps>;
    /** Custom trigger content wrapper */
    Content?: ComponentType<CustomTriggerContentProps>;
    /** Custom arrow/chevron component */
    Arrow?: ComponentType<CustomTriggerArrowProps>;
  };
  /** Custom CSS class generators */
  classNames?: {
    /** Function to generate wrapper classes */
    wrapper?: (params: { isMobile: boolean; isOpen: boolean }) => string;
    /** Function to generate button/trigger classes */
    button?: (params: { isMobile: boolean; isOpen: boolean; hasMultipleChains: boolean }) => string;
    /** Function to generate inner content classes */
    innerContent?: (params: { isMobile: boolean; isOpen: boolean }) => string;
    /** Function to generate icon wrapper classes */
    iconWrapper?: (params: { isMobile: boolean }) => string;
    /** Function to generate chain name classes */
    chainName?: (params: { isMobile: boolean; isVisible: boolean }) => string;
    /** Function to generate arrow wrapper classes */
    arrowWrapper?: (params: { isMobile: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Wrapper for the click handler */
    onClick?: (
      originalHandler: () => void,
      event: React.MouseEvent<HTMLButtonElement>,
      context: ChainTriggerButtonContext,
    ) => void;
    /** Wrapper for the key down handler */
    onKeyDown?: (
      originalHandler: (event: React.KeyboardEvent) => void,
      event: React.KeyboardEvent,
      context: ChainTriggerButtonContext,
    ) => void;
  };
  /** Animation settings */
  animations?: {
    /** Layout animation settings */
    layout?: {
      duration?: number;
      ease?: AnimationEasing;
    };
    /** Inner content animation settings */
    innerContent?: {
      duration?: number;
    };
  };
};

/**
 * Comprehensive customization options for the ChainSelector.
 */
export type ChainSelectorCustomization = {
  /** Custom component overrides */
  components?: {
    /** Custom component for displaying a single chain */
    SingleChainDisplay?: ComponentType<CustomSingleChainDisplayProps>;
    /** Custom wrapper for the desktop selector */
    DesktopSelector?: ComponentType<CustomDesktopSelectorProps>;
    /** Custom wrapper for the mobile selector */
    MobileSelector?: ComponentType<CustomMobileSelectorProps>;
    /** Custom dialog header component */
    DialogHeader?: ComponentType<CustomDialogHeaderProps>;
  };
  /** Custom CSS class generators */
  classNames?: {
    /** Classes for the main container */
    container?: (params: { hasMultipleChains: boolean; isLoading: boolean }) => string;
    /** Classes for the desktop wrapper */
    desktopWrapper?: (params: { chainCount: number }) => string;
    /** Classes for the mobile wrapper */
    mobileWrapper?: (params: { chainCount: number }) => string;
    /** Classes for the loading state */
    loadingState?: () => string;
    /** Classes for the single chain display */
    singleChainDisplay?: () => string;
    /** Classes for the dialog content */
    dialogContent?: (params: { chainCount: number }) => string;
    /** Classes for the dialog inner container */
    dialogInnerContainer?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Wrapper for the chain change handler */
    onChainChange?: (originalHandler: (newChainId: string) => void, newChainId: string) => void;
    /** Wrapper for the dialog close handler */
    onDialogClose?: (originalHandler: () => void) => void;
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
const DefaultTriggerIcon = ({ chainId, className, ...props }: CustomTriggerIconProps) => {
  return <NetworkIcon chainId={chainId} className={className} {...props} />;
};

/**
 * Default trigger content.
 */
const DefaultTriggerContent = ({ icon, chainName, isMobile }: CustomTriggerContentProps) => {
  return (
    <>
      <div className="novacon:flex novacon:items-center novacon:sm:space-x-2 novacon:[&_svg]:w-6 novacon:[&_svg]:h-6">
        <div aria-hidden="true">{icon}</div>
        {isMobile ? (
          <span className="novacon:hidden novacon:sm:inline-block novacon:sr-only novacon:sm:not-sr-only">
            {chainName}
          </span>
        ) : (
          <Select.Value asChild>
            <span className="novacon:hidden novacon:sm:inline-block novacon:sr-only novacon:sm:not-sr-only">
              {chainName}
            </span>
          </Select.Value>
        )}
      </div>
    </>
  );
};

/**
 * Default trigger arrow.
 */
const DefaultTriggerArrow = ({ isOpen, className, ...props }: CustomTriggerArrowProps) => {
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
}: CustomSingleChainDisplayProps) => {
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
const DefaultDesktopSelector = ({ children, className, 'aria-label': ariaLabel }: CustomDesktopSelectorProps) => {
  return (
    <div className={className} role="region" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

/**
 * Default mobile selector wrapper.
 */
const DefaultMobileSelector = ({ children, className, 'aria-label': ariaLabel }: CustomMobileSelectorProps) => {
  return (
    <div className={className} role="region" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

/**
 * Default dialog header component.
 */
const DefaultDialogHeader = ({ title, onClose, className }: CustomDialogHeaderProps) => {
  const labels = useNovaConnectLabels();

  return (
    <DialogHeader className={className}>
      <DialogTitle>{title}</DialogTitle>
      <DialogClose asChild>
        <button
          type="button"
          aria-label={labels.closeModal}
          className="novacon:cursor-pointer novacon:rounded-full novacon:p-1
           novacon:text-[var(--tuwa-text-tertiary)] novacon:transition-colors
           novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:text-[var(--tuwa-text-primary)]
           novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-2"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
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
  _context: ChainTriggerButtonContext,
) => {
  originalHandler();
};

const defaultKeyDownHandler = (
  originalHandler: (event: React.KeyboardEvent) => void,
  event: React.KeyboardEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: ChainTriggerButtonContext,
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
  const chainName = getChainName(currentFormattedChainId);

  const {
    Icon = DefaultTriggerIcon,
    Content = DefaultTriggerContent,
    Arrow = DefaultTriggerArrow,
  } = customization?.components ?? {};

  const { onClick: customClickHandler = defaultClickHandler, onKeyDown: customKeyDownHandler = defaultKeyDownHandler } =
    customization?.handlers ?? {};

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const context: ChainTriggerButtonContext = {
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
      const context: ChainTriggerButtonContext = {
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
        'novacon:cursor-pointer novacon:inline-flex novacon:items-center novacon:justify-center',
        'novacon:rounded-xl novacon:font-medium novacon:text-sm novacon:transition-all novacon:duration-200',
        'novacon:hover:scale-[1.02] novacon:active:scale-[0.98]',
        'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-offset-2 novacon:focus:ring-offset-[var(--tuwa-bg-primary)] novacon:focus:ring-[var(--tuwa-border-primary)]',
        'novacon:bg-[var(--tuwa-bg-secondary)] novacon:text-[var(--tuwa-text-primary)] novacon:hover:bg-[var(--tuwa-bg-muted)]',
        {
          'novacon:ring-2 novacon:ring-[var(--tuwa-text-accent)] novacon:border novacon:border-transparent':
            isChainsListOpen,
          'novacon:border novacon:border-[var(--tuwa-border-primary)]': !isChainsListOpen,
        },
        'novacon:[&_svg]:w-4 novacon:[&_svg]:h-4',
      );

  const innerContentClasses = customization?.classNames?.innerContent
    ? customization.classNames.innerContent({ isMobile, isOpen: isChainsListOpen })
    : 'novacon:inline-flex novacon:items-center novacon:justify-center novacon:gap-2 novacon:px-2 sm:novacon:px-4 novacon:min-w-[60px] novacon:min-h-[42px] novacon:py-1';

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
        isLoading: false,
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
  const chainName = getChainName(currentFormattedChainId);

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
              <DialogHeader title={labels.switchNetworks} onClose={handleDialogClose} />

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
