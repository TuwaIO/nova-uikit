/**
 * @file This file contains the `WaitForConnectionContent` component, a customizable connection prompt with
 * comprehensive styling control and animation options.
 */

import { cn } from '@tuwaio/nova-core';
import { type Easing, type HTMLMotionProps, motion, type TargetAndTransition, type Variants } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { useSatelliteConnectStore } from '../../satellite';

// --- Default Motion Variants ---
const DEFAULT_PATH_ANIMATION_VARIANTS: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

const DEFAULT_CONTAINER_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// --- Types for Customization ---
/** Props of the wallet icon of {@link WaitForConnectionContent} (`customization.components.Icon`). */
export type WaitForConnectionContentIconProps = {
  /** Path data (`d`) of the icon (`customization.svg.pathData`, or a wallet icon). */
  pathData: string;
  /** Classes from `customization.classNames.icon`. */
  className?: string;
  /** Always `true`: the container has the accessible label. */
  'aria-hidden'?: boolean;
  /** Always `false`. */
  focusable?: boolean;
};

/** Props of the animated path of {@link WaitForConnectionContent} (`customization.components.Path`). */
export type WaitForConnectionContentPathProps = {
  /** Path data (`d`). */
  pathData: string;
  /** `framer-motion` variants of the path (`customization.variants.path`, or a drawing animation). */
  variants?: Variants;
  /** Classes from `customization.classNames.path`. */
  className?: string;
  /** Stroke line cap (`customization.svg.strokeLinecap`). */
  strokeLinecap?: 'butt' | 'round' | 'square';
  /** Stroke line join (`customization.svg.strokeLinejoin`). */
  strokeLinejoin?: 'miter' | 'bevel' | 'round';
  /** Stroke width (`customization.svg.strokeWidth`). */
  strokeWidth?: string | number;
};

/** Props of the text of {@link WaitForConnectionContent} (`customization.components.Text`). */
export type WaitForConnectionContentTextProps = {
  /** The text: `customization.config.customText`, or the `connectWallet` label. */
  text: string;
  /** Classes from `customization.classNames.text`. */
  className?: string;
  /** Always `true`: the container has the accessible label. */
  'aria-hidden'?: boolean;
  /** ARIA role of the text. Defaults to `'text'`. */
  role?: string;
};

/**
 * Props of the content of {@link WaitForConnectionContent} (`customization.components.Content`), which replaces the
 * icon and text.
 */
export type WaitForConnectionContentContentProps = {
  /** The rendered icon. */
  icon: ReactNode;
  /** The rendered text. */
  text: ReactNode;
  /** Whether a wallet is connected. */
  isConnected: boolean;
  /** Accessible label of the container. */
  finalAriaLabel: string;
};

/**
 * Customization options for WaitForConnectionContent component
 */
export type WaitForConnectionContentCustomization = {
  /** Override container element props */
  containerProps?: Partial<Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'variants' | 'transition'>>;
  /** Custom components */
  components?: {
    /** Custom icon SVG component */
    Icon?: ComponentType<WaitForConnectionContentIconProps>;
    /** Custom path component */
    Path?: ComponentType<WaitForConnectionContentPathProps>;
    /** Custom text component */
    Text?: ComponentType<WaitForConnectionContentTextProps>;
    /** Custom content component (wraps everything) */
    Content?: ComponentType<WaitForConnectionContentContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and `className`.
     *
     * @param params - The connection state.
     * @param params.isConnected - Whether a wallet is connected.
     * @returns The classes.
     */
    container?: (params: { isConnected: boolean }) => string;
    /**
     * Returns the classes of the icon.
     *
     * @param params - The connection state.
     * @param params.isConnected - Whether a wallet is connected.
     * @returns The classes.
     */
    icon?: (params: { isConnected: boolean }) => string;
    /** Function to generate path classes */
    path?: () => string;
    /**
     * Returns the classes of the text.
     *
     * @param params - The connection state.
     * @param params.isConnected - Whether a wallet is connected.
     * @returns The classes.
     */
    text?: (params: { isConnected: boolean }) => string;
  };
  /** Custom animation variants */
  variants?: {
    /** Container motion variants */
    container?: Variants;
    /** Path motion variants */
    path?: Variants;
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
    /** Path animation configuration */
    path?: {
      /** Animation duration in seconds */
      duration?: number;
      /** Animation easing curve */
      ease?: Easing | Easing[];
      /** Animation delay in seconds */
      delay?: number;
    };
  };
  /** Custom SVG properties */
  svg?: {
    /** Custom viewBox */
    viewBox?: string;
    /** Custom stroke width */
    strokeWidth?: string | number;
    /** Custom stroke linecap */
    strokeLinecap?: 'butt' | 'round' | 'square';
    /** Custom stroke linejoin */
    strokeLinejoin?: 'miter' | 'bevel' | 'round';
    /** Custom wallet icon path */
    pathData?: string;
  };
  /** Configuration options */
  config?: {
    /** Whether to disable animations */
    disableAnimation?: boolean;
    /** Whether to reduce motion for accessibility */
    reduceMotion?: boolean;
    /** Whether to render nothing while a wallet is connected. Defaults to `true`. */
    hideWhenConnected?: boolean;
    /** Custom text to display */
    customText?: string;
  };
};

/** Props of {@link WaitForConnectionContent}. The other props are passed to the `framer-motion` container. */
export interface WaitForConnectionContentProps extends Omit<
  HTMLMotionProps<'div'>,
  'children' | 'initial' | 'animate' | 'exit' | 'variants' | 'transition' | 'style'
> {
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom aria-label for the container */
  'aria-label'?: string;
  /** Customization options */
  customization?: WaitForConnectionContentCustomization;
}

// --- Default Sub-Components ---
const DefaultIcon = ({
  pathData,
  className,
  'aria-hidden': ariaHidden = true,
  focusable = false,
  ...props
}: WaitForConnectionContentIconProps & Omit<ComponentPropsWithoutRef<'svg'>, 'style'>) => {
  return (
    <svg
      className={cn('novacon:w-5 novacon:h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
      focusable={focusable ? 'true' : 'false'}
      {...props}
    >
      <DefaultPath pathData={pathData} />
    </svg>
  );
};

const DefaultPath = ({
  pathData,
  variants = DEFAULT_PATH_ANIMATION_VARIANTS,
  className,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 1.5,
  ...props
}: WaitForConnectionContentPathProps & Omit<ComponentPropsWithoutRef<typeof motion.path>, 'style'>) => {
  return (
    <motion.path
      d={pathData}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
        delay: 0.1,
      }}
      className={className}
      {...props}
    />
  );
};

const DefaultText = ({
  text,
  className,
  'aria-hidden': ariaHidden = true,
  role = 'text',
  ...props
}: WaitForConnectionContentTextProps & Omit<ComponentPropsWithoutRef<'span'>, 'style'>) => {
  return (
    <span className={cn('novacon:font-medium', className)} role={role} aria-hidden={ariaHidden} {...props}>
      {text}
    </span>
  );
};

const DefaultContent = ({ icon, text }: Pick<WaitForConnectionContentContentProps, 'icon' | 'text'>) => {
  return (
    <>
      {icon}
      {text}
    </>
  );
};

/**
 * The content of the connect button while no wallet is connected: an animated wallet icon and the `connectWallet`
 * label (or `customization.config.customText`). By default it renders nothing while a wallet is connected
 * (`hideWhenConnected`). Animations can be turned off with `customization.config.disableAnimation` or `reduceMotion`.
 *
 * Props: {@link WaitForConnectionContentProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { WaitForConnectionContent } from '@tuwaio/nova-connect/components';
 *
 * export const Prompt = (
 *   <WaitForConnectionContent
 *     customization={{
 *       classNames: { text: () => 'text-blue-500' },
 *       animation: { path: { duration: 1.2, delay: 0.3 } },
 *       config: { customText: 'Please connect your wallet' },
 *     }}
 *   />
 * );
 * ```
 */
export const WaitForConnectionContent = forwardRef<HTMLDivElement, WaitForConnectionContentProps>(
  ({ className, 'aria-label': ariaLabel, customization, ...props }, ref) => {
    const labels = useNovaConnectLabels();
    const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);

    // Connection status check
    const isConnected = Boolean(activeConnection?.isConnected);

    // Extract custom components
    const {
      Icon = DefaultIcon,
      Path = DefaultPath,
      Text = DefaultText,
      Content = DefaultContent,
    } = customization?.components ?? {};

    // Configuration options
    const {
      hideWhenConnected = true,
      customText,
      disableAnimation = false,
      reduceMotion = false,
    } = customization?.config ?? {};

    // Text to display
    const displayText = customText || labels.connectWallet;

    // Aria-labels
    const defaultAriaLabel = labels.connectWallet;
    const finalAriaLabel = ariaLabel || defaultAriaLabel;

    // Default wallet icon path
    const defaultPathData =
      'M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3';

    // Path data
    const pathData = customization?.svg?.pathData || defaultPathData;

    // Generate container classes
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ isConnected })
      : cn('novacon:flex novacon:items-center novacon:gap-2', className);

    // Generate icon classes
    const iconClasses = customization?.classNames?.icon ? customization.classNames.icon({ isConnected }) : undefined;

    // Generate text classes
    const textClasses = customization?.classNames?.text ? customization.classNames.text({ isConnected }) : undefined;

    // Generate path classes
    const pathClasses = customization?.classNames?.path ? customization.classNames.path() : undefined;

    // Resolve animation variants
    const containerVariants = customization?.variants?.container || DEFAULT_CONTAINER_VARIANTS;
    const pathVariants = customization?.variants?.path || DEFAULT_PATH_ANIMATION_VARIANTS;

    // Resolve animation configuration
    const containerAnimation = {
      duration: customization?.animation?.container?.duration ?? 0.3,
      ease: customization?.animation?.container?.ease ?? [0.4, 0, 0.2, 1],
      delay: customization?.animation?.container?.delay ?? 0,
    };

    const pathAnimation = {
      duration: customization?.animation?.path?.duration ?? 0.5,
      ease: customization?.animation?.path?.ease ?? 'easeInOut',
      delay: customization?.animation?.path?.delay ?? 0.1,
    };

    // Create icon element
    const iconElement = customization?.components?.Icon ? (
      <Icon pathData={pathData} className={iconClasses} aria-hidden={true} focusable={false} />
    ) : (
      <svg
        className={cn('novacon:w-5 novacon:h-5', iconClasses)}
        fill="none"
        viewBox={customization?.svg?.viewBox ?? '0 0 24 24'}
        stroke="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <Path
          pathData={pathData}
          variants={disableAnimation || reduceMotion ? {} : pathVariants}
          className={pathClasses}
          strokeLinecap={customization?.svg?.strokeLinecap ?? 'round'}
          strokeLinejoin={customization?.svg?.strokeLinejoin ?? 'round'}
          strokeWidth={customization?.svg?.strokeWidth ?? 1.5}
          {...(!disableAnimation && !reduceMotion
            ? {
                initial: 'hidden',
                animate: 'visible',
                transition: pathAnimation,
              }
            : {})}
        />
      </svg>
    );

    // Create text element
    const textElement = <Text text={displayText} className={textClasses} aria-hidden={true} role="text" />;

    // Base props without animation properties
    const baseProps = {
      ...customization?.containerProps,
      ...props,
      // ref,
      className: containerClasses,
      role: 'img' as const,
      'aria-label': finalAriaLabel,
    };

    // Don't render if wallet is already connected and hideWhenConnected is true
    if (isConnected && hideWhenConnected) return null;

    // Conditional rendering with proper animation types
    if (disableAnimation || reduceMotion) {
      return (
        <motion.div ref={ref} {...baseProps}>
          {customization?.components?.Content ? (
            <Content icon={iconElement} text={textElement} isConnected={isConnected} finalAriaLabel={finalAriaLabel} />
          ) : (
            <DefaultContent icon={iconElement} text={textElement} />
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        {...baseProps}
        initial={containerVariants.initial as TargetAndTransition}
        animate={containerVariants.animate as TargetAndTransition}
        exit={containerVariants.exit as TargetAndTransition}
        transition={containerAnimation}
      >
        {customization?.components?.Content ? (
          <Content icon={iconElement} text={textElement} isConnected={isConnected} finalAriaLabel={finalAriaLabel} />
        ) : (
          <DefaultContent icon={iconElement} text={textElement} />
        )}
      </motion.div>
    );
  },
);

WaitForConnectionContent.displayName = 'WaitForConnectionContent';
