/**
 * @file This file contains the `WalletIcon` component, a customizable wallet icon renderer with fallback support.
 */

import { cn, WalletIcon as WI } from '@tuwaio/nova-core';
import { formatConnectorName } from '@tuwaio/orbit-core';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, useCallback, useState } from 'react';

import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';

// --- Types for Customization ---
/** Props of the loading overlay of {@link WalletIcon} (`customization.components.LoadingOverlay`). */
export type WalletIconLoadingOverlayProps = {
  /** Icon size in pixels. */
  size: number;
  /** Whether the icon image is loading and `showLoading` is set; the default overlay renders nothing otherwise. */
  isLoading: boolean;
  /** Classes from `customization.classNames.loadingOverlay`. */
  className?: string;
};

/** Props of the error indicator of {@link WalletIcon} (`customization.components.ErrorIndicator`). */
export type WalletIconErrorIndicatorProps = {
  /** Wallet name, formatted with `formatConnectorName` from `@tuwaio/orbit-core`. */
  walletName: string;
  /** Whether the icon image failed to load. The default indicator is shown only in development. */
  hasError: boolean;
};

/**
 * Props of the icon shown by {@link WalletIcon} when there is no valid `icon` URL or the image fails to load
 * (`customization.components.FallbackIcon`). The default one is `WalletIcon` from `@tuwaio/nova-core`.
 */
export type WalletIconFallbackIconProps = {
  /** Wallet name, formatted with `formatConnectorName` from `@tuwaio/orbit-core`. */
  walletName: string;
  /** Icon size in pixels. */
  size: number;
  /** Classes of the image (the result of `customization.classNames.image`, or the default ones). */
  className?: string;
};

/**
 * Customization options for WalletIcon component
 */
export type WalletIconCustomization = {
  /** Override container element props */
  containerProps?: Partial<ComponentPropsWithoutRef<'div'>>;
  /** Override image element props */
  imageProps?: Partial<ComponentPropsWithoutRef<'img'>>;
  /** Custom components */
  components?: {
    /** Custom loading overlay component */
    LoadingOverlay?: ComponentType<WalletIconLoadingOverlayProps>;
    /** Custom error indicator component (only shown in development) */
    ErrorIndicator?: ComponentType<WalletIconErrorIndicatorProps>;
    /** Custom fallback icon component */
    FallbackIcon?: ComponentType<WalletIconFallbackIconProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and `className`.
     *
     * @param params - The icon state.
     * @param params.isLoading - Whether the icon image is loading.
     * @param params.showLoading - The `showLoading` prop.
     * @param params.size - Icon size in pixels.
     * @returns The classes.
     */
    container?: (params: { isLoading: boolean; showLoading: boolean; size: number }) => string;
    /**
     * Returns the classes of the image (and of the fallback icon), instead of the default ones.
     *
     * @param params - The icon state.
     * @param params.isLoading - Whether the icon image is loading.
     * @param params.showLoading - The `showLoading` prop.
     * @param params.hasError - Whether the icon image failed to load.
     * @returns The classes.
     */
    image?: (params: { isLoading: boolean; showLoading: boolean; hasError: boolean }) => string;
    /**
     * Returns the classes of the loading overlay.
     *
     * @param params - The icon state.
     * @param params.isLoading - Whether the icon image is loading.
     * @param params.size - Icon size in pixels.
     * @returns The classes.
     */
    loadingOverlay?: (params: { isLoading: boolean; size: number }) => string;
  };
};

/**
 * Props of {@link WalletIcon}. The other props are passed to the container `<div>`.
 */
export interface WalletIconProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role'> {
  /**
   * Icon of the wallet, usually the `icon` of the connector or connection (a data URL). Only `http://`, `https://`,
   * `data:` and root-relative (`/`) URLs are used; otherwise the fallback icon is shown.
   */
  icon?: string;
  /** Name of the wallet, formatted with `formatConnectorName` from `@tuwaio/orbit-core` for the fallback icon. */
  name: string;
  /** Size of the icon in pixels. Defaults to `32`. */
  size?: number;
  /** Accessible label of the icon. Defaults to the wallet name and the `walletIcon` label. */
  altText?: string;
  /** Whether to show a pulsing placeholder while the image loads. Defaults to `false`. */
  showLoading?: boolean;
  /** Callback fired when image loads successfully */
  onImageLoad?: () => void;
  /** Callback fired when image fails to load */
  onImageError?: () => void;
  /** Whether the image is loaded lazily (`loading="lazy"`). Defaults to `false`. */
  lazy?: boolean;
  /** Customization options */
  customization?: WalletIconCustomization;
}

// --- Default Sub-Components ---
const DefaultLoadingOverlay = ({ isLoading, className }: WalletIconLoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'novacon:absolute novacon:inset-0 novacon:bg-[var(--tuwa-bg-muted)] novacon:animate-pulse novacon:rounded-full',
        className,
      )}
      aria-hidden="true"
    />
  );
};

const DefaultErrorIndicator = ({ walletName, hasError }: WalletIconErrorIndicatorProps) => {
  if (!hasError || process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      className="novacon:absolute novacon:top-0 novacon:right-0 novacon:w-2 novacon:h-2 novacon:bg-red-500 novacon:rounded-full"
      title={`Failed to load icon for ${walletName}`}
      aria-hidden="true"
    />
  );
};

const DefaultFallbackIcon = ({ walletName, className }: WalletIconFallbackIconProps) => {
  return <WI walletName={walletName} className={cn('novacon:flex-shrink-0', className)} />;
};

/**
 * The icon of a wallet: the `icon` image when it is a valid URL and loads, otherwise the icon of `@tuwaio/nova-core`
 * for the wallet name. The container has `role="img"` and an accessible label. In development, a red dot marks an icon
 * that failed to load.
 *
 * Props: {@link WalletIconProps}; the ref is forwarded to the container.
 *
 * Side effect: the browser loads the `icon` URL (wallet icons are usually data URLs).
 */
export const WalletIcon = forwardRef<HTMLDivElement, WalletIconProps>(
  (
    {
      icon,
      name,
      size = 32,
      className,
      altText,
      showLoading = false,
      onImageLoad,
      onImageError,
      lazy = false,
      customization,
      ...props
    },
    ref,
  ) => {
    const labels = useNovaConnectLabels();
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(Boolean(icon));

    // Extract custom components
    const {
      LoadingOverlay = DefaultLoadingOverlay,
      ErrorIndicator = DefaultErrorIndicator,
      FallbackIcon = DefaultFallbackIcon,
    } = customization?.components ?? {};

    // Format wallet name for consistency
    const walletName = formatConnectorName(name);

    // Generate alt text for accessibility
    const imageAltText = altText || `${walletName} ${labels.walletIcon}`;

    // Clean and validate icon URL
    // Clean and validate icon URL
    const cleanIconUrl = (() => {
      if (!icon) return null;

      try {
        const trimmedIcon = icon.trim();
        if (!trimmedIcon) return null;

        // Basic URL validation
        if (
          trimmedIcon.startsWith('http://') ||
          trimmedIcon.startsWith('https://') ||
          trimmedIcon.startsWith('/') ||
          trimmedIcon.startsWith('data:')
        ) {
          return trimmedIcon;
        }

        return null;
      } catch {
        return null;
      }
    })();

    // Handle image load success
    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
      onImageLoad?.();
    }, [onImageLoad]);

    // Handle image load error
    const handleImageError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
      onImageError?.();
    }, [onImageError]);

    // Generate container classes
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ isLoading, showLoading, size })
      : cn(
          'novacon:relative novacon:inline-flex novacon:items-center novacon:justify-center novacon:flex-shrink-0 novacon:w-full novacon:h-full',
          'novacon:overflow-hidden',
          {
            'novacon:animate-pulse novacon:bg-[var(--tuwa-bg-muted)]': showLoading && isLoading,
          },
          className,
        );

    // Generate image classes
    const imageClasses = customization?.classNames?.image
      ? customization.classNames.image({ isLoading, showLoading, hasError })
      : cn(
          'novacon:object-cover novacon:transition-opacity novacon:duration-200',
          'novacon:max-w-full novacon:max-h-full',
          'novacon:opacity-100',
          {
            'novacon:opacity-0': isLoading && showLoading,
          },
        );

    // Image style object
    const imageStyle = {
      width: size,
      height: size,
    };

    // Container props
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'img' as const,
      'aria-label': imageAltText,
      title: imageAltText,
      style: { lineHeight: 0, ...customization?.containerProps?.style, ...props.style },
    };

    // Image props
    const imageProps = {
      ...customization?.imageProps,
      src: cleanIconUrl!,
      alt: '', // Empty alt since parent div has role="img" and aria-label
      className: cn(imageClasses, customization?.imageProps?.className),
      style: { ...imageStyle, ...customization?.imageProps?.style },
      onLoad: handleImageLoad,
      onError: handleImageError,
      loading: (lazy ? 'lazy' : 'eager') as 'lazy' | 'eager',
      decoding: 'async' as const,
    };

    // Generate loading overlay classes
    const loadingOverlayClasses = customization?.classNames?.loadingOverlay
      ? customization.classNames.loadingOverlay({ isLoading, size })
      : undefined;

    return (
      <div {...containerProps}>
        {/* Loading overlay */}
        <LoadingOverlay size={size} isLoading={showLoading && isLoading} className={loadingOverlayClasses} />

        {/* Custom icon with error fallback */}
        {cleanIconUrl && !hasError ? (
          <img {...imageProps} />
        ) : (
          <FallbackIcon walletName={walletName} size={size} className={imageClasses} />
        )}

        {/* Error state indicator */}
        <ErrorIndicator walletName={walletName} hasError={hasError} />
      </div>
    );
  },
);

WalletIcon.displayName = 'WalletIcon';
