/**
 * @file This file contains the `StatusIcon` component, a customizable animated status icon with comprehensive styling
 * control.
 */

import { cn } from '@tuwaio/nova-core';
import { type Easing, type HTMLMotionProps, motion, type TargetAndTransition, type Variants } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ReactNode } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';

// --- Default Motion Variants ---
const DEFAULT_MOTION_PATH_VARIANTS: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

const DEFAULT_CONTAINER_VARIANTS: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

// --- Types for Customization ---
/** Props of the SVG of {@link StatusIcon} (`customization.components.Svg`). */
export type StatusIconSvgProps = {
  /** Path data (`d`) of the icon. */
  pathData: string;
  /** Classes from `customization.classNames.svg`. */
  className?: string;
  /** Always `true`: the container has the accessible label. */
  'aria-hidden'?: boolean;
  /** Always `false`. */
  focusable?: boolean;
};

/** Props of the animated path of {@link StatusIcon} (`customization.components.Path`). */
export type StatusIconPathProps = {
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

/** Props of the content of {@link StatusIcon} (`customization.components.Content`), which replaces the SVG. */
export type StatusIconContentProps = {
  /** The transaction status shown. */
  txStatus: 'succeed' | 'failed' | 'replaced';
  /** The `colorVar` prop. */
  colorVar: string;
  /** Path data (`d`) of the icon. */
  pathData: string;
  /** Accessible label of the icon. */
  finalAriaLabel: string;
};

/**
 * Customization options for StatusIcon component
 */
export type StatusIconCustomization = {
  /** Override container element props */
  containerProps?: Partial<
    Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'variants' | 'transition' | 'style'>
  >;
  /** Custom components */
  components?: {
    /** Custom SVG component */
    Svg?: ComponentType<StatusIconSvgProps>;
    /** Custom path component */
    Path?: ComponentType<StatusIconPathProps>;
    /** Custom content component (wraps everything) */
    Content?: ComponentType<StatusIconContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @param params - The icon state.
     * @param params.txStatus - The status shown.
     * @param params.colorVar - The `colorVar` prop.
     * @returns The classes.
     */
    container?: (params: { txStatus: 'succeed' | 'failed' | 'replaced'; colorVar: string }) => string;
    /**
     * Returns the classes of the SVG, instead of the default ones.
     *
     * @param params - The icon state.
     * @param params.txStatus - The status shown.
     * @param params.colorVar - The `colorVar` prop.
     * @returns The classes.
     */
    svg?: (params: { txStatus: 'succeed' | 'failed' | 'replaced'; colorVar: string }) => string;
    /**
     * Returns the classes of the path.
     *
     * @param params - The icon state.
     * @param params.txStatus - The status shown.
     * @returns The classes.
     */
    path?: (params: { txStatus: 'succeed' | 'failed' | 'replaced' }) => string;
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
  };
  /** Configuration options */
  config?: {
    /** Whether to disable animations */
    disableAnimation?: boolean;
    /** Whether to reduce motion for accessibility */
    reduceMotion?: boolean;
  };
};

/** Props of {@link StatusIcon}. The other props are passed to the `framer-motion` container. */
export interface StatusIconProps extends Omit<
  HTMLMotionProps<'div'>,
  'children' | 'initial' | 'animate' | 'exit' | 'variants' | 'transition' | 'style'
> {
  /** Transaction status type */
  txStatus: 'succeed' | 'failed' | 'replaced';
  /** Color name: the icon uses `--tuwa-<colorVar>-text` (for example `success`, `error`). */
  colorVar: string;
  /** Path data (`d`) of the icon, as a string; other children are ignored. */
  children: ReactNode;
  /** Custom aria-label for accessibility */
  'aria-label'?: string;
  /** Custom CSS classes for the container */
  className?: string;
  /** Customization options */
  customization?: StatusIconCustomization;
}

// --- Default Sub-Components ---
const DefaultSvg = ({
  pathData,
  className,
  'aria-hidden': ariaHidden = true,
  focusable = false,
  ...props
}: StatusIconSvgProps & Omit<ComponentPropsWithoutRef<'svg'>, 'style'>) => {
  return (
    <svg
      className={cn('novacon:w-4 novacon:h-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
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
  variants = DEFAULT_MOTION_PATH_VARIANTS,
  className,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  ...props
}: StatusIconPathProps & Omit<ComponentPropsWithoutRef<typeof motion.path>, 'style'>) => {
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

const DefaultContent = ({ pathData, finalAriaLabel }: Pick<StatusIconContentProps, 'pathData' | 'finalAriaLabel'>) => {
  return <DefaultSvg pathData={pathData} aria-label={finalAriaLabel} />;
};

/**
 * An animated status icon: an SVG path, drawn with `framer-motion`, in a circle colored with the
 * `--tuwa-<colorVar>-text` variable. The connect button shows it after a transaction of the connected wallet succeeded,
 * failed or was replaced. Pass the path data as children. Animations can be turned off with
 * `customization.config.disableAnimation` or `reduceMotion`.
 *
 * Props: {@link StatusIconProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { StatusIcon } from '@tuwaio/nova-connect/components';
 *
 * export const SucceedIcon = (
 *   <StatusIcon txStatus="succeed" colorVar="success">
 *     m4.5 12.75 6 6 9-13.5
 *   </StatusIcon>
 * );
 *
 * export const FailedIcon = (
 *   <StatusIcon
 *     txStatus="failed"
 *     colorVar="error"
 *     customization={{
 *       classNames: { container: ({ txStatus }) => `custom-status-${txStatus}` },
 *       animation: { path: { duration: 1, delay: 0.2 } },
 *       svg: { strokeWidth: 3, strokeLinecap: 'square' },
 *     }}
 *   >
 *     M6 18 18 6M6 6l12 12
 *   </StatusIcon>
 * );
 * ```
 */
export const StatusIcon = forwardRef<HTMLDivElement, StatusIconProps>(
  ({ txStatus, colorVar, children, 'aria-label': ariaLabel, className, customization, ...props }, ref) => {
    const labels = useNovaConnectLabels();

    // Extract path data from children
    const pathData = typeof children === 'string' ? children : '';

    // Extract custom components
    const { Svg = DefaultSvg, Path = DefaultPath, Content = DefaultContent } = customization?.components ?? {};

    // Default aria-label based on status
    const defaultAriaLabel = (() => {
      switch (txStatus) {
        case 'succeed':
          return labels.successIcon;
        case 'failed':
          return labels.errorIcon;
        case 'replaced':
          return labels.replacedIcon;
        default:
          return labels.statusIcon;
      }
    })();

    // Final aria-label
    const finalAriaLabel = ariaLabel || defaultAriaLabel;

    // Generate container classes
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ txStatus, colorVar })
      : cn(
          'novacon:w-6 novacon:h-6 novacon:rounded-full novacon:flex novacon:items-center novacon:justify-center novacon:shadow-sm',
          `novacon:text-[var(--tuwa-${colorVar}-text)] novacon:bg-[var(--tuwa-bg-primary)]`,
          className,
        );

    // Generate SVG classes
    const svgClasses = customization?.classNames?.svg
      ? customization.classNames.svg({ txStatus, colorVar })
      : undefined;

    // Generate path classes
    const pathClasses = customization?.classNames?.path ? customization.classNames.path({ txStatus }) : undefined;

    // Resolve animation variants
    const containerVariants = customization?.variants?.container || DEFAULT_CONTAINER_VARIANTS;
    const pathVariants = customization?.variants?.path || DEFAULT_MOTION_PATH_VARIANTS;

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

    // Check for reduced motion
    const shouldReduceMotion = customization?.config?.reduceMotion ?? false;
    const isAnimationDisabled = customization?.config?.disableAnimation ?? false;

    // Create SVG element with custom props
    const svgElement = customization?.components?.Svg ? (
      <Svg pathData={pathData} className={svgClasses} aria-hidden={true} focusable={false} />
    ) : (
      <svg
        className={cn('novacon:w-4 novacon:h-4', svgClasses)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox={customization?.svg?.viewBox ?? '0 0 24 24'}
        strokeWidth={customization?.svg?.strokeWidth ?? '2'}
        stroke="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <Path
          pathData={pathData}
          variants={isAnimationDisabled || shouldReduceMotion ? {} : pathVariants}
          className={pathClasses}
          strokeLinecap={customization?.svg?.strokeLinecap ?? 'round'}
          strokeLinejoin={customization?.svg?.strokeLinejoin ?? 'round'}
          strokeWidth={customization?.svg?.strokeWidth ?? 2}
          {...(!isAnimationDisabled && !shouldReduceMotion
            ? {
                initial: 'hidden',
                animate: 'visible',
                transition: pathAnimation,
              }
            : {})}
        />
      </svg>
    );

    // Base props without animation properties
    const baseProps = {
      ...customization?.containerProps,
      ...props,
      key: txStatus,
      className: containerClasses,

      role: 'img' as const,
      'aria-label': finalAriaLabel,
    };

    // Conditional rendering with proper animation types
    if (isAnimationDisabled || shouldReduceMotion) {
      return (
        <motion.div ref={ref} {...baseProps}>
          {customization?.components?.Content ? (
            <Content txStatus={txStatus} colorVar={colorVar} pathData={pathData} finalAriaLabel={finalAriaLabel} />
          ) : (
            svgElement
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        {...baseProps}
        key={baseProps?.key ?? 'status'}
        initial={containerVariants.initial as TargetAndTransition}
        animate={containerVariants.animate as TargetAndTransition}
        exit={containerVariants.exit as TargetAndTransition}
        transition={containerAnimation}
      >
        {customization?.components?.Content ? (
          <Content txStatus={txStatus} colorVar={colorVar} pathData={pathData} finalAriaLabel={finalAriaLabel} />
        ) : (
          svgElement
        )}
      </motion.div>
    );
  },
);

StatusIcon.displayName = 'StatusIcon';
