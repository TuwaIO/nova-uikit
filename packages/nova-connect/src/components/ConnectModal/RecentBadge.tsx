/**
 * @file RecentBadge component with comprehensive customization options: a square accent chip with a still frame, or a light running along it.
 */

import { cn, isTouchDevice } from '@tuwaio/nova-core/utils';
import { motion, useReducedMotion } from 'framer-motion';
import React, { ComponentType, forwardRef, memo, useEffect, useEffectEvent } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';

// --- Types ---

/**
 * Animation of the gradient border of {@link RecentBadge} (`config.animation`).
 */
export interface BadgeAnimationConfig {
  /** Animation duration in seconds (default: `4`) */
  duration: number;
  /** Framer Motion easing (default: `linear`) */
  ease:
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'circIn'
    | 'circOut'
    | 'circInOut'
    | 'backIn'
    | 'backOut'
    | 'backInOut'
    | 'anticipate';
  /** Whether animation should repeat infinitely (default: `true`) */
  repeat: boolean;
  /** Initial `background-position-x` (default: `100%`) */
  initialPosition: string;
  /** Final `background-position-x` (default: `-100%`) */
  finalPosition: string;
}

/**
 * Gradient of the border of {@link RecentBadge} (`config.gradient`).
 */
export interface BadgeGradientConfig {
  /** Direction of the gradient (default: `90deg`) */
  direction: string;
  /**
   * Color stops of the frame (default: the accent at 40% with a brighter stripe of the accent at 20%, which shows only when
   * the frame runs; still, the frame is one color)
   */
  stops: Array<{
    /** Position percentage (0-100) */
    position: number;
    /** Color value (CSS color, CSS variable, or rgba) */
    color: string;
  }>;
  /** `background-size` of the gradient (default: `200% 100%`) */
  backgroundSize: string;
}

// --- Component Props Types ---
/**
 * Props for a custom container (a `span` by default).
 */
export type RecentBadgeContainerProps = {
  /** Classes from `classNames.container`, or the defaults with the `className` prop */
  className?: string;
  /** The gradient, the background overlay and the content */
  children: React.ReactNode;
  /** `status` */
  role?: string;
  /** `config.ariaLabels.container`, the `aria-label` prop, the text of `children` or the `recent` label */
  'aria-label'?: string;
} & React.RefAttributes<HTMLSpanElement>;

/**
 * Props for a custom gradient border (a `motion.span` moving its background by default).
 */
export type RecentBadgeAnimatedGradientProps = {
  /** Classes from `classNames.animatedGradient` or the defaults */
  className?: string;
  /** The `animated` prop */
  animated: boolean;
  /** The animation, with `config.animation` applied */
  animationConfig: BadgeAnimationConfig;
  /** The gradient, with `config.gradient` applied */
  gradientConfig: BadgeGradientConfig;
};

/**
 * Props for a custom background overlay (covers the gradient except a 1px border).
 */
export type RecentBadgeBackgroundOverlayProps = {
  /** Classes from `classNames.backgroundOverlay` or the defaults */
  className?: string;
};

/**
 * Props for a custom content wrapper.
 */
export type RecentBadgeContentProps = {
  /** Classes from `classNames.content` or the defaults */
  className?: string;
  /** The `children` prop */
  children: React.ReactNode;
};

/**
 * Customization options of {@link RecentBadge}.
 */
export type RecentBadgeCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<RecentBadgeContainerProps>;
    /** Custom animated gradient component */
    AnimatedGradient?: ComponentType<RecentBadgeAnimatedGradientProps>;
    /** Custom background overlay */
    BackgroundOverlay?: ComponentType<RecentBadgeBackgroundOverlayProps>;
    /** Custom content wrapper */
    Content?: ComponentType<RecentBadgeContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop.
     *
     * @param params - The badge state.
     * @param params.isTouch - Whether the device has a touch screen (smaller badge by default).
     * @param params.animated - The `animated` prop.
     * @returns The classes.
     */
    container?: (params: { isTouch: boolean; animated: boolean }) => string;
    /**
     * Returns the classes of the gradient border, instead of the default ones.
     *
     * @returns The classes.
     */
    animatedGradient?: () => string;
    /**
     * Returns the classes of the background overlay, instead of the default ones.
     *
     * @returns The classes.
     */
    backgroundOverlay?: () => string;
    /**
     * Returns the classes of the content, instead of the default ones.
     *
     * @returns The classes.
     */
    content?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Called after mount */
    onMount?: () => void;
    /** Called on unmount */
    onUnmount?: () => void;
  };
  /** Configuration options */
  config?: {
    /** A light runs along the frame (default: `true`; `false` keeps the frame still; the `animated` prop wins) */
    animated?: boolean;
    /** Custom animation configuration */
    animation?: Partial<BadgeAnimationConfig>;
    /** Custom gradient configuration */
    gradient?: Partial<BadgeGradientConfig>;
    /** Custom ARIA labels */
    ariaLabels?: {
      /** ARIA label of the badge (before the `aria-label` prop) */
      container?: string;
    };
    /** Whether to use the touch device size, instead of `isTouchDevice` of `@tuwaio/nova-core` */
    touchDevice?: boolean;
  };
};

/**
 * Props for the {@link RecentBadge} component.
 */
export interface RecentBadgeProps {
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** Content to display inside the badge (default: the `recent` label) */
  children?: React.ReactNode;
  /** Whether a light runs along the frame (default: `config.animated`, else `true`; `false` keeps it still, in one color) */
  animated?: boolean;
  /** ARIA label of the badge (default: the text of `children`) */
  'aria-label'?: string;
  /** Customization options */
  customization?: RecentBadgeCustomization;
}

/**
 * Default animation configuration
 */
const defaultAnimationConfig: BadgeAnimationConfig = {
  duration: 4,
  ease: 'linear',
  repeat: true,
  initialPosition: '100%',
  finalPosition: '-100%',
};

/**
 * Default border configuration: paper and ink, a frame of 1 px in the accent, one color (no gradient). With `animated`, a
 * brighter light runs along it.
 */
const FRAME = 'color-mix(in srgb, var(--tuwa-text-accent) 40%, transparent)';
const defaultGradientConfig: BadgeGradientConfig = {
  direction: '90deg',
  stops: [
    { position: 0, color: FRAME },
    { position: 20, color: 'var(--tuwa-text-accent)' },
    { position: 40, color: FRAME },
  ],
  backgroundSize: '200% 100%',
};

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLSpanElement, RecentBadgeContainerProps>(
  ({ children, className, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultAnimatedGradient: React.FC<RecentBadgeAnimatedGradientProps> = ({
  className,
  animated,
  animationConfig,
  gradientConfig,
}) => {
  const reduceMotion = useReducedMotion();
  const gradientBackground = (() => {
    const stops = gradientConfig.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
    return `linear-gradient(${gradientConfig.direction}, ${stops})`;
  })();

  const animatedStyle = {
    background: gradientBackground,
    backgroundSize: gradientConfig.backgroundSize,
  };

  // A repaint on every frame for as long as the list is open, and against what the person asked for
  if (!animated || reduceMotion) {
    // Still: where the light ends its run, past the stops of the light (the frame in one color by default)
    return (
      <span className={className} style={{ ...animatedStyle, backgroundPositionX: animationConfig.finalPosition }} />
    );
  }

  return (
    <motion.span
      className={className}
      style={animatedStyle}
      initial={{ backgroundPositionX: animationConfig.initialPosition }}
      animate={{ backgroundPositionX: animationConfig.finalPosition }}
      transition={{
        duration: animationConfig.duration,
        ease: animationConfig.ease,
        repeat: animationConfig.repeat ? Infinity : 0,
      }}
    />
  );
};

const DefaultBackgroundOverlay: React.FC<RecentBadgeBackgroundOverlayProps> = ({ className }) => (
  <span className={className} />
);

const DefaultContent: React.FC<RecentBadgeContentProps> = ({ children, className }) => (
  <span className={className}>{children}</span>
);

/**
 * The "Recent" badge of a wallet card: a square chip in the accent, its label in monospace capitals, with a frame of 1 px
 * along which a light runs (Framer Motion); `animated={false}` (or `config.animated: false`) keeps the frame still, and
 * so does reduced motion. It is smaller on touch devices.
 *
 * Props: {@link RecentBadgeProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { RecentBadge } from '@tuwaio/nova-connect/components';
 *
 * export const Badge = (
 *   <RecentBadge
 *     customization={{
 *       config: {
 *         animated: true,
 *         animation: { duration: 2, ease: 'easeInOut' },
 *         gradient: {
 *           direction: '45deg',
 *           stops: [
 *             { position: 0, color: 'transparent' },
 *             { position: 50, color: 'rgba(59, 130, 246, 0.8)' },
 *             { position: 100, color: 'transparent' },
 *           ],
 *         },
 *       },
 *     }}
 *   >
 *     Last used
 *   </RecentBadge>
 * );
 * ```
 */
export const RecentBadge = memo(
  forwardRef<HTMLSpanElement, RecentBadgeProps>(
    ({ className, children: childrenProp, animated: animatedProp, 'aria-label': ariaLabel, customization }, ref) => {
      // The light runs by default: the badge draws the eye to the wallet of the last visit
      const animated = animatedProp ?? customization?.config?.animated ?? true;
      const labels = useNovaConnectLabels();
      const children = childrenProp ?? labels.recent;

      // Extract customization options
      const {
        Container: CustomContainer = DefaultContainer,
        AnimatedGradient: CustomAnimatedGradient = DefaultAnimatedGradient,
        BackgroundOverlay: CustomBackgroundOverlay = DefaultBackgroundOverlay,
        Content: CustomContent = DefaultContent,
      } = customization?.components ?? {};

      const customHandlers = customization?.handlers;
      const customConfig = customization?.config;

      // Detect touch device with customization override
      // Detect touch device with customization override
      const isTouch = customConfig?.touchDevice ?? isTouchDevice();

      /**
       * Memoized animation configuration with customization
       */
      /**
       * Animation configuration with customization
       */
      const animationConfig: BadgeAnimationConfig = {
        ...defaultAnimationConfig,
        ...customConfig?.animation,
      };

      /**
       * Memoized gradient configuration with customization
       */
      /**
       * Gradient configuration with customization
       */
      const gradientConfig: BadgeGradientConfig = {
        ...defaultGradientConfig,
        ...customConfig?.gradient,
        stops: customConfig?.gradient?.stops ?? defaultGradientConfig.stops,
      };

      /**
       * Generate container classes with proper memoization dependencies
       */
      /**
       * Generate container classes
       */
      const containerClasses = (() => {
        if (customization?.classNames?.container) {
          return customization.classNames.container({ isTouch, animated });
        }

        // Paper and ink: a square chip, monospace capitals with spacing, in the accent
        const sizeClasses = isTouch ? 'novacon:px-1.5 novacon:py-0.5' : 'novacon:px-2 novacon:py-1';

        return cn(
          'novacon:relative novacon:flex novacon:items-center novacon:justify-center novacon:overflow-hidden',
          'novacon:font-mono novacon:text-[10px] novacon:font-bold novacon:uppercase novacon:tracking-[0.12em] novacon:leading-3',
          'novacon:text-[var(--tuwa-text-accent)]',
          'novacon:rounded-[var(--tuwa-rounded-corners)]',
          sizeClasses,
          className,
        );
      })();

      /**
       * Memoized animated gradient classes
       */
      /**
       * Animated gradient classes
       */
      const animatedGradientClasses =
        customization?.classNames?.animatedGradient?.() ??
        'novacon:absolute novacon:inset-0 novacon:z-0 novacon:pointer-events-none novacon:rounded-[var(--tuwa-rounded-corners)]';

      /**
       * Memoized background overlay classes
       */
      /**
       * Background overlay classes
       */
      const backgroundOverlayClasses =
        customization?.classNames?.backgroundOverlay?.() ??
        'novacon:absolute novacon:z-10 novacon:pointer-events-none novacon:rounded-[var(--tuwa-rounded-corners)] novacon:bg-[color-mix(in_srgb,var(--tuwa-text-accent)_6%,var(--tuwa-bg-primary))] novacon:inset-[1px]';

      /**
       * Memoized content classes
       */
      /**
       * Content classes
       */
      const contentClasses =
        customization?.classNames?.content?.() ?? 'novacon:relative novacon:z-20 novacon:whitespace-nowrap';

      /**
       * Generate ARIA label with proper memoization dependencies
       */
      /**
       * Generate ARIA label
       */
      const finalAriaLabel = (() => {
        if (customConfig?.ariaLabels?.container) return customConfig.ariaLabels.container;
        if (ariaLabel) return ariaLabel;
        if (typeof children === 'string') return children;
        return labels.recent;
      })();

      // The handlers are read through Effect Events, so new handler functions on every render do not re-run the effect
      const onMount = useEffectEvent(() => customHandlers?.onMount?.());
      const onUnmount = useEffectEvent(() => customHandlers?.onUnmount?.());
      useEffect(() => {
        onMount();
        return () => onUnmount();
      }, []);

      return (
        <CustomContainer ref={ref} className={containerClasses} role="status" aria-label={finalAriaLabel}>
          {/* Animated gradient border */}
          <CustomAnimatedGradient
            className={animatedGradientClasses}
            animated={animated}
            animationConfig={animationConfig}
            gradientConfig={gradientConfig}
          />

          {/* Background overlay */}
          <CustomBackgroundOverlay className={backgroundOverlayClasses} />

          {/* Content */}
          <CustomContent className={contentClasses}>{children}</CustomContent>
        </CustomContainer>
      );
    },
  ),
);

RecentBadge.displayName = 'RecentBadge';
