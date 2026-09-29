/**
 * @file AboutWallets component with comprehensive customization options and touch support.
 */

import { cn, StarsBackground } from '@tuwaio/nova-core';
import { AnimatePresence, motion, type Transition, type Variants } from 'framer-motion';
import React, { ComponentType, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNovaConnectLabels } from '../../hooks';
import { formatLabel } from '../../i18n/formatLabel';

// --- Types ---
/**
 * A slide of {@link AboutWallets}.
 */
export type AboutWalletsSlideConfig = {
  /** Unique ID. Slides `1` and `2` without `image` get the built-in images (loaded with a dynamic import). */
  id: number;
  /** Image URL (an empty string shows a placeholder until the built-in image loads) */
  image: string;
  /** Key of the Nova Connect labels with the slide title (for example `keyToNewInternet`) */
  titleKey: keyof Record<string, string>;
  /** Key of the Nova Connect labels with the slide description */
  descriptionKey: keyof Record<string, string>;
};

/**
 * Direction of a slide change: `1` forward, `-1` back, `0` none yet.
 */
export type AboutWalletsSlideDirection = -1 | 0 | 1;

type TouchState = {
  isDragging: boolean;
  startX: number;
  currentX: number;
  threshold: number;
};

/**
 * Class name generators of {@link AboutWallets}. Each one returns classes added to the default ones.
 */
export type AboutWalletsClassNames = {
  /**
   * Returns classes of the carousel section (before the `className` prop).
   *
   * @returns The classes.
   */
  section?: () => string;
  /**
   * Returns classes of the slide container.
   *
   * @returns The classes.
   */
  slideContainer?: () => string;
  /**
   * Returns classes of the current slide.
   *
   * @param params - The slide.
   * @param params.slideIndex - Index of the slide.
   * @param params.totalSlides - Number of slides.
   * @returns The classes.
   */
  slide?: (params: { slideIndex: number; totalSlides: number }) => string;
  /**
   * Returns classes of the image section of the default slide.
   *
   * @param params - The slide.
   * @param params.slideIndex - Index of the slide.
   * @returns The classes.
   */
  imageSection?: (params: { slideIndex: number }) => string;
  /**
   * Returns classes of the image of the default image section.
   *
   * @param params - The slide.
   * @param params.slideIndex - Index of the slide.
   * @param params.imageLoaded - Whether the image has loaded (or failed to load).
   * @returns The classes.
   */
  image?: (params: { slideIndex: number; imageLoaded: boolean }) => string;
  /**
   * Returns classes of the content section of the default slide.
   *
   * @param params - The slide.
   * @param params.slideIndex - Index of the slide.
   * @returns The classes.
   */
  contentSection?: (params: { slideIndex: number }) => string;
  /**
   * Returns classes of the slide title.
   *
   * @param params - The slide.
   * @param params.slideIndex - Index of the slide.
   * @returns The classes.
   */
  title?: (params: { slideIndex: number }) => string;
  /**
   * Returns classes of the slide description.
   *
   * @param params - The slide.
   * @param params.slideIndex - Index of the slide.
   * @returns The classes.
   */
  description?: (params: { slideIndex: number }) => string;
  /**
   * Returns classes of the navigation.
   *
   * @returns The classes.
   */
  navigation?: () => string;
  /**
   * Returns classes of a slide indicator.
   *
   * @param params - The indicator.
   * @param params.index - Index of the slide.
   * @param params.isActive - Whether this is the current slide.
   * @returns The classes.
   */
  indicator?: (params: { index: number; isActive: boolean }) => string;
  /**
   * Returns classes of the visually hidden status announcer.
   *
   * @returns The classes.
   */
  status?: () => string;
};

// --- Component Props Types ---
/**
 * Props for a custom carousel section (a `section` by default).
 */
export type AboutWalletsSectionProps = {
  /** Classes from `classNames.section` and the `className` prop */
  className?: string;
  /** The slide container, navigation, status and keyboard hint */
  children: React.ReactNode;
  /**
   * Keyboard navigation: arrows change the slide, Home and End go to the first and last slide, Space and Enter pause
   * or resume auto-play.
   *
   * @param event - The keyboard event.
   */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** `0` */
  tabIndex?: number;
  /** `region` */
  role?: string;
  /** `config.ariaLabels.carousel` or the `aboutWallets` label */
  'aria-label'?: string;
  /** `carousel` */
  'aria-roledescription'?: string;
} & React.RefAttributes<HTMLElement>;

/**
 * Props for a custom slide container (the default one draws the stars background).
 */
export type AboutWalletsSlideContainerProps = {
  /** Classes from `classNames.slideContainer` */
  className?: string;
  /** The swipe area with the current slide */
  children: React.ReactNode;
  /** `polite` */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** `false` */
  'aria-atomic'?: boolean;
};

/**
 * Props for a custom slide. The default one animates the slide with Framer Motion and renders the image and content
 * sections.
 */
export type AboutWalletsSlideProps = {
  /** The slide */
  slide: AboutWalletsSlideConfig;
  /** Index of the slide */
  slideIndex: number;
  /** Number of slides */
  totalSlides: number;
  /** Direction of the change that showed this slide */
  direction: AboutWalletsSlideDirection;
  /** Whether the image of each slide (by index) has loaded or failed */
  imageLoadedStates: Record<number, boolean>;
  /**
   * Marks the image of a slide as loaded and calls `handlers.onImageLoad`.
   *
   * @param slideIndex - Index of the slide.
   */
  onImageLoad: (slideIndex: number) => void;
  /**
   * Logs a warning, marks the image of a slide as loaded and calls `handlers.onImageError`.
   *
   * @param slideIndex - Index of the slide.
   */
  onImageError: (slideIndex: number) => void;
  /** Classes from `classNames.slide` */
  className?: string;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** `variants.slide` or the default variants */
  slideVariants?: Variants;
  /** `animation.slideTransition` or the default spring */
  slideTransition?: Transition;
  /** `variants.image` or the default variants */
  imageVariants?: Variants;
  /** `animation.imageTransition` or the default transition */
  imageTransition?: Transition;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
  /** Custom components */
  components?: {
    /** `components.ImageSection` */
    ImageSection?: ComponentType<AboutWalletsImageSectionProps>;
    /** `components.ContentSection` */
    ContentSection?: ComponentType<AboutWalletsContentSectionProps>;
  };
};

/**
 * Props for a custom image section of a slide.
 */
export type AboutWalletsImageSectionProps = {
  /** The slide */
  slide: AboutWalletsSlideConfig;
  /** Whether the image has loaded or failed (the default section shows a placeholder until then) */
  imageLoaded: boolean;
  /** Call when the image loads */
  onImageLoad: () => void;
  /** Call when the image fails to load */
  onImageError: () => void;
  /** Index of the slide */
  slideIndex: number;
  /** Classes added to the defaults */
  className?: string;
  /** The Nova Connect labels (the title is the `alt` text of the image) */
  labels: Record<string, string>;
  /** Framer Motion variants of the image */
  imageVariants?: Variants;
  /** Framer Motion transition of the image */
  imageTransition?: Transition;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
};

/**
 * Props for a custom content section of a slide (title and description).
 */
export type AboutWalletsContentSectionProps = {
  /** The slide */
  slide: AboutWalletsSlideConfig;
  /** Index of the slide */
  slideIndex: number;
  /** Classes added to the defaults */
  className?: string;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
};

/**
 * Props for a custom navigation (the slide indicators).
 */
export type AboutWalletsNavigationProps = {
  /** All slides */
  slides: AboutWalletsSlideConfig[];
  /** Index of the current slide */
  currentSlide: number;
  /**
   * Goes to a slide, pauses auto-play and calls `handlers.onSlideChange` and `handlers.onUserInteraction`.
   *
   * @param index - Index of the slide.
   */
  onSlideChange: (index: number) => void;
  /** Classes from `classNames.navigation` */
  className?: string;
  /** The Nova Connect labels */
  labels: Record<string, string>;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
  /** Custom indicator component */
  IndicatorComponent?: ComponentType<AboutWalletsIndicatorProps>;
};

/**
 * Props for a custom slide indicator.
 */
export type AboutWalletsIndicatorProps = {
  /** The slide */
  slide: AboutWalletsSlideConfig;
  /** Index of the slide */
  index: number;
  /** Whether this is the current slide */
  isActive: boolean;
  /** Goes to the slide */
  onClick: () => void;
  /** Classes from `classNames.indicator` */
  className?: string;
  /** The Nova Connect labels */
  labels: Record<string, string>;
};

/**
 * Props for a custom status announcer (a visually hidden live region by default).
 */
export type AboutWalletsStatusProps = {
  /** Index of the current slide */
  currentSlide: number;
  /** Number of slides */
  totalSlides: number;
  /** The current slide */
  currentSlideData: AboutWalletsSlideConfig;
  /** Whether auto-play is on */
  isAutoPlaying: boolean;
  /** Classes from `classNames.status` */
  className?: string;
  /** The Nova Connect labels */
  labels: Record<string, string>;
};

// --- Default slide configuration ---
const DEFAULT_SLIDES_CONFIG: AboutWalletsSlideConfig[] = [
  {
    id: 1,
    image: '', // Loaded dynamically
    titleKey: 'keyToNewInternet',
    descriptionKey: 'keyToNewInternetDescription',
  },
  {
    id: 2,
    image: '', // Loaded dynamically
    titleKey: 'logInWithoutHassle',
    descriptionKey: 'logInWithoutHassleDescription',
  },
];

// --- Default motion variants ---
const DEFAULT_SLIDE_VARIANTS: Variants = {
  enter: (direction: AboutWalletsSlideDirection) => ({
    x: direction > 0 ? '15%' : '-15%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: '0%',
    opacity: 1,
  },
  exit: (direction: AboutWalletsSlideDirection) => ({
    zIndex: 0,
    x: direction < 0 ? '15%' : '-15%',
    opacity: 0,
    top: 0,
    left: 0,
    right: 0,
  }),
};

const DEFAULT_IMAGE_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.4 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.4 },
};

// --- Touch configuration ---
const TOUCH_CONFIG = {
  threshold: 50,
} as const;

// --- Animation configuration ---
const ANIMATION_CONFIG = {
  autoPlayInterval: 25000,
  resumeDelay: 10000,
  slideTransition: {
    x: { type: 'spring' as const, stiffness: 200, damping: 30, duration: 0.1 },
    opacity: { duration: 0.2 },
  } as Transition,
  imageTransition: {
    duration: 0.2,
  } as Transition,
} as const;

/**
 * Customization options of {@link AboutWallets}.
 */
export type AboutWalletsCustomization = {
  /** Override slide configuration */
  slidesConfig?: AboutWalletsSlideConfig[];
  /** Custom components */
  components?: {
    /** Custom section wrapper */
    Section?: ComponentType<AboutWalletsSectionProps>;
    /** Custom slide container */
    SlideContainer?: ComponentType<AboutWalletsSlideContainerProps>;
    /** Custom slide component */
    Slide?: ComponentType<AboutWalletsSlideProps>;
    /** Custom image section */
    ImageSection?: ComponentType<AboutWalletsImageSectionProps>;
    /** Custom content section */
    ContentSection?: ComponentType<AboutWalletsContentSectionProps>;
    /** Custom navigation */
    Navigation?: ComponentType<AboutWalletsNavigationProps>;
    /** Custom indicator */
    Indicator?: ComponentType<AboutWalletsIndicatorProps>;
    /** Custom status announcer */
    Status?: ComponentType<AboutWalletsStatusProps>;
  };
  /** Custom class name generators */
  classNames?: AboutWalletsClassNames;
  /** Custom animation variants */
  variants?: {
    /** Slide animation variants */
    slide?: Variants;
    /** Image animation variants */
    image?: Variants;
  };
  /** Custom animation configuration */
  animation?: {
    /** Auto-play interval in milliseconds (default: `25000`) */
    autoPlayInterval?: number;
    /** Delay before auto-play resumes after the user changes the slide, in milliseconds (default: `10000`) */
    resumeDelay?: number;
    /** Slide transition configuration */
    slideTransition?: Transition;
    /** Image transition configuration */
    imageTransition?: Transition;
  };
  /** Touch interaction configuration */
  touch?: {
    /** Whether swipes change the slide (default: `true`) */
    enabled?: boolean;
    /** Minimum swipe distance in pixels to change the slide (default: `50`) */
    threshold?: number;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Called when the user changes the slide (indicators, keys, swipes), not on auto-play.
     *
     * @param index - Index of the new slide.
     */
    onSlideChange?: (index: number) => void;
    /**
     * Called when the user pauses or resumes auto-play with Space or Enter.
     *
     * @param isPlaying - Whether auto-play is now on.
     */
    onAutoPlayChange?: (isPlaying: boolean) => void;
    /** Called when the user changes the slide or touches the carousel */
    onUserInteraction?: () => void;
    /**
     * Called when the image of a slide loads.
     *
     * @param slideIndex - Index of the slide.
     */
    onImageLoad?: (slideIndex: number) => void;
    /**
     * Called when the image of a slide fails to load.
     *
     * @param slideIndex - Index of the slide.
     */
    onImageError?: (slideIndex: number) => void;
  };
  /** Configuration options */
  config?: {
    /** Whether to disable auto-play (default: `false`) */
    disableAutoPlay?: boolean;
    /** Initial slide index (default: `0`) */
    initialSlide?: number;
    /** Custom ARIA labels */
    ariaLabels?: {
      /** ARIA label of the carousel (default: the `aboutWallets` label) */
      carousel?: string;
    };
  };
};

/**
 * Props for the {@link AboutWallets} component.
 */
export interface AboutWalletsProps {
  /** Classes added to the carousel section */
  className?: string;
  /** Customization options */
  customization?: AboutWalletsCustomization;
}

// --- Default Sub-Components ---
const DefaultSection = forwardRef<HTMLElement, AboutWalletsSectionProps>(({ children, className, ...props }, ref) => (
  <section ref={ref} className={cn('novacon:relative novacon:m-[-16px]', className)} {...props}>
    {children}
  </section>
));
DefaultSection.displayName = 'DefaultSection';

const DefaultSlideContainer: React.FC<AboutWalletsSlideContainerProps> = ({ children, className, ...props }) => (
  <div className={cn('novacon:relative novacon:z-1 novacon:overflow-hidden novacon:h-full', className)} {...props}>
    <StarsBackground starsCount={50} />
    <div
      className="novacon:absolute novacon:inset-0 novacon:z-1 novacon:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"
      aria-hidden="true"
    />

    <div className="novacon:relative novacon:z-2 novacon:h-full">{children}</div>
  </div>
);

const DefaultImageSection: React.FC<AboutWalletsImageSectionProps> = ({
  slide,
  imageLoaded,
  onImageLoad,
  onImageError,
  slideIndex,
  className,
  labels,
  imageVariants = DEFAULT_IMAGE_VARIANTS,
  imageTransition = ANIMATION_CONFIG.imageTransition,
  classNames,
}) => {
  // Compute custom image class if provided
  const imageClassName = classNames?.image?.({ slideIndex, imageLoaded });

  return (
    <div
      className={cn(
        'novacon:flex novacon:justify-center novacon:relative novacon:pt-4',
        classNames?.imageSection?.({ slideIndex }),
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`image-${slideIndex}`}
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={imageTransition}
          className="novacon:relative"
        >
          <div className="novacon:relative" style={{ width: 250, height: 250 }}>
            {slide.image && (
              <img
                src={slide.image}
                alt={labels[slide.titleKey as string]}
                width={250}
                height={250}
                className={cn(
                  'novacon:rounded-full novacon:transition-opacity novacon:duration-300',
                  'novacon:object-cover',
                  imageLoaded ? 'novacon:opacity-100' : 'novacon:opacity-0',
                  imageClassName,
                )}
                style={{ width: 250, height: 250 }}
                onLoad={onImageLoad}
                onError={onImageError}
                loading="eager"
                decoding="async"
              />
            )}

            {!imageLoaded && (
              <div
                className="novacon:absolute novacon:inset-0 novacon:bg-[var(--tuwa-bg-muted)] novacon:animate-pulse novacon:rounded-full novacon:flex novacon:items-center novacon:justify-center"
                style={{ width: 250, height: 250 }}
                aria-hidden="true"
              >
                <div className="novacon:w-12 novacon:h-12 novacon:border-2 novacon:border-[var(--tuwa-text-accent)] novacon:border-t-transparent novacon:rounded-full novacon:animate-spin" />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const DefaultContentSection: React.FC<AboutWalletsContentSectionProps> = ({
  slide,
  slideIndex,
  className,
  labels,
  classNames,
}) => {
  // Compute custom title and description classes if provided
  const titleClassName = classNames?.title?.({ slideIndex });
  const descriptionClassName = classNames?.description?.({ slideIndex });

  return (
    <div
      className={cn(
        'novacon:text-center novacon:relative novacon:p-4 novacon:bg-[var(--tuwa-bg-primary)]',
        classNames?.contentSection?.({ slideIndex }),
        className,
      )}
    >
      <h2
        className={cn(
          'novacon:text-xl novacon:font-bold novacon:font-mono novacon:text-[var(--tuwa-text-primary)] novacon:mb-2',
          titleClassName,
        )}
        id={`slide-title-${slideIndex}`}
      >
        {labels[slide.titleKey as string]}
      </h2>
      <p
        className={cn('novacon:text-[var(--tuwa-text-secondary)] novacon:leading-relaxed', descriptionClassName)}
        aria-describedby={`slide-title-${slideIndex}`}
      >
        {labels[slide.descriptionKey as string]}
      </p>
    </div>
  );
};

const DefaultIndicator: React.FC<AboutWalletsIndicatorProps> = ({
  slide,
  index,
  isActive,
  onClick,
  className,
  labels,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'novacon:cursor-pointer novacon:h-2 novacon:rounded-full novacon:transition-all novacon:duration-300',
      'novacon:focus:outline-none novacon:focus:ring-[length:var(--tuwa-ring-width)] novacon:focus:ring-[var(--tuwa-text-accent)] novacon:focus:ring-offset-[length:var(--tuwa-ring-width)] novacon:focus:ring-offset-[var(--tuwa-border-secondary)]',
      'novacon:bg-[var(--tuwa-border-primary)] novacon:w-2 novacon:hover:bg-[var(--tuwa-text-accent)]',
      {
        'novacon:bg-[var(--tuwa-text-accent)] novacon:w-6': isActive,
      },
      className,
    )}
    role="tab"
    aria-selected={isActive}
    aria-controls={`slide-${index}`}
    aria-label={formatLabel(labels.goToSlide, { index: index + 1, title: labels[slide.titleKey as string] })}
    tabIndex={isActive ? 0 : -1}
  />
);

const DefaultNavigation: React.FC<AboutWalletsNavigationProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  className,
  labels,
  classNames,
  IndicatorComponent = DefaultIndicator,
}) => (
  <nav
    className={cn(
      'novacon:flex novacon:justify-center novacon:space-x-2 novacon:mt-6 novacon:relative novacon:z-3 novacon:mx-4 novacon:mb-4',
      className,
    )}
    role="tablist"
    aria-label={labels.carouselNavigation}
  >
    <div
      className="novacon:absolute novacon:left-1/2 novacon:top-1/2 novacon:transform novacon:-translate-x-1/2 novacon:-translate-y-1/2 novacon:z-1 novacon:h-[2px] novacon:w-full novacon:bg-[var(--tuwa-border-primary)]"
      aria-hidden="true"
    />
    <div className="novacon:flex novacon:gap-2 novacon:px-4 novacon:bg-[var(--tuwa-bg-primary)] novacon:relative novacon:z-2">
      {slides.map((slide, index) => (
        <IndicatorComponent
          key={slide.id}
          slide={slide}
          index={index}
          isActive={currentSlide === index}
          onClick={() => onSlideChange(index)}
          labels={labels}
          className={classNames?.indicator?.({ index, isActive: currentSlide === index })}
        />
      ))}
    </div>
  </nav>
);

const DefaultSlide: React.FC<AboutWalletsSlideProps> = ({
  slide,
  slideIndex,
  totalSlides,
  direction,
  imageLoadedStates,
  onImageLoad,
  onImageError,
  className,
  labels,
  slideVariants = DEFAULT_SLIDE_VARIANTS,
  slideTransition = ANIMATION_CONFIG.slideTransition,
  imageVariants = DEFAULT_IMAGE_VARIANTS,
  imageTransition = ANIMATION_CONFIG.imageTransition,
  classNames,
  components,
}) => {
  // Use custom components if provided, otherwise default
  const ImageSectionComponent = components?.ImageSection ?? DefaultImageSection;
  const ContentSectionComponent = components?.ContentSection ?? DefaultContentSection;

  return (
    <motion.div
      key={slideIndex}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className={cn('novacon:flex novacon:flex-col novacon:justify-start novacon:w-full novacon:h-full', className)}
      role="tabpanel"
      aria-label={formatLabel(labels.slideOfTotal, { index: slideIndex + 1, total: totalSlides })}
    >
      <ImageSectionComponent
        slide={slide}
        imageLoaded={imageLoadedStates[slideIndex] || false}
        onImageLoad={() => onImageLoad(slideIndex)}
        onImageError={() => onImageError(slideIndex)}
        slideIndex={slideIndex}
        labels={labels}
        imageVariants={imageVariants}
        imageTransition={imageTransition}
        classNames={classNames}
      />
      <ContentSectionComponent slide={slide} slideIndex={slideIndex} labels={labels} classNames={classNames} />
    </motion.div>
  );
};

const DefaultStatus: React.FC<AboutWalletsStatusProps> = ({
  currentSlide,
  totalSlides,
  currentSlideData,
  isAutoPlaying,
  className,
  labels,
}) => (
  <div className={cn('novacon:sr-only', className)} aria-live="polite" role="status">
    {`${formatLabel(labels.slideOfTotal, { index: currentSlide + 1, total: totalSlides })}: ${labels[currentSlideData.titleKey as string]}`}
    {` (${isAutoPlaying ? labels.autoPlaying : labels.paused})`}
  </div>
);

/**
 * The "About wallets" carousel of the connect modal: slides explaining wallets, with Framer Motion transitions,
 * indicators, swipes, keyboard navigation and auto-play (paused after the user changes the slide, resumed after
 * `animation.resumeDelay`). The built-in slide images are base64 modules of the package, loaded with a dynamic import
 * (no external host). Texts come from the Nova Connect labels.
 *
 * Props: {@link AboutWalletsProps}; the ref is forwarded to the carousel section.
 *
 * @example
 * ```tsx
 * import { AboutWallets } from '@tuwaio/nova-connect/components';
 *
 * export const Carousel = (
 *   <AboutWallets
 *     customization={{
 *       classNames: {
 *         title: ({ slideIndex }) => (slideIndex === 0 ? 'text-blue-500' : 'text-green-500'),
 *         indicator: ({ isActive }) => (isActive ? 'bg-blue-500 w-8' : 'bg-gray-300'),
 *       },
 *       config: { disableAutoPlay: true },
 *     }}
 *   />
 * );
 * ```
 */
export const AboutWallets = forwardRef<HTMLElement, AboutWalletsProps>(({ className, customization }, ref) => {
  const labels = useNovaConnectLabels();

  // Extract customization options
  const inputSlidesConfig = customization?.slidesConfig ?? DEFAULT_SLIDES_CONFIG;
  const customClassNames = customization?.classNames;

  // State for dynamically loaded default images
  const [defaultImages, setDefaultImages] = useState<Record<number, string>>({});

  useEffect(() => {
    // Only load if we are using defaults or have missing images for default IDs
    const needsLoading = inputSlidesConfig.some((slide) => (slide.id === 1 || slide.id === 2) && !slide.image);

    if (!needsLoading) return;

    const loadDefaultImages = async () => {
      try {
        const [passportModule, walletModule] = await Promise.all([
          import('./images/digitalPassportImage'),
          import('./images/walletImage'),
        ]);
        setDefaultImages({
          1: passportModule.digitalPassportImage,
          2: walletModule.walletImage,
        });
      } catch (error) {
        console.warn('Failed to load default images', error);
      }
    };
    loadDefaultImages();
  }, [inputSlidesConfig]);

  const slidesConfig = inputSlidesConfig.map((slide) => {
    // If image is present, use it
    if (slide.image) return slide;
    // Otherwise try to use loaded default
    return {
      ...slide,
      image: defaultImages[slide.id] || '',
    };
  });

  const slideVariants = customization?.variants?.slide ?? DEFAULT_SLIDE_VARIANTS;
  const imageVariants = customization?.variants?.image ?? DEFAULT_IMAGE_VARIANTS;
  const {
    Section: CustomSection = DefaultSection,
    SlideContainer: CustomSlideContainer = DefaultSlideContainer,
    Slide: CustomSlide = DefaultSlide,
    ImageSection: CustomImageSection,
    ContentSection: CustomContentSection,
    Navigation: CustomNavigation = DefaultNavigation,
    Indicator: CustomIndicator,
    Status: CustomStatus = DefaultStatus,
  } = customization?.components ?? {};

  const { disableAutoPlay = false, initialSlide = 0, ariaLabels } = customization?.config ?? {};

  const touchConfig = { enabled: true, ...TOUCH_CONFIG, ...customization?.touch };
  const animationConfig = { ...ANIMATION_CONFIG, ...customization?.animation };
  const customHandlers = customization?.handlers;

  // State management
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [direction, setDirection] = useState<AboutWalletsSlideDirection>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(!disableAutoPlay);
  const [userInteracted, setUserInteracted] = useState(false);
  const [imageLoadedStates, setImageLoadedStates] = useState<Record<number, boolean>>({});
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    threshold: touchConfig.threshold,
  });

  // Refs for cleanup
  const autoPlayIntervalRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);

  /**
   * Navigate to a specific slide with proper direction calculation
   */
  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentSlide || index < 0 || index >= slidesConfig.length) return;

      const newDirection: AboutWalletsSlideDirection = index > currentSlide ? 1 : -1;
      setDirection(newDirection);
      setCurrentSlide(index);
      setUserInteracted(true);
      setIsAutoPlaying(false);

      customHandlers?.onSlideChange?.(index);
      customHandlers?.onUserInteraction?.();
    },
    [currentSlide, slidesConfig.length, customHandlers],
  );

  /**
   * Navigate to the next slide in sequence
   */
  const goToNextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % slidesConfig.length;
    goToSlide(nextIndex);
  }, [currentSlide, slidesConfig.length, goToSlide]);

  /**
   * Navigate to the previous slide in sequence
   */
  const goToPreviousSlide = useCallback(() => {
    const prevIndex = currentSlide === 0 ? slidesConfig.length - 1 : currentSlide - 1;
    goToSlide(prevIndex);
  }, [currentSlide, slidesConfig.length, goToSlide]);

  /**
   * Handle keyboard navigation for accessibility
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goToPreviousSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          goToNextSlide();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(slidesConfig.length - 1);
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          setIsAutoPlaying((prev) => {
            const newValue = !prev;
            customHandlers?.onAutoPlayChange?.(newValue);
            return newValue;
          });
          break;
      }
    },
    [goToPreviousSlide, goToNextSlide, goToSlide, slidesConfig.length, customHandlers],
  );

  /**
   * Handle image loading by slide index
   */
  const handleImageLoad = useCallback(
    (slideIndex: number) => {
      setImageLoadedStates((prev) => ({
        ...prev,
        [slideIndex]: true,
      }));
      customHandlers?.onImageLoad?.(slideIndex);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customHandlers?.onImageLoad],
  );

  /**
   * Handle image error by slide index
   */
  const handleImageError = useCallback(
    (slideIndex: number) => {
      console.warn(`Failed to load slide image for slide ${slideIndex + 1}`);
      setImageLoadedStates((prev) => ({
        ...prev,
        [slideIndex]: true,
      }));
      customHandlers?.onImageError?.(slideIndex);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customHandlers?.onImageError],
  );

  /**
   * Auto-play functionality
   */
  useEffect(() => {
    if (autoPlayIntervalRef.current !== null) {
      window.clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }

    if (!isAutoPlaying || userInteracted || disableAutoPlay) return;

    autoPlayIntervalRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slidesConfig.length;
        setDirection(1);
        return next;
      });
    }, animationConfig.autoPlayInterval);

    return () => {
      if (autoPlayIntervalRef.current !== null) {
        window.clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [isAutoPlaying, userInteracted, disableAutoPlay, slidesConfig.length, animationConfig.autoPlayInterval]);

  /**
   * Resume auto-play after user interaction
   */
  useEffect(() => {
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    if (!userInteracted) return;

    resumeTimeoutRef.current = window.setTimeout(() => {
      setUserInteracted(false);
      setIsAutoPlaying(true);
    }, animationConfig.resumeDelay);

    return () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, [userInteracted, animationConfig.resumeDelay]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current !== null) {
        window.clearInterval(autoPlayIntervalRef.current);
      }
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  const currentSlideData = slidesConfig[currentSlide];

  // Prepare components object for Slide
  const slideComponents = useMemo(
    () => ({
      ImageSection: CustomImageSection,
      ContentSection: CustomContentSection,
    }),
    [CustomImageSection, CustomContentSection],
  );

  return (
    <CustomSection
      ref={ref}
      className={cn(customClassNames?.section?.(), className)}
      role="region"
      aria-label={ariaLabels?.carousel ?? labels.aboutWallets}
      aria-roledescription={labels.carousel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <CustomSlideContainer className={customClassNames?.slideContainer?.()} aria-live="polite" aria-atomic={false}>
        <div
          className="novacon:h-full novacon:touch-pan-x"
          onTouchStart={(e) => {
            if (!touchConfig.enabled) return;
            const touch = e.touches[0];
            setTouchState((prev) => ({
              ...prev,
              isDragging: true,
              startX: touch.clientX,
              currentX: touch.clientX,
            }));
            customHandlers?.onUserInteraction?.();
          }}
          onTouchMove={(e) => {
            if (!touchConfig.enabled || !touchState.isDragging) return;
            const touch = e.touches[0];
            setTouchState((prev) => ({
              ...prev,
              currentX: touch.clientX,
            }));
          }}
          onTouchEnd={() => {
            if (!touchConfig.enabled || !touchState.isDragging) return;

            const deltaX = touchState.currentX - touchState.startX;
            const shouldChangeSlide = Math.abs(deltaX) > touchConfig.threshold;

            if (shouldChangeSlide) {
              if (deltaX > 0) {
                goToPreviousSlide();
              } else {
                goToNextSlide();
              }
            }

            setTouchState((prev) => ({
              ...prev,
              isDragging: false,
              startX: 0,
              currentX: 0,
            }));
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <CustomSlide
              key={currentSlide}
              slide={currentSlideData}
              slideIndex={currentSlide}
              totalSlides={slidesConfig.length}
              direction={direction}
              imageLoadedStates={imageLoadedStates}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              slideVariants={slideVariants}
              slideTransition={animationConfig.slideTransition}
              imageVariants={imageVariants}
              imageTransition={animationConfig.imageTransition}
              className={customClassNames?.slide?.({
                slideIndex: currentSlide,
                totalSlides: slidesConfig.length,
              })}
              labels={labels}
              classNames={customClassNames}
              components={slideComponents}
            />
          </AnimatePresence>
        </div>
      </CustomSlideContainer>

      <CustomNavigation
        slides={slidesConfig}
        currentSlide={currentSlide}
        onSlideChange={goToSlide}
        className={customClassNames?.navigation?.()}
        labels={labels}
        classNames={customClassNames}
        IndicatorComponent={CustomIndicator}
      />

      <CustomStatus
        currentSlide={currentSlide}
        totalSlides={slidesConfig.length}
        currentSlideData={currentSlideData}
        isAutoPlaying={isAutoPlaying}
        className={customClassNames?.status?.()}
        labels={labels}
      />

      <div className="novacon:sr-only">{labels.carouselInstructions}</div>
    </CustomSection>
  );
});

AboutWallets.displayName = 'AboutWallets';
