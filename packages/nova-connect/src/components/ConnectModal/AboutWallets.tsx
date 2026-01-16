/**
 * @file AboutWallets component with comprehensive customization options and touch support.
 */

import { cn, StarsBackground } from '@tuwaio/nova-core';
import { AnimatePresence, motion, type Transition, type Variants } from 'framer-motion';
import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNovaConnectLabels } from '../../hooks';

// --- Types ---
type SlideConfig = {
  id: number;
  image: string;
  titleKey: keyof Record<string, string>;
  descriptionKey: keyof Record<string, string>;
};

type SlideDirection = -1 | 0 | 1;

type TouchState = {
  isDragging: boolean;
  startX: number;
  currentX: number;
  threshold: number;
};

// --- ClassNames Type for customization propagation ---
type AboutWalletsClassNames = {
  section?: () => string;
  slideContainer?: () => string;
  slide?: (params: { slideIndex: number; totalSlides: number }) => string;
  imageSection?: (params: { slideIndex: number }) => string;
  image?: (params: { slideIndex: number; imageLoaded: boolean }) => string;
  contentSection?: (params: { slideIndex: number }) => string;
  title?: (params: { slideIndex: number }) => string;
  description?: (params: { slideIndex: number }) => string;
  navigation?: () => string;
  indicator?: (params: { index: number; isActive: boolean }) => string;
  status?: () => string;
};

// --- Component Props Types ---
type SectionProps = {
  className?: string;
  children: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'aria-roledescription'?: string;
} & React.RefAttributes<HTMLElement>;

type SlideContainerProps = {
  className?: string;
  children: React.ReactNode;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
};

type SlideProps = {
  slide: SlideConfig;
  slideIndex: number;
  totalSlides: number;
  direction: SlideDirection;
  imageLoadedStates: Record<number, boolean>;
  onImageLoad: (slideIndex: number) => void;
  onImageError: (slideIndex: number) => void;
  className?: string;
  labels: Record<string, string>;
  slideVariants?: Variants;
  slideTransition?: Transition;
  imageVariants?: Variants;
  imageTransition?: Transition;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
  /** Custom components */
  components?: {
    ImageSection?: ComponentType<ImageSectionProps>;
    ContentSection?: ComponentType<ContentSectionProps>;
  };
};

type ImageSectionProps = {
  slide: SlideConfig;
  imageLoaded: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
  slideIndex: number;
  className?: string;
  labels: Record<string, string>;
  imageVariants?: Variants;
  imageTransition?: Transition;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
};

type ContentSectionProps = {
  slide: SlideConfig;
  slideIndex: number;
  className?: string;
  labels: Record<string, string>;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
};

type NavigationProps = {
  slides: SlideConfig[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  className?: string;
  labels: Record<string, string>;
  /** ClassNames for nested customization */
  classNames?: AboutWalletsClassNames;
  /** Custom indicator component */
  IndicatorComponent?: ComponentType<IndicatorProps>;
};

type IndicatorProps = {
  slide: SlideConfig;
  index: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  labels: Record<string, string>;
};

type StatusProps = {
  currentSlide: number;
  totalSlides: number;
  currentSlideData: SlideConfig;
  isAutoPlaying: boolean;
  className?: string;
  labels: Record<string, string>;
};

// --- Default slide configuration ---
const DEFAULT_SLIDES_CONFIG: SlideConfig[] = [
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
  enter: (direction: SlideDirection) => ({
    x: direction > 0 ? '15%' : '-15%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: '0%',
    opacity: 1,
  },
  exit: (direction: SlideDirection) => ({
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
  velocityThreshold: 500,
  dampingFactor: 0.3,
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
 * Customization options for AboutWallets component
 */
export type AboutWalletsCustomization = {
  /** Override slide configuration */
  slidesConfig?: SlideConfig[];
  /** Custom components */
  components?: {
    /** Custom section wrapper */
    Section?: ComponentType<SectionProps>;
    /** Custom slide container */
    SlideContainer?: ComponentType<SlideContainerProps>;
    /** Custom slide component */
    Slide?: ComponentType<SlideProps>;
    /** Custom image section */
    ImageSection?: ComponentType<ImageSectionProps>;
    /** Custom content section */
    ContentSection?: ComponentType<ContentSectionProps>;
    /** Custom navigation */
    Navigation?: ComponentType<NavigationProps>;
    /** Custom indicator */
    Indicator?: ComponentType<IndicatorProps>;
    /** Custom status announcer */
    Status?: ComponentType<StatusProps>;
    /** Custom stars background */
    StarsBackground?: ComponentType<ComponentPropsWithoutRef<typeof StarsBackground>>;
    /** Custom motion container */
    MotionDiv?: ComponentType<ComponentPropsWithoutRef<typeof motion.div>>;
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
    /** Auto-play interval in milliseconds */
    autoPlayInterval?: number;
    /** Resume delay after user interaction in milliseconds */
    resumeDelay?: number;
    /** Slide transition configuration */
    slideTransition?: Transition;
    /** Image transition configuration */
    imageTransition?: Transition;
  };
  /** Touch interaction configuration */
  touch?: {
    /** Enable/disable touch interactions */
    enabled?: boolean;
    /** Minimum distance to trigger slide change */
    threshold?: number;
    /** Minimum velocity for quick swipe */
    velocityThreshold?: number;
    /** How much to dampen the drag */
    dampingFactor?: number;
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom handler for slide change */
    onSlideChange?: (index: number) => void;
    /** Custom handler for auto-play state change */
    onAutoPlayChange?: (isPlaying: boolean) => void;
    /** Custom handler for user interaction */
    onUserInteraction?: () => void;
    /** Custom handler for image load */
    onImageLoad?: (slideIndex: number) => void;
    /** Custom handler for image error */
    onImageError?: (slideIndex: number) => void;
  };
  /** Configuration options */
  config?: {
    /** Whether to disable auto-play */
    disableAutoPlay?: boolean;
    /** Initial slide index */
    initialSlide?: number;
    /** Custom ARIA labels */
    ariaLabels?: {
      carousel?: string;
      slide?: (slideIndex: number, totalSlides: number) => string;
      navigation?: string;
      indicator?: (slideIndex: number, slideTitle: string) => string;
    };
  };
};

/**
 * Props for the AboutWallets component
 */
export interface AboutWalletsProps {
  /** Additional CSS classes */
  className?: string;
  /** Customization options */
  customization?: AboutWalletsCustomization;
}

// --- Default Sub-Components ---
const DefaultSection = forwardRef<HTMLElement, SectionProps>(({ children, className, ...props }, ref) => (
  <section ref={ref} className={cn('novacon:relative novacon:m-[-16px]', className)} {...props}>
    {children}
  </section>
));
DefaultSection.displayName = 'DefaultSection';

const DefaultSlideContainer: React.FC<SlideContainerProps> = ({ children, className, ...props }) => (
  <div className={cn('novacon:relative novacon:z-1 novacon:overflow-hidden novacon:h-full', className)} {...props}>
    <StarsBackground starsCount={50} />
    <div
      className="novacon:absolute novacon:inset-0 novacon:z-1 novacon:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"
      aria-hidden="true"
    />

    <div className="novacon:relative novacon:z-2 novacon:h-full">{children}</div>
  </div>
);

const DefaultImageSection: React.FC<ImageSectionProps> = ({
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

const DefaultContentSection: React.FC<ContentSectionProps> = ({ slide, slideIndex, className, labels, classNames }) => {
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
          'novacon:text-xl novacon:font-bold novacon:text-[var(--tuwa-text-primary)] novacon:mb-2',
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

const DefaultIndicator: React.FC<IndicatorProps> = ({ slide, index, isActive, onClick, className, labels }) => (
  <button
    onClick={onClick}
    className={cn(
      'novacon:cursor-pointer novacon:h-2 novacon:rounded-full novacon:transition-all novacon:duration-300',
      'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-text-accent)] novacon:focus:ring-offset-2',
      'novacon:bg-[var(--tuwa-border-primary)] novacon:w-2 novacon:hover:bg-[var(--tuwa-text-accent)]',
      {
        'novacon:bg-[var(--tuwa-text-accent)] novacon:w-6': isActive,
      },
      className,
    )}
    role="tab"
    aria-selected={isActive}
    aria-controls={`slide-${index}`}
    aria-label={`Go to slide ${index + 1}: ${labels[slide.titleKey as string]}`}
    tabIndex={isActive ? 0 : -1}
  />
);

const DefaultNavigation: React.FC<NavigationProps> = ({
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
    aria-label={`${labels.aboutWallets} navigation`}
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

const DefaultSlide: React.FC<SlideProps> = ({
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
      aria-label={`Slide ${slideIndex + 1} of ${totalSlides}`}
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

const DefaultStatus: React.FC<StatusProps> = ({
  currentSlide,
  totalSlides,
  currentSlideData,
  isAutoPlaying,
  className,
  labels,
}) => (
  <div className={cn('novacon:sr-only', className)} aria-live="polite" role="status">
    {`Slide ${currentSlide + 1} of ${totalSlides}: ${labels[currentSlideData.titleKey as string]}`}
    {isAutoPlaying ? ' (Auto-playing)' : ' (Paused)'}
  </div>
);

/**
 * Educational carousel component about wallet functionality with comprehensive customization and touch support.
 *
 * This component provides an interactive slideshow explaining wallet benefits:
 * - Animated slide transitions with Framer Motion
 * - Touch/swipe gestures for mobile navigation
 * - Keyboard navigation support for accessibility
 * - Auto-play functionality with pause on user interaction
 * - Internationalization support with translation keys
 * - WCAG compliant with proper ARIA labels and semantics
 * - Responsive design with embedded base64 images
 * - Visual indicators for current slide position
 * - Full customization of all child components
 * - Performance-optimized with memoized calculations
 *
 * @example Basic usage
 * ```tsx
 * <AboutWallets />
 * ```
 *
 * @example With customization via provider
 * ```tsx
 * <AboutWallets
 *   customization={{
 *     classNames: {
 *       section: () => 'my-custom-section',
 *       title: ({ slideIndex }) => slideIndex === 0 ? 'text-blue-500' : 'text-green-500',
 *       description: () => 'text-gray-400',
 *       imageSection: () => 'bg-gradient-to-r from-purple-500 to-pink-500',
 *       indicator: ({ isActive }) => isActive ? 'bg-blue-500 w-8' : 'bg-gray-300',
 *     },
 *   }}
 * />
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

  const slidesConfig = useMemo(() => {
    return inputSlidesConfig.map((slide) => {
      // If image is present, use it
      if (slide.image) return slide;
      // Otherwise try to use loaded default
      return {
        ...slide,
        image: defaultImages[slide.id] || '',
      };
    });
  }, [inputSlidesConfig, defaultImages]);

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
  const [direction, setDirection] = useState<SlideDirection>(0);
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

      const newDirection: SlideDirection = index > currentSlide ? 1 : -1;
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
      aria-roledescription="carousel"
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

      <div className="novacon:sr-only">
        Use arrow keys to navigate slides, Space or Enter to pause/resume auto-play, Home to go to first slide, End to
        go to last slide. Swipe left or right to navigate on touch devices.
      </div>
    </CustomSection>
  );
});

AboutWallets.displayName = 'AboutWallets';
