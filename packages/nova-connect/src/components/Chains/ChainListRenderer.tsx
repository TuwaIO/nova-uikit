/**
 * @file Highly customizable chain list renderer with comprehensive styling and behavior control.
 */

import * as Select from '@radix-ui/react-select';
import { cn, getChainName, NetworkIcon } from '@tuwaio/nova-core';
import {
  type AnyResolvedKeyframe,
  type LegacyAnimationControls,
  motion,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from 'framer-motion';
import React, {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ElementRef,
  forwardRef,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';

// === TYPES AND INTERFACES ===

/**
 * Chain data returned by the `getChainData` prop of {@link ChainListRenderer}.
 */
export interface ChainListRendererChainData {
  /** The chain ID formatted for the connector (the value passed to the selection handlers) */
  formattedChainId: string | number;
  /** The chain ID as given in the chain list */
  chain: string | number;
}

/**
 * Props for a custom chain icon component.
 */
export interface ChainListRendererChainIconProps {
  /** The formatted chain ID */
  chainId: string | number;
  /** Classes from `classNames.icon` */
  className?: string;
  /** Always `true`: the chain name is rendered next to the icon */
  'aria-hidden'?: boolean;
}

/**
 * Props for a custom chain content component (icon and name of an item).
 */
export interface ChainListRendererChainContentProps {
  /** The formatted chain ID */
  chainId: string | number;
  /** Whether this is the chain of the active connection */
  isActive: boolean;
  /** The rendered chain icon */
  icon: ReactNode;
  /** The chain name element */
  children?: ReactNode;
}

/**
 * Props for a custom active indicator wrapper component.
 */
export interface ChainListRendererActiveIndicatorWrapperProps {
  /** Whether this is the chain of the active connection */
  isActive: boolean;
  /** Whether this is the mobile list */
  isMobile: boolean;
  /** The rendered active indicator */
  indicator: ReactNode;
  /** The "Connected" label, shown by the default wrapper for the active chain of the mobile list */
  children?: ReactNode;
  /** Classes from `classNames.activeIndicatorWrapper` */
  className?: string;
}

/**
 * Props for a custom active indicator component.
 */
export interface ChainListRendererActiveIndicatorProps {
  /** Whether this is the chain of the active connection */
  isActive: boolean;
  /** Accessible label (`connected` label) */
  label: string;
  /** Classes from `classNames.activeIndicator` */
  className?: string;
}

/**
 * Framer Motion props of the list container. When set, the container is rendered as `motion.div`.
 */
export interface ChainListRendererContainerAnimationConfig {
  /** Initial state (`initial` of Framer Motion) */
  initial?: TargetAndTransition | VariantLabels | LegacyAnimationControls | undefined;
  /** Target state (`animate` of Framer Motion) */
  animate?: TargetAndTransition | VariantLabels | LegacyAnimationControls | undefined;
  /** Exit state (`exit` of Framer Motion) */
  exit?: TargetAndTransition | VariantLabels | LegacyAnimationControls | undefined;
  /** Transition settings */
  transition?: Transition<AnyResolvedKeyframe>;
}

/**
 * Framer Motion props of the items of the mobile list. When set, each item is rendered as `motion.div`.
 */
export interface ChainListRendererItemAnimationConfig {
  /** Initial state (`initial` of Framer Motion) */
  initial?: TargetAndTransition | VariantLabels | LegacyAnimationControls | undefined;
  /** Target state (`animate` of Framer Motion) */
  animate?: TargetAndTransition | VariantLabels | LegacyAnimationControls | undefined;
  /** Transition settings */
  transition?: Transition<AnyResolvedKeyframe>;
}

/**
 * Customization options of {@link ChainListRenderer}.
 */
export interface ChainListRendererCustomization {
  /** Custom components */
  components?: {
    /** Custom chain icon component */
    ChainIcon?: ComponentType<ChainListRendererChainIconProps>;
    /** Custom chain content layout component */
    ChainContent?: ComponentType<ChainListRendererChainContentProps>;
    /** Custom active indicator wrapper component */
    ActiveIndicatorWrapper?: ComponentType<ChainListRendererActiveIndicatorWrapperProps>;
    /** Custom active indicator component */
    ActiveIndicator?: ComponentType<ChainListRendererActiveIndicatorProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns classes added to the list container (before the `className` prop).
     *
     * @param params - The list state.
     * @param params.isMobile - Whether this is the mobile list.
     * @param params.itemCount - Number of chains.
     * @returns The classes.
     */
    container?: (params: { isMobile: boolean; itemCount: number }) => string;
    /**
     * Returns the classes of an item, instead of the default ones and `itemClassName`. An empty string keeps the
     * defaults.
     *
     * @param params - The item state.
     * @param params.isActive - Whether this is the chain of the active connection.
     * @param params.isMobile - Whether this is the mobile list.
     * @param params.chainId - The formatted chain ID.
     * @returns The classes.
     */
    item?: (params: { isActive: boolean; isMobile: boolean; chainId: string | number }) => string;
    /**
     * Returns the classes passed to the chain icon.
     *
     * @param params - The item state.
     * @param params.isActive - Whether this is the chain of the active connection.
     * @param params.chainId - The formatted chain ID.
     * @returns The classes.
     */
    icon?: (params: { isActive: boolean; chainId: string | number }) => string;
    /**
     * Returns classes added to the chain name.
     *
     * @param params - The item state.
     * @param params.isActive - Whether this is the chain of the active connection.
     * @param params.isMobile - Whether this is the mobile list.
     * @returns The classes.
     */
    chainName?: (params: { isActive: boolean; isMobile: boolean }) => string;
    /**
     * Returns classes added to the active indicator wrapper.
     *
     * @param params - The item state.
     * @param params.isActive - Whether this is the chain of the active connection.
     * @param params.isMobile - Whether this is the mobile list.
     * @returns The classes.
     */
    activeIndicatorWrapper?: (params: { isActive: boolean; isMobile: boolean }) => string;
    /**
     * Returns classes added to the active indicator.
     *
     * @param params - The list state.
     * @param params.isMobile - Whether this is the mobile list.
     * @returns The classes.
     */
    activeIndicator?: (params: { isMobile: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Wraps the activation of an item with a pointer (a click or a tap): call `originalHandler()` to select the chain
     * (through `onSelect`) and close the list.
     *
     * @param originalHandler - Selects the chain and closes the list.
     * @param context - The item.
     * @param context.chainId - The formatted chain ID.
     * @param context.chainName - The chain name.
     * @param context.isActive - Whether this is the chain of the active connection.
     */
    onClick?: (
      originalHandler: () => void,
      context: { chainId: string | number; chainName: string; isActive: boolean },
    ) => void;
    /**
     * Wraps the key handler of an item: call `originalHandler(event)` to select the chain on Enter and Space (in the
     * desktop list, Space within a second of typing a chain name continues the type-ahead search instead).
     *
     * @param originalHandler - The default handler.
     * @param event - The keyboard event.
     * @param context - The item.
     * @param context.chainId - The formatted chain ID.
     * @param context.chainName - The chain name.
     * @param context.isActive - Whether this is the chain of the active connection.
     */
    onKeyDown?: (
      originalHandler: (event: React.KeyboardEvent) => void,
      event: React.KeyboardEvent,
      context: { chainId: string | number; chainName: string; isActive: boolean },
    ) => void;
    /**
     * Wraps the selection of a chain: call `originalHandler(chainId)` to run `handleValueChange`. The list closes after
     * this handler returns.
     *
     * @param originalHandler - The `handleValueChange` prop.
     * @param chainId - The formatted chain ID, as a string.
     * @param context - The item.
     * @param context.chainName - The chain name.
     * @param context.isActive - Whether this is the chain of the active connection.
     */
    onSelect?: (
      originalHandler: (chainId: string) => void,
      chainId: string,
      context: { chainName: string; isActive: boolean },
    ) => void;
  };
  /** Animation configuration */
  animations?: {
    /** Container animation */
    container?: ChainListRendererContainerAnimationConfig;
    /** Item animation (mobile list only) */
    item?: ChainListRendererItemAnimationConfig;
  };
  /** Behavior configuration */
  behavior?: {
    /** Message shown while `isLoading` is `true` (default: the `loading` label followed by `...`) */
    loadingMessage?: string;
  };
}

/**
 * Props for the {@link ChainListRenderer} component.
 */
export interface ChainListRendererProps {
  /** List of chain identifiers to render */
  chainsList: (string | number)[];
  /** The formatted chain ID of the active connection, as a string (marks the active item) */
  selectValue: string;
  /**
   * Selects a chain, through `handlers.onSelect` of the customization when set.
   *
   * @param newChainId - The formatted chain ID, as a string.
   */
  handleValueChange: (newChainId: string) => void;
  /**
   * Formats a chain of `chainsList` for the connector.
   *
   * @param chain - A chain of `chainsList`.
   * @returns The chain data.
   */
  getChainData: (chain: string | number) => ChainListRendererChainData;
  /** Closes the list after a selection */
  onClose: () => void;
  /** Whether to render the mobile list (plain items) instead of Radix `Select.Item` elements (default: `false`) */
  isMobile?: boolean;
  /** Classes added to the container */
  className?: string;
  /** Classes added to the default classes of the items */
  itemClassName?: string;
  /** Customization options */
  customization?: ChainListRendererCustomization;
  /** ARIA label for the list container (default: the `selectChain` label) */
  'aria-label'?: string;
  /** Shows the loading message instead of the list (default: `false`) */
  isLoading?: boolean;
  /** Shows this error instead of the list (default: `null`) */
  error?: string | null;
}

// === DEFAULT COMPONENTS ===

/**
 * Default chain icon component using NetworkIcon
 */
const DefaultChainIcon: React.FC<ChainListRendererChainIconProps> = ({ chainId, className, ...props }) => (
  <NetworkIcon chainId={chainId} className={className} {...props} />
);

/**
 * Default chain content component
 */
const DefaultChainContent: React.FC<ChainListRendererChainContentProps> = ({ icon, children }) => (
  <div className="novacon:flex novacon:items-center novacon:space-x-3">
    <div className="novacon:[&_svg]:w-6 novacon:[&_svg]:h-6 novacon:w-6 novacon:h-6" aria-hidden="true">
      {icon}
    </div>
    {children}
  </div>
);

/**
 * Default active indicator wrapper component
 */
const DefaultActiveIndicatorWrapper: React.FC<ChainListRendererActiveIndicatorWrapperProps> = ({
  isActive,
  isMobile,
  indicator,
  children,
  className,
}) => {
  if (isMobile) {
    return (
      <div
        className={cn(
          'novacon:flex novacon:items-center novacon:space-x-2 novacon:text-xs novacon:font-mono novacon:font-semibold novacon:text-[var(--tuwa-text-tertiary)]',
          className,
        )}
      >
        {isActive && children}
        {indicator}
      </div>
    );
  }

  return indicator;
};

/**
 * Default active indicator component
 */
const DefaultActiveIndicator: React.FC<ChainListRendererActiveIndicatorProps> = ({ isActive, label, className }) => {
  if (!isActive) return null;

  return (
    <>
      <span
        className={cn(
          'novacon:ml-auto novacon:text-xs novacon:font-semibold novacon:w-2 novacon:h-2 novacon:rounded-full novacon:bg-[var(--tuwa-success-text)]',
          className,
        )}
        aria-label={label}
        role="status"
      />
      <span className="novacon:sr-only">{label}</span>
    </>
  );
};

interface SelectItemBaseProps extends ComponentPropsWithoutRef<typeof Select.Item> {
  /** Whether this is the chain of the active connection */
  isActive: boolean;
  /** Selects the chain and closes the list (the item handlers of the customization) */
  onActivate: () => void;
}

/**
 * Item of the desktop list. The item selects through `onActivate` instead of Radix Select: it prevents the default of
 * the events that select in Radix (`pointerup` of a mouse, `click` of other pointers), which skips the selection of
 * Radix; `onKeyDown` does the same for Enter and Space.
 */
const SelectItemBase = forwardRef<ElementRef<typeof Select.Item>, SelectItemBaseProps>(
  ({ children, className, isActive, onActivate, ...props }, forwardedRef) => {
    // Same pointer tracking as Radix: a mouse selects on `pointerup`, other pointers on `click`
    const pointerTypeRef = useRef('touch');
    return (
      <Select.Item
        ref={forwardedRef}
        className={cn(
          // Base styles
          'novacon:flex novacon:items-center novacon:w-full novacon:text-left novacon:px-2 novacon:py-2',
          'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:transition-colors novacon:space-x-3 novacon:cursor-pointer novacon:outline-none',
          // Interactive states
          'novacon:text-[var(--tuwa-text-primary)] novacon:hover:bg-[var(--tuwa-bg-muted)]',
          'novacon:focus:bg-[var(--tuwa-bg-muted)] novacon:focus:outline-none',
          'novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
          // Active state
          { 'novacon:bg-[var(--tuwa-bg-muted)]': isActive },
          // Custom classes
          className,
        )}
        role="option"
        aria-selected={isActive}
        tabIndex={0}
        {...props}
        onPointerDown={(event) => {
          pointerTypeRef.current = event.pointerType;
        }}
        onPointerMove={(event) => {
          pointerTypeRef.current = event.pointerType;
        }}
        onPointerUp={(event) => {
          if (pointerTypeRef.current !== 'mouse') return;
          event.preventDefault();
          onActivate();
        }}
        onClick={(event) => {
          if (pointerTypeRef.current === 'mouse') return;
          event.preventDefault();
          onActivate();
        }}
      >
        {children}
      </Select.Item>
    );
  },
);
SelectItemBase.displayName = 'SelectItemBase';

// === MAIN COMPONENT ===

/**
 * Renders the chain list of {@link ChainSelector}: Radix `Select.Item` elements on desktop, plain options in the
 * mobile dialog. Shows the loading message, the error or the `noConnectorsFound` label instead of the list.
 *
 * Props: {@link ChainListRendererProps}.
 */
export const ChainListRenderer: React.FC<ChainListRendererProps> = ({
  chainsList,
  selectValue,
  handleValueChange,
  getChainData,
  onClose,
  isMobile = false,
  className,
  itemClassName,
  customization,
  'aria-label': ariaLabel,
  isLoading = false,
  error = null,
}) => {
  const labels = useNovaConnectLabels();

  // Extract customization options with defaults
  const {
    ChainIcon = DefaultChainIcon,
    ChainContent = DefaultChainContent,
    ActiveIndicatorWrapper = DefaultActiveIndicatorWrapper,
    ActiveIndicator = DefaultActiveIndicator,
  } = customization?.components ?? {};

  const animations = customization?.animations;
  const behavior = customization?.behavior ?? {};

  // Container classes
  const containerClasses = cn(
    customization?.classNames?.container?.({ isMobile, itemCount: chainsList.length }),
    className,
  );

  // Create event handlers at top level to avoid hooks violations
  const createClickHandler = useCallback(
    (formattedChainId: string | number, chainName: string, isActive: boolean) => {
      const originalHandler = () => {
        if (customization?.handlers?.onSelect) {
          customization.handlers.onSelect(handleValueChange, String(formattedChainId), { chainName, isActive });
        } else {
          handleValueChange(String(formattedChainId));
        }
        onClose();
      };

      return () => {
        if (customization?.handlers?.onClick) {
          customization.handlers.onClick(originalHandler, {
            chainId: formattedChainId,
            chainName,
            isActive,
          });
        } else {
          originalHandler();
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customization?.handlers?.onSelect, customization?.handlers?.onClick, handleValueChange, onClose],
  );

  // Time of the last key of a type-ahead search of the desktop list (Radix Select resets the search after a second)
  const typeaheadAtRef = useRef(0);

  const createKeyDownHandler = useCallback(
    (clickHandler: () => void, formattedChainId: string | number, chainName: string, isActive: boolean) => {
      return (event: React.KeyboardEvent) => {
        const isTypingAhead = !isMobile && Date.now() - typeaheadAtRef.current < 1000;
        const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
        if (!isMobile && isPrintable && (event.key !== ' ' || isTypingAhead)) {
          typeaheadAtRef.current = Date.now();
        }

        const originalHandler = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || (e.key === ' ' && !isTypingAhead)) {
            e.preventDefault();
            clickHandler();
          }
        };

        if (customization?.handlers?.onKeyDown) {
          customization.handlers.onKeyDown(originalHandler, event, {
            chainId: formattedChainId,
            chainName,
            isActive,
          });
        } else {
          originalHandler(event);
        }

        // The desktop list selects only through these handlers: skip the selection of Radix Select
        if (!isMobile && (event.key === 'Enter' || (event.key === ' ' && !isTypingAhead))) {
          event.preventDefault();
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customization?.handlers?.onKeyDown, isMobile],
  );

  // Handle loading state
  if (isLoading) {
    const loadingMessage = behavior.loadingMessage || `${labels.loading}...`;
    return (
      <div
        className={cn('novacon:flex novacon:justify-center novacon:items-center novacon:py-4', containerClasses)}
        role="status"
        aria-label={loadingMessage}
      >
        <span className="novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]">{loadingMessage}</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        className={cn('novacon:flex novacon:justify-center novacon:items-center novacon:py-4', containerClasses)}
        role="alert"
        aria-live="assertive"
      >
        <span className="novacon:text-sm novacon:text-[var(--tuwa-text-error)]">{error}</span>
      </div>
    );
  }

  // Handle empty state
  if (chainsList.length === 0) {
    return (
      <div
        className={cn('novacon:flex novacon:justify-center novacon:items-center novacon:py-4', containerClasses)}
        role="status"
      >
        <span className="novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]">{labels.noConnectorsFound}</span>
      </div>
    );
  }

  // Main render method for individual chain items
  const renderChainItem = (chain: string | number) => {
    const { formattedChainId } = getChainData(chain);
    const isActive = String(formattedChainId) === selectValue;
    const chainName = getChainName(formattedChainId).name;

    // Generate custom classes and styles
    const itemClasses = customization?.classNames?.item?.({ isActive, isMobile, chainId: formattedChainId })
      ? customization?.classNames?.item?.({ isActive, isMobile, chainId: formattedChainId })
      : cn(
          // Default item styles
          'novacon:flex novacon:items-center novacon:w-full novacon:text-left novacon:px-2 novacon:py-2',
          'novacon:rounded-[var(--tuwa-rounded-corners)] novacon:transition-colors novacon:space-x-3 novacon:cursor-pointer novacon:outline-none',
          'novacon:text-[var(--tuwa-text-primary)] novacon:hover:bg-[var(--tuwa-bg-muted)]',
          'novacon:focus:bg-[var(--tuwa-bg-muted)] novacon:focus:outline-none',
          'novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-border-primary)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
          { 'novacon:bg-[var(--tuwa-bg-muted)]': isActive, 'novacon:justify-between': isMobile },
          // Custom classes
          itemClassName,
        );

    const iconClasses = customization?.classNames?.icon?.({ isActive, chainId: formattedChainId });

    const chainNameClasses = customization?.classNames?.chainName?.({ isActive, isMobile });

    const activeIndicatorWrapperClasses = customization?.classNames?.activeIndicatorWrapper?.({
      isActive,
      isMobile,
    });

    const activeIndicatorClasses = customization?.classNames?.activeIndicator?.({ isMobile });

    // Create event handlers
    const handleClick = createClickHandler(formattedChainId, chainName, isActive);
    const handleKeyDown = createKeyDownHandler(handleClick, formattedChainId, chainName, isActive);

    // Create icon element
    const iconElement = <ChainIcon chainId={formattedChainId} className={iconClasses} aria-hidden={true} />;

    // Create content element
    const contentElement = (
      <ChainContent chainId={formattedChainId} isActive={isActive} icon={iconElement}>
        <span className={cn('novacon:text-sm novacon:font-mono novacon:font-medium', chainNameClasses)}>
          {chainName}
        </span>
      </ChainContent>
    );

    // Create active indicator
    const indicator = (
      <ActiveIndicator isActive={isActive} label={labels.connected} className={activeIndicatorClasses} />
    );

    const activeIndicatorWrapper = (
      <ActiveIndicatorWrapper
        isActive={isActive}
        isMobile={isMobile}
        indicator={indicator}
        className={activeIndicatorWrapperClasses}
      >
        <span aria-label={labels.connected}>{labels.connected}</span>
      </ActiveIndicatorWrapper>
    );

    const ariaLabel = `${labels.chainOption}: ${chainName}`;

    // Render mobile version
    if (isMobile) {
      const MotionItem = animations?.item ? motion.div : 'div';
      const motionProps = animations?.item || {};

      return (
        <MotionItem
          key={chain}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={itemClasses}
          role="option"
          aria-selected={isActive}
          aria-label={ariaLabel}
          tabIndex={0}
          {...motionProps}
        >
          {contentElement}
          {activeIndicatorWrapper}
        </MotionItem>
      );
    }

    // Render desktop version with Select.Item
    return (
      <SelectItemBase
        key={chain}
        value={String(formattedChainId)}
        aria-label={ariaLabel}
        isActive={isActive}
        onActivate={handleClick}
        onKeyDown={handleKeyDown}
        className={itemClasses}
      >
        {contentElement}
        {activeIndicatorWrapper}
      </SelectItemBase>
    );
  };

  // Container animation wrapper
  const MotionContainer = animations?.container ? motion.div : 'div';
  const containerMotionProps = animations?.container || {};

  return (
    <MotionContainer
      role="listbox"
      aria-label={ariaLabel || labels.selectChain}
      className={containerClasses}
      {...containerMotionProps}
    >
      {chainsList.map(renderChainItem)}
    </MotionContainer>
  );
};
