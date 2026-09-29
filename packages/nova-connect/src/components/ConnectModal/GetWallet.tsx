/**
 * @file GetWallet component with comprehensive customization options and staggered animations.
 */

import { cn, StarsBackground, WalletIcon } from '@tuwaio/nova-core';
import { AnimatePresence, motion } from 'framer-motion';
import React, { ComponentType, forwardRef, useEffect, useEffectEvent } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { formatLabel } from '../../i18n/formatLabel';

// --- Types ---

/**
 * A floating wallet icon of {@link GetWallet}.
 */
export interface WalletIconConfig {
  /** Wallet name for `WalletIcon` of `@tuwaio/nova-core` (for example `metamask`) */
  walletKey: string;
  /** Position configuration using predefined position classes */
  position: {
    /** Top position class (e.g., 'top-[5%]', 'top-4') */
    top?: string;
    /** Bottom position class (e.g., 'bottom-[10%]', 'bottom-4') */
    bottom?: string;
    /** Left position class (e.g., 'left-[5%]', 'left-4') */
    left?: string;
    /** Right position class (e.g., 'right-[10%]', 'right-4') */
    right?: string;
    /** Transform classes for centering */
    transform?: string;
  };
  /** Size configuration using predefined size classes */
  size: {
    /** Width and height classes for mobile */
    mobile: {
      /** Width class (for example `novacon:w-20`) */
      width: string;
      /** Height class */
      height: string;
    };
    /** Width and height classes for desktop */
    desktop: {
      /** Width class with a breakpoint (for example `novacon:md:w-24`) */
      width: string;
      /** Height class with a breakpoint */
      height: string;
    };
  };
  /** Animation configuration */
  animation: {
    /** Animation duration in milliseconds */
    duration: number;
    /** Animation delay in milliseconds */
    delay: number;
    /** Whether to reverse animation direction */
    reverse?: boolean;
    /** CSS easing of the float animation (default: `config.animation.defaultEase` or `ease-in-out`) */
    ease?: string;
  };
  /** Wallet name in the default ARIA label of the icon (default: the wallet key) */
  name?: string;
  /** ARIA label of the icon (default: `name` followed by the `walletIcon` label) */
  ariaLabel?: string;
}

// --- Component Props Types ---
/**
 * Props for a custom container (a `section` by default).
 */
export type GetWalletContainerProps = {
  /** Classes from `classNames.container`, or the defaults with the `className` prop */
  className?: string;
  /** The animation section and the content section */
  children: React.ReactNode;
  /** `region` */
  role?: string;
  /** `config.ariaLabels.container`, the `aria-label` prop or the `startExploringWeb3` label */
  'aria-label'?: string;
  /** The `data-testid` prop */
  'data-testid'?: string;
} & React.RefAttributes<HTMLElement>;

/**
 * Props for a custom animation section (the area with the floating icons).
 */
export type GetWalletAnimationSectionProps = {
  /** Classes from `classNames.animationSection` or the defaults */
  className?: string;
  /** The stars background, the gradient overlay and the animation wrapper */
  children: React.ReactNode;
  /** `banner` */
  role?: string;
  /** `config.ariaLabels.animationSection` or the `walletIconsAnimation` label */
  'aria-label'?: string;
};

/**
 * Props for a custom stars background.
 */
export type GetWalletStarsBackgroundProps = {
  /** Classes from `classNames.starsBackground` */
  className?: string;
  /** The `showStarsBackground` prop */
  show: boolean;
  /** `true` */
  'aria-hidden'?: boolean;
};

/**
 * Props for a custom gradient overlay.
 */
export type GetWalletGradientOverlayProps = {
  /** Classes from `classNames.gradientOverlay` or the defaults */
  className?: string;
  /** `true` */
  'aria-hidden'?: boolean;
};

/**
 * Props for a custom wrapper of the wallet icons (the default one scales them in with Framer Motion).
 */
export type GetWalletAnimationWrapperProps = {
  /** Classes from `classNames.animationWrapper` or the defaults */
  className?: string;
  /** The wallet icons and a screen reader text */
  children: React.ReactNode;
  /** `group` */
  role?: string;
  /** `config.ariaLabels.animationWrapper` or the `popularWalletIcons` label */
  'aria-label'?: string;
  /** The `enableAnimations` prop */
  enableAnimations: boolean;
  /** Delay of the entrance animation in milliseconds (`0`) */
  animationDelay?: number;
  /** Duration of the entrance animation in milliseconds (`500`) */
  animationDuration?: number;
};

/**
 * Props for a custom wallet icon.
 */
export type GetWalletIconProps = {
  /** The icon, with the `config.animation` multipliers applied */
  config: WalletIconConfig;
  /** The `enableAnimations` prop */
  enableAnimations: boolean;
  /** Classes from `classNames.walletIcon` */
  className?: string;
};

/**
 * Props for a custom content section (title and description).
 */
export type GetWalletContentSectionProps = {
  /** Classes from `classNames.contentSection` or the defaults */
  className?: string;
  /** The title, the description and a screen reader text */
  children: React.ReactNode;
  /** `main` */
  role?: string;
};

/**
 * Props for a custom title.
 */
export type GetWalletTitleProps = {
  /** Classes from `classNames.title` or the defaults */
  className?: string;
  /** The `startExploringWeb3` label */
  children: React.ReactNode;
  /** `heading` */
  role?: string;
  /** `2` */
  'aria-level'?: number;
};

/**
 * Props for a custom description.
 */
export type GetWalletDescriptionProps = {
  /** Classes from `classNames.description` or the defaults */
  className?: string;
  /** The `walletKeyToDigitalWorld` label */
  children: React.ReactNode;
  /** `text` */
  role?: string;
};

/**
 * Props for a custom screen reader text (visually hidden by default).
 */
export type GetWalletScreenReaderProps = {
  /** Classes from `classNames.screenReader` or `novacon:sr-only` */
  className?: string;
  /** An English description of the section */
  children: React.ReactNode;
};

/**
 * Customization options of {@link GetWallet}.
 */
export type GetWalletCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<GetWalletContainerProps>;
    /** Custom animation section */
    AnimationSection?: ComponentType<GetWalletAnimationSectionProps>;
    /** Custom stars background */
    StarsBackground?: ComponentType<GetWalletStarsBackgroundProps>;
    /** Custom gradient overlay */
    GradientOverlay?: ComponentType<GetWalletGradientOverlayProps>;
    /** Custom animation wrapper */
    AnimationWrapper?: ComponentType<GetWalletAnimationWrapperProps>;
    /** Custom wallet icon display */
    WalletIcon?: ComponentType<GetWalletIconProps>;
    /** Custom content section */
    ContentSection?: ComponentType<GetWalletContentSectionProps>;
    /** Custom title component */
    Title?: ComponentType<GetWalletTitleProps>;
    /** Custom description component */
    Description?: ComponentType<GetWalletDescriptionProps>;
    /** Custom screen reader component */
    ScreenReader?: ComponentType<GetWalletScreenReaderProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and the `className` prop.
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    container?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the animation section, instead of the default ones.
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    animationSection?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the stars background (none by default).
     *
     * @returns The classes.
     */
    starsBackground?: () => string;
    /**
     * Returns the classes of the gradient overlay, instead of the default ones.
     *
     * @returns The classes.
     */
    gradientOverlay?: () => string;
    /**
     * Returns the classes of the wrapper of the wallet icons, instead of the default ones.
     *
     * @returns The classes.
     */
    animationWrapper?: () => string;
    /**
     * Returns classes added to a wallet icon.
     *
     * @param params - The icon.
     * @param params.config - The icon configuration.
     * @param params.enableAnimations - The `enableAnimations` prop.
     * @returns The classes.
     */
    walletIcon?: (params: { config: WalletIconConfig; enableAnimations: boolean }) => string;
    /**
     * Returns the classes of the content section, instead of the default ones.
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    contentSection?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the title, instead of the default ones.
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    title?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the description, instead of the default ones.
     *
     * @returns The classes.
     */
    description?: () => string;
    /**
     * Returns the classes of the screen reader texts, instead of the default ones.
     *
     * @returns The classes.
     */
    screenReader?: () => string;
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
    /** Custom ARIA labels */
    ariaLabels?: {
      /** ARIA label of the container (before the `aria-label` prop) */
      container?: string;
      /** ARIA label of the animation section (default: the `walletIconsAnimation` label) */
      animationSection?: string;
      /** ARIA label of the icons wrapper (default: the `popularWalletIcons` label) */
      animationWrapper?: string;
    };
    /** Animation configuration overrides */
    animation?: {
      /** Multiplies the float duration of every icon (default: `1`) */
      durationMultiplier?: number;
      /** Multiplies the float delay of every icon (default: `1`) */
      delayMultiplier?: number;
      /** CSS easing for icons without `animation.ease` (default: `ease-in-out`) */
      defaultEase?: string;
    };
  };
};

/**
 * Props for the {@link GetWallet} component.
 */
export interface GetWalletProps {
  /** Classes added to the default container classes (ignored when `classNames.container` is set) */
  className?: string;
  /** ARIA label of the container (default: the `startExploringWeb3` label) */
  'aria-label'?: string;
  /** Custom test ID for testing purposes */
  'data-testid'?: string;
  /** Uses a lower animation section and smaller texts (default: `false`) */
  compact?: boolean;
  /** Whether the icons scale in and float (default: `true`) */
  enableAnimations?: boolean;
  /** Custom wallet icons to display instead of defaults */
  customWalletIcons?: WalletIconConfig[];
  /** Whether to show the background stars animation (default: `true`) */
  showStarsBackground?: boolean;
  /** Customization options */
  customization?: GetWalletCustomization;
}

/**
 * Default wallet icons configuration with staggered animations
 */
const defaultWalletIcons: WalletIconConfig[] = [
  {
    walletKey: 'metamask',
    position: {
      top: 'novacon:top-[5%]',
      left: 'novacon:left-[5%]',
    },
    size: {
      mobile: { width: 'novacon:w-20', height: 'novacon:h-20' },
      desktop: { width: 'novacon:md:w-24', height: 'novacon:md:h-24' },
    },
    animation: {
      duration: 3500,
      delay: 200,
      ease: 'ease-in-out',
    },
    name: 'MetaMask',
  },
  {
    walletKey: 'coinbase',
    position: {
      top: 'novacon:top-[10%]',
      right: 'novacon:right-[10%]',
    },
    size: {
      mobile: { width: 'novacon:w-16', height: 'novacon:h-16' },
      desktop: { width: 'novacon:md:w-20', height: 'novacon:md:h-20' },
    },
    animation: {
      duration: 5000,
      delay: 800,
      reverse: true,
      ease: 'ease-out',
    },
    name: 'Coinbase Wallet',
  },
  {
    walletKey: 'trust',
    position: {
      top: 'novacon:top-[25%]',
      left: 'novacon:left-1/2',
      transform: 'novacon:-translate-x-1/2',
    },
    size: {
      mobile: { width: 'novacon:w-20', height: 'novacon:h-20' },
      desktop: { width: 'novacon:md:w-24', height: 'novacon:md:h-24' },
    },
    animation: {
      duration: 8000,
      delay: 4000,
      ease: 'ease-in-out',
    },
    name: 'Trust Wallet',
  },
  {
    walletKey: 'rabby',
    position: {
      bottom: 'novacon:bottom-[10%]',
      left: 'novacon:left-[10%]',
    },
    size: {
      mobile: { width: 'novacon:w-20', height: 'novacon:h-20' },
      desktop: { width: 'novacon:md:w-20', height: 'novacon:md:h-20' },
    },
    animation: {
      duration: 4500,
      delay: 2500,
      reverse: true,
      ease: 'ease-in',
    },
    name: 'Rabby Wallet',
  },
  {
    walletKey: 'phantom',
    position: {
      bottom: 'novacon:bottom-[15%]',
      right: 'novacon:right-[15%]',
    },
    size: {
      mobile: { width: 'novacon:w-14', height: 'novacon:h-14' },
      desktop: { width: 'novacon:md:w-18', height: 'novacon:md:h-18' },
    },
    animation: {
      duration: 4000,
      delay: 500,
      ease: 'ease-out',
    },
    name: 'Phantom',
  },
];

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLElement, GetWalletContainerProps>(({ children, className, ...props }, ref) => (
  <section ref={ref} className={className} {...props}>
    {children}
  </section>
));
DefaultContainer.displayName = 'DefaultContainer';

const DefaultAnimationSection: React.FC<GetWalletAnimationSectionProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const DefaultStarsBackground: React.FC<GetWalletStarsBackgroundProps> = ({ className, show, ...props }) => (
  <>
    {show && (
      <div className={className} {...props}>
        <StarsBackground starsCount={50} />
      </div>
    )}
  </>
);

const DefaultGradientOverlay: React.FC<GetWalletGradientOverlayProps> = ({ className, ...props }) => (
  <div className={className} {...props} />
);

const DefaultAnimationWrapper: React.FC<GetWalletAnimationWrapperProps> = ({
  children,
  className,
  enableAnimations,
  animationDelay = 0,
  animationDuration = 500,
  ...props
}) => {
  if (!enableAnimations) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.1 }}
        transition={{
          duration: animationDuration / 1000,
          delay: animationDelay / 1000,
          ease: 'easeOut',
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const DefaultWalletIcon: React.FC<GetWalletIconProps> = ({ config, enableAnimations, className }) => {
  const labels = useNovaConnectLabels();
  const { walletKey, position, size, animation, name, ariaLabel } = config;

  const positionClasses = (() => {
    const classes = ['novacon:absolute'];

    if (position.top) classes.push(position.top);
    if (position.bottom) classes.push(position.bottom);
    if (position.left) classes.push(position.left);
    if (position.right) classes.push(position.right);
    if (position.transform) classes.push(position.transform);

    return cn(classes);
  })();

  const sizeClasses = cn(
    size.mobile.width,
    size.mobile.height,
    size.desktop.width,
    size.desktop.height,
    // Icon styling
    'novacon:[&>img]:w-full!',
    'novacon:[&>img]:h-full!',
    'novacon:[&>svg]:w-full!',
    'novacon:[&>svg]:h-full!',
  );

  const animationClasses = enableAnimations
    ? 'novacon:animate-[float_var(--float-duration,3000ms)_var(--float-ease,ease-in-out)_var(--float-delay,0ms)_infinite_var(--float-direction,normal)]'
    : '';

  const animationStyle = (() => {
    if (!enableAnimations) return {};

    return {
      '--float-duration': `${animation.duration}ms`,
      '--float-delay': `${animation.delay}ms`,
      '--float-ease': animation.ease || 'ease-in-out',
      '--float-direction': animation.reverse ? 'reverse' : 'normal',
    } as React.CSSProperties;
  })();

  return (
    <div
      className={cn(positionClasses, sizeClasses, animationClasses, className)}
      style={{ ...animationStyle }}
      role="img"
      aria-label={ariaLabel || `${name ?? walletKey} ${labels.walletIcon}`}
      data-testid={`wallet-icon-${walletKey}`}
    >
      <WalletIcon walletName={walletKey} />
    </div>
  );
};

const DefaultContentSection: React.FC<GetWalletContentSectionProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const DefaultTitle: React.FC<GetWalletTitleProps> = ({ children, className, ...props }) => (
  <h2 className={className} {...props}>
    {children}
  </h2>
);

const DefaultDescription: React.FC<GetWalletDescriptionProps> = ({ children, className, ...props }) => (
  <p className={className} {...props}>
    {children}
  </p>
);

const DefaultScreenReader: React.FC<GetWalletScreenReaderProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

/**
 * The "Get a wallet" screen of the connect modal: floating icons of popular wallets (MetaMask, Coinbase, Trust, Rabby,
 * Phantom by default) over a stars background, a title and a description from the Nova Connect labels.
 *
 * Props: {@link GetWalletProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { GetWallet } from '@tuwaio/nova-connect/components';
 *
 * export const Intro = (
 *   <GetWallet
 *     compact
 *     customization={{
 *       classNames: {
 *         container: ({ compact }) => (compact ? 'custom-compact' : 'custom-full'),
 *       },
 *       config: { animation: { durationMultiplier: 1.5, delayMultiplier: 0.8 } },
 *     }}
 *   />
 * );
 * ```
 */
export const GetWallet = forwardRef<HTMLElement, GetWalletProps>(
  (
    {
      className,
      'aria-label': ariaLabel,
      'data-testid': testId,
      compact = false,
      enableAnimations = true,
      customWalletIcons,
      showStarsBackground = true,
      customization,
    },
    ref,
  ) => {
    // Get localized labels for UI text
    const labels = useNovaConnectLabels();

    // Extract customization options
    const {
      Container: CustomContainer = DefaultContainer,
      AnimationSection: CustomAnimationSection = DefaultAnimationSection,
      StarsBackground: CustomStarsBackground = DefaultStarsBackground,
      GradientOverlay: CustomGradientOverlay = DefaultGradientOverlay,
      AnimationWrapper: CustomAnimationWrapper = DefaultAnimationWrapper,
      WalletIcon: CustomWalletIcon = DefaultWalletIcon,
      ContentSection: CustomContentSection = DefaultContentSection,
      Title: CustomTitle = DefaultTitle,
      Description: CustomDescription = DefaultDescription,
      ScreenReader: CustomScreenReader = DefaultScreenReader,
    } = customization?.components ?? {};

    const customHandlers = customization?.handlers;
    const customConfig = customization?.config;

    /**
     * Memoized wallet icons configuration with applied multipliers
     */
    /**
     * Wallet icons configuration with applied multipliers
     */
    const walletIcons = (customWalletIcons || defaultWalletIcons).map((icon) => {
      const durationMultiplier = customConfig?.animation?.durationMultiplier ?? 1;
      const delayMultiplier = customConfig?.animation?.delayMultiplier ?? 1;

      return {
        ...icon,
        animation: {
          ...icon.animation,
          duration: Math.round(icon.animation.duration * durationMultiplier),
          delay: Math.round(icon.animation.delay * delayMultiplier),
          ease: icon.animation.ease || customConfig?.animation?.defaultEase || 'ease-in-out',
        },
      };
    });

    /**
     * Memoized container classes
     */
    const containerClasses = customization?.classNames?.container?.({ compact }) ?? cn('novacon:m-[-16px]', className);

    /**
     * Memoized animation section classes
     */
    /**
     * Animation section classes
     */
    const animationSectionClasses =
      customization?.classNames?.animationSection?.({ compact }) ??
      cn(
        'novacon:relative novacon:w-full novacon:overflow-hidden novacon:p-4',
        compact ? 'novacon:h-48' : 'novacon:h-64',
      );

    /**
     * Memoized stars background classes
     */
    /**
     * Stars background classes
     */
    const starsBackgroundClasses = customization?.classNames?.starsBackground?.() ?? '';

    /**
     * Memoized gradient overlay classes
     */
    /**
     * Gradient overlay classes
     */
    const gradientOverlayClasses =
      customization?.classNames?.gradientOverlay?.() ??
      cn(
        'novacon:absolute novacon:inset-0 novacon:z-1',
        'novacon:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]',
      );

    /**
     * Memoized animation wrapper classes
     */
    /**
     * Animation wrapper classes
     */
    const animationWrapperClasses =
      customization?.classNames?.animationWrapper?.() ??
      cn('novacon:relative novacon:z-2 novacon:w-full novacon:h-full', 'novacon:px-2 md:novacon:px-4');

    /**
     * Memoized content section classes
     */
    /**
     * Content section classes
     */
    const contentSectionClasses =
      customization?.classNames?.contentSection?.({ compact }) ??
      cn(
        'novacon:text-center',
        compact ? 'novacon:pb-3 novacon:px-2 novacon:md:px-3' : 'novacon:pb-4 novacon:px-2 novacon:md:px-4',
      );

    /**
     * Memoized title classes
     */
    /**
     * Title classes
     */
    const titleClasses =
      customization?.classNames?.title?.({ compact }) ??
      cn(
        'novacon:font-bold novacon:font-mono novacon:mb-2 novacon:text-[var(--tuwa-text-primary)]',
        compact ? 'novacon:text-lg' : 'novacon:text-xl',
      );

    /**
     * Memoized description classes
     */
    /**
     * Description classes
     */
    const descriptionClasses =
      customization?.classNames?.description?.() ?? 'novacon:text-[var(--tuwa-text-secondary)]';

    /**
     * Memoized screen reader classes
     */
    /**
     * Screen reader classes
     */
    const screenReaderClasses = customization?.classNames?.screenReader?.() ?? 'novacon:sr-only';

    // The handlers are read through Effect Events, so a new `handlers` object on every render does not re-run the effect
    const onMount = useEffectEvent(() => customHandlers?.onMount?.());
    const onUnmount = useEffectEvent(() => customHandlers?.onUnmount?.());
    useEffect(() => {
      onMount();
      return () => onUnmount();
    }, []);

    return (
      <CustomContainer
        ref={ref}
        className={containerClasses}
        role="region"
        aria-label={customConfig?.ariaLabels?.container ?? ariaLabel ?? labels.startExploringWeb3}
        data-testid={testId}
      >
        {/* Animated Header Section */}
        <CustomAnimationSection
          className={animationSectionClasses}
          role="banner"
          aria-label={customConfig?.ariaLabels?.animationSection ?? labels.walletIconsAnimation}
        >
          {/* Stars Background */}
          <CustomStarsBackground className={starsBackgroundClasses} show={showStarsBackground} aria-hidden />

          {/* Gradient Overlay */}
          <CustomGradientOverlay className={gradientOverlayClasses} aria-hidden />

          {/* Animated Wallet Icons */}
          <CustomAnimationWrapper
            className={animationWrapperClasses}
            role="group"
            aria-label={customConfig?.ariaLabels?.animationWrapper ?? labels.popularWalletIcons}
            enableAnimations={enableAnimations}
            animationDelay={0}
            animationDuration={500}
          >
            {walletIcons.map((iconConfig) => (
              <CustomWalletIcon
                key={iconConfig.walletKey}
                config={iconConfig}
                enableAnimations={enableAnimations}
                className={customization?.classNames?.walletIcon?.({ config: iconConfig, enableAnimations })}
              />
            ))}

            {/* Screen reader content for animated icons */}
            <CustomScreenReader className={screenReaderClasses}>
              {formatLabel(labels.walletIconsDescription, {
                wallets: walletIcons.map((icon) => icon.name ?? icon.walletKey).join(', '),
              })}
            </CustomScreenReader>
          </CustomAnimationWrapper>
        </CustomAnimationSection>

        {/* Content Section */}
        <CustomContentSection className={contentSectionClasses} role="main">
          {/* Main Title */}
          <CustomTitle className={titleClasses} role="heading" aria-level={2}>
            {labels.startExploringWeb3}
          </CustomTitle>

          {/* Description */}
          <CustomDescription className={descriptionClasses} role="text">
            {labels.walletKeyToDigitalWorld}
          </CustomDescription>

          {/* Screen reader summary */}
          <CustomScreenReader className={screenReaderClasses}>{labels.getWalletSummary}</CustomScreenReader>
        </CustomContentSection>
      </CustomContainer>
    );
  },
);

GetWallet.displayName = 'GetWallet';
