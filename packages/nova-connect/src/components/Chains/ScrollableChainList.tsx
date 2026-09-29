/**
 * @file Highly customizable scrollable chain list with comprehensive styling and behavior control.
 */

import {
  AnimatePresence,
  type AnyResolvedKeyframe,
  type LegacyAnimationControls,
  motion,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from 'framer-motion';
import React, { type ComponentType, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { ToBottomButton, ToBottomButtonCustomization } from '../ToBottomButton';
import { ToTopButton, ToTopButtonCustomization } from '../ToTopButton';
import { ChainListRenderer, ChainListRendererCustomization } from './ChainListRenderer';

// === TYPES AND INTERFACES ===

/**
 * Chain data returned by the `getChainData` prop of {@link ScrollableChainList}.
 */
export interface ScrollableChainListChainData {
  /** The chain ID formatted for the connector (the value passed to `handleValueChange`) */
  formattedChainId: string | number;
  /** The chain ID as given in the chain list */
  chain: string | number;
}

/**
 * Scroll state of the list, passed to the scroll handlers.
 */
export interface ScrollableChainListScrollButtonContext {
  /** Whether the "scroll to top" button is shown */
  showTopButton: boolean;
  /** Whether the "scroll to bottom" button is shown */
  showBottomButton: boolean;
  /** Whether the list scrolled during the last 150 ms */
  isScrolling: boolean;
  /** `scrollTop` of the scroll container */
  scrollTop: number;
  /** `scrollHeight` of the scroll container */
  scrollHeight: number;
  /** `clientHeight` of the scroll container */
  clientHeight: number;
}

/**
 * Props for a custom scroll container component.
 */
export interface ScrollableChainListScrollContainerProps {
  /** The chain list */
  children: ReactNode;
  /** Ref to attach to the scrollable element (used to track the scroll position) */
  ref: React.RefObject<HTMLDivElement | null>;
  /**
   * Scrolls by a page on PageUp and PageDown.
   *
   * @param event - The keyboard event.
   */
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** `listbox` */
  role: string;
  /** The `selectChain` label */
  'aria-label': string;
  /** `0` */
  tabIndex: number;
}

/**
 * Props for a custom wrapper component.
 */
export interface ScrollableChainListWrapperProps {
  /** The scroll buttons and the scroll container */
  children: ReactNode;
  /** Classes from `classNames.wrapper` or the defaults */
  className?: string;
  /** `region` */
  role: string;
  /** The `aria-label` prop or the `chainListContainer` label */
  'aria-label': string;
}

/**
 * Props for a custom wrapper of a scroll button. The default one renders nothing when the button is hidden and fades
 * it in and out.
 */
export interface ScrollableChainListButtonAnimationWrapperProps {
  /** The button in its wrapper `div` */
  children: ReactNode;
  /** Whether the button should be shown */
  isVisible: boolean;
  /** Which button this is */
  position: 'top' | 'bottom';
  /** Key for `AnimatePresence` (`top-button` or `bottom-button`) */
  animationKey: string;
}

/**
 * Framer Motion props of the scroll buttons. When set, each button wrapper is also wrapped in a `motion.div` with
 * these props.
 */
export interface ScrollableChainListScrollButtonAnimationConfig {
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
 * Customization options of {@link ScrollableChainList}.
 */
export interface ScrollableChainListCustomization {
  /** Custom components */
  components?: {
    /** Custom scroll container component */
    ScrollContainer?: ComponentType<ScrollableChainListScrollContainerProps>;
    /** Custom wrapper component */
    Wrapper?: ComponentType<ScrollableChainListWrapperProps>;
    /** Custom button animation wrapper */
    ButtonAnimationWrapper?: ComponentType<ScrollableChainListButtonAnimationWrapperProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the wrapper, instead of the default ones. An empty string keeps the defaults.
     *
     * @param params - The list state.
     * @param params.itemCount - Number of chains.
     * @param params.hasScrollableContent - Whether the list is taller than the container.
     * @returns The classes.
     */
    wrapper?: (params: { itemCount: number; hasScrollableContent: boolean }) => string;
    /**
     * Returns the classes of the scroll container, instead of the default ones. An empty string keeps the defaults.
     *
     * @param params - The list state.
     * @param params.itemCount - Number of chains.
     * @param params.hasScrollableContent - Whether the list is taller than the container.
     * @param params.showTopButton - Whether the "scroll to top" button is shown.
     * @param params.showBottomButton - Whether the "scroll to bottom" button is shown.
     * @returns The classes.
     */
    container?: (params: {
      itemCount: number;
      hasScrollableContent: boolean;
      showTopButton: boolean;
      showBottomButton: boolean;
    }) => string;
    /**
     * Returns the classes of the `div` around a scroll button, instead of the default ones. An empty string keeps the
     * defaults.
     *
     * @param params - The button state.
     * @param params.position - Which button this is.
     * @param params.isVisible - Whether the button is shown.
     * @returns The classes.
     */
    buttonWrapper?: (params: { position: 'top' | 'bottom'; isVisible: boolean }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called after the visibility of the scroll buttons is updated (on mount, scroll and resize). Not called while
     * `buttons.hideWhenContentFits` hides the buttons.
     *
     * @param originalHandler - Does nothing.
     * @param event - A new `scroll` event (not the original one).
     * @param context - The scroll state.
     */
    onScroll?: (originalHandler: () => void, event: Event, context: ScrollableChainListScrollButtonContext) => void;
    /**
     * Wraps the key handler of the scroll container: call `originalHandler(event)` to scroll by a page on PageUp and
     * PageDown.
     *
     * @param originalHandler - The default handler.
     * @param event - The keyboard event.
     * @param context - The list.
     * @param context.scrollContainer - The scroll container element.
     */
    onKeyDown?: (
      originalHandler: (event: React.KeyboardEvent<HTMLDivElement>) => void,
      event: React.KeyboardEvent<HTMLDivElement>,
      context: { scrollContainer: HTMLDivElement | null },
    ) => void;
    /**
     * Wraps the click on the "scroll to top" button: call `originalHandler()` to scroll to the top.
     *
     * @param originalHandler - Scrolls to the top.
     * @param context - The scroll state.
     */
    onTopButtonClick?: (originalHandler: () => void, context: ScrollableChainListScrollButtonContext) => void;
    /**
     * Wraps the click on the "scroll to bottom" button: call `originalHandler()` to scroll to the bottom.
     *
     * @param originalHandler - Scrolls to the bottom.
     * @param context - The scroll state.
     */
    onBottomButtonClick?: (originalHandler: () => void, context: ScrollableChainListScrollButtonContext) => void;
  };
  /** Animation configuration */
  animations?: {
    /** Button animation */
    scrollButtons?: ScrollableChainListScrollButtonAnimationConfig;
  };
  /** Scroll behavior configuration */
  scrollBehavior?: {
    /** Scroll behavior of the scroll buttons and PageUp/PageDown (default: `'smooth'`) */
    behavior?: ScrollBehavior;
    /** Share of the container height scrolled by PageUp/PageDown, from 0 to 1 (default: `0.8`) */
    pageScrollPercentage?: number;
  };
  /** Button customization */
  buttons?: {
    /** Top button customization */
    topButton?: ToTopButtonCustomization;
    /** Bottom button customization */
    bottomButton?: ToBottomButtonCustomization;
    /** Hide both buttons while the list fits in the container */
    hideWhenContentFits?: boolean;
  };
  /** Chain list renderer customization */
  chainListRenderer?: ChainListRendererCustomization;
}

/**
 * Props for the {@link ScrollableChainList} component.
 */
export interface ScrollableChainListProps {
  /** List of chain identifiers to render */
  chainsList: (string | number)[];
  /** The formatted chain ID of the active connection, as a string (marks the active item) */
  selectValue: string;
  /**
   * Selects a chain.
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
  getChainData: (chain: string | number) => ScrollableChainListChainData;
  /** Closes the list after a selection */
  onClose: () => void;
  /** Customization options */
  customization?: ScrollableChainListCustomization;
  /** ARIA label for the wrapper (default: the `chainListContainer` label) */
  'aria-label'?: string;
  /** Shows the loading message instead of the list (default: `false`) */
  isLoading?: boolean;
  /** Shows this error instead of the list (default: `null`) */
  error?: string | null;
}

// === DEFAULT COMPONENTS ===

/**
 * Default scroll container component
 */
const DefaultScrollContainer: React.FC<ScrollableChainListScrollContainerProps> = React.forwardRef<
  HTMLDivElement,
  ScrollableChainListScrollContainerProps
>(({ children, className, onKeyDown, ...props }, ref) => (
  <div ref={ref} className={className} onKeyDown={onKeyDown} {...props}>
    {children}
  </div>
));

DefaultScrollContainer.displayName = 'DefaultScrollContainer';

/**
 * Default wrapper component
 */
const DefaultWrapper: React.FC<ScrollableChainListWrapperProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

/**
 * Default button animation wrapper
 */
const DefaultButtonAnimationWrapper: React.FC<ScrollableChainListButtonAnimationWrapperProps> = ({
  children,
  isVisible,
  animationKey,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      key={animationKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// === MAIN COMPONENT ===

/**
 * Renders the mobile chain list of {@link ChainSelector}: a scroll container with {@link ChainListRenderer} and
 * "scroll to top/bottom" buttons that appear when the list can be scrolled. Uses a `ResizeObserver` and a scroll
 * listener on the container, removed on unmount.
 *
 * Props: {@link ScrollableChainListProps}.
 */
export const ScrollableChainList: React.FC<ScrollableChainListProps> = ({
  chainsList,
  selectValue,
  handleValueChange,
  getChainData,
  onClose,
  customization,
  'aria-label': ariaLabel,
  isLoading = false,
  error = null,
}) => {
  const labels = useNovaConnectLabels();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTopButton, setShowTopButton] = useState(false);
  const [showBottomButton, setShowBottomButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [scrollContext, setScrollContext] = useState<ScrollableChainListScrollButtonContext>({
    showTopButton: false,
    showBottomButton: false,
    isScrolling: false,
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  // Extract customization options with defaults
  const {
    ScrollContainer = DefaultScrollContainer,
    Wrapper = DefaultWrapper,
    ButtonAnimationWrapper = DefaultButtonAnimationWrapper,
  } = customization?.components ?? {};

  const scrollBehavior = customization?.scrollBehavior ?? {};
  const buttonConfig = customization?.buttons ?? {};
  const animations = customization?.animations;

  // Scroll behavior settings
  const scrollBehaviorType = scrollBehavior.behavior ?? 'smooth';
  const pageScrollPercentage = scrollBehavior.pageScrollPercentage ?? 0.8;

  // Update scroll context
  const updateScrollContext = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    setScrollContext({
      showTopButton,
      showBottomButton,
      isScrolling,
      scrollTop,
      scrollHeight,
      clientHeight,
    });
  }, [showTopButton, showBottomButton, isScrolling]);

  // Update scroll buttons visibility
  const updateScrollButtons = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const hasContent = scrollHeight > clientHeight;

    setHasScrollableContent(hasContent);

    if (buttonConfig.hideWhenContentFits && !hasContent) {
      setShowTopButton(false);
      setShowBottomButton(false);
      return;
    }

    setShowTopButton(scrollTop > 0);
    setShowBottomButton(scrollTop + clientHeight < scrollHeight - 1);

    // Call custom scroll handler if provided
    if (customization?.handlers?.onScroll) {
      customization.handlers.onScroll(() => {}, new Event('scroll'), {
        showTopButton: scrollTop > 0,
        showBottomButton: scrollTop + clientHeight < scrollHeight - 1,
        isScrolling,
        scrollTop,
        scrollHeight,
        clientHeight,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonConfig.hideWhenContentFits, customization?.handlers?.onScroll, isScrolling]);

  // Update context after button states change
  useEffect(() => {
    updateScrollContext();
  }, [updateScrollContext]);

  // Setup scroll listeners and observers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setIsScrolling(true);
      updateScrollButtons();

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    updateScrollButtons();
    container.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      clearTimeout(scrollTimeout);
    };
  }, [chainsList, updateScrollButtons]);

  // Scroll to extreme positions
  const scrollToExtreme = useCallback(
    (isTop: boolean) => {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({
          top: isTop ? 0 : container.scrollHeight,
          behavior: scrollBehaviorType,
        });
      }
    },
    [scrollBehaviorType],
  );

  // Handle scroll button clicks
  const handleTopButtonClick = useCallback(() => {
    const originalHandler = () => scrollToExtreme(true);

    if (customization?.handlers?.onTopButtonClick) {
      customization.handlers.onTopButtonClick(originalHandler, scrollContext);
    } else {
      originalHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customization?.handlers?.onTopButtonClick, scrollToExtreme, scrollContext]);

  const handleBottomButtonClick = useCallback(() => {
    const originalHandler = () => scrollToExtreme(false);

    if (customization?.handlers?.onBottomButtonClick) {
      customization.handlers.onBottomButtonClick(originalHandler, scrollContext);
    } else {
      originalHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customization?.handlers?.onBottomButtonClick, scrollToExtreme, scrollContext]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const originalHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Handle arrow key navigation within the scrollable area
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          // Let the ChainListRenderer handle the focus management
          return;
        }

        // Handle Page Up/Page Down for large scrolls
        if (e.key === 'PageUp') {
          e.preventDefault();
          const container = containerRef.current;
          if (container) {
            container.scrollBy({
              top: -container.clientHeight * pageScrollPercentage,
              behavior: scrollBehaviorType,
            });
          }
        }

        if (e.key === 'PageDown') {
          e.preventDefault();
          const container = containerRef.current;
          if (container) {
            container.scrollBy({
              top: container.clientHeight * pageScrollPercentage,
              behavior: scrollBehaviorType,
            });
          }
        }
      };

      if (customization?.handlers?.onKeyDown) {
        customization.handlers.onKeyDown(originalHandler, event, {
          scrollContainer: containerRef.current,
        });
      } else {
        originalHandler(event);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customization?.handlers?.onKeyDown, pageScrollPercentage, scrollBehaviorType],
  );

  // Generate wrapper classes and styles
  const wrapperClasses =
    customization?.classNames?.wrapper?.({
      itemCount: chainsList.length,
      hasScrollableContent,
    }) || 'novacon:relative novacon:py-[24px]';

  // Generate container classes and styles
  const containerClasses =
    customization?.classNames?.container?.({
      itemCount: chainsList.length,
      hasScrollableContent,
      showTopButton,
      showBottomButton,
    }) ||
    'NovaCustomScroll novacon:relative novacon:flex novacon:w-full novacon:flex-col novacon:p-2 novacon:gap-1 novacon:max-h-[312px] novacon:overflow-x-hidden novacon:overflow-y-auto';

  // Button animation wrapper classes and styles
  const topButtonWrapperClasses =
    customization?.classNames?.buttonWrapper?.({ position: 'top', isVisible: showTopButton }) ||
    'novacon:absolute novacon:top-0 novacon:z-10 novacon:w-full';

  const bottomButtonWrapperClasses =
    customization?.classNames?.buttonWrapper?.({ position: 'bottom', isVisible: showBottomButton }) ||
    'novacon:absolute novacon:bottom-0 novacon:z-10 novacon:w-full';

  // Create button animation wrapper with custom animations
  const createButtonWrapper = useCallback(
    (
      children: ReactNode,
      isVisible: boolean,
      position: 'top' | 'bottom',
      wrapperClasses: string,
      wrapperStyles?: React.CSSProperties,
    ) => {
      const animationConfig = animations?.scrollButtons;
      const animationKey = `${position}-button`;

      const wrapperElement = (
        <div className={wrapperClasses} style={wrapperStyles}>
          {children}
        </div>
      );

      return (
        <ButtonAnimationWrapper isVisible={isVisible} position={position} animationKey={animationKey}>
          {animationConfig ? <motion.div {...animationConfig}>{wrapperElement}</motion.div> : wrapperElement}
        </ButtonAnimationWrapper>
      );
    },
    [animations, ButtonAnimationWrapper],
  );

  return (
    <Wrapper className={wrapperClasses} role="region" aria-label={ariaLabel || labels.chainListContainer}>
      <AnimatePresence>
        {createButtonWrapper(
          <ToTopButton
            onClick={handleTopButtonClick}
            aria-label={labels.scrollToTop}
            className="novacon:w-full"
            customization={buttonConfig.topButton}
          />,
          showTopButton,
          'top',
          topButtonWrapperClasses,
        )}
      </AnimatePresence>

      <ScrollContainer
        ref={containerRef}
        className={containerClasses}
        role="listbox"
        aria-label={labels.selectChain}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <ChainListRenderer
          chainsList={chainsList}
          selectValue={selectValue}
          handleValueChange={handleValueChange}
          getChainData={getChainData}
          onClose={onClose}
          isMobile={true}
          isLoading={isLoading}
          error={error}
          customization={customization?.chainListRenderer}
        />
      </ScrollContainer>

      <AnimatePresence>
        {createButtonWrapper(
          <ToBottomButton
            onClick={handleBottomButtonClick}
            aria-label={labels.scrollToBottom}
            className="novacon:w-full"
            customization={buttonConfig.bottomButton}
          />,
          showBottomButton,
          'bottom',
          bottomButtonWrapperClasses,
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
