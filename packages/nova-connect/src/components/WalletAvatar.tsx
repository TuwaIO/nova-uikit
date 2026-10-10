/**
 * @file This file contains the `WalletAvatar` component, a customizable user avatar renderer with ENS support and
 * blockie fallback.
 */

import { cn } from '@tuwaio/nova-core';
import makeBlockie from 'ethereum-blockies-base64';
import { ComponentPropsWithoutRef, ComponentType, forwardRef, useCallback, useState } from 'react';

import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';

// --- Types for Customization ---
/** Props of the loading overlay of {@link WalletAvatar} (`customization.components.LoadingOverlay`). */
export type WalletAvatarLoadingOverlayProps = {
  /** Whether the avatar image is loading. */
  isLoading: boolean;
  /** The `showLoading` prop. */
  showLoading: boolean;
  /** The `disableAnimation` prop. */
  disableAnimation: boolean;
  /** The avatar size. */
  size: WalletAvatarSize;
};

/** Props of the image of {@link WalletAvatar} (`customization.components.AvatarImage`). */
export type WalletAvatarImageProps = {
  /** Image URL: the avatar, or the blockie of the address. */
  src: string;
  /** Whether the image is loading. */
  isLoading: boolean;
  /** Call when the image has loaded. */
  onLoad: () => void;
  /**
   * Call when the image fails to load; the avatar then shows the blockie.
   *
   * @param event - The error event of the image.
   */
  onError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** The wallet address. */
  address: string;
  /** The `ensAvatar` prop. */
  ensAvatar?: string | null;
  /** The avatar size. */
  size: WalletAvatarSize;
};

/**
 * Props of the content shown by {@link WalletAvatar} when there is no image at all
 * (`customization.components.FallbackContent`).
 */
export type WalletAvatarFallbackContentProps = {
  /** The wallet address. */
  address: string;
  /** The address formatted by `customization.utils.formatAddress` (`0x1234...abcd` by default). */
  formattedAddress: string;
  /** The avatar size. */
  size: WalletAvatarSize;
};

/** Size of {@link WalletAvatar}: 16, 24, 32 or 48 pixels. */
export type WalletAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Customization options for WalletAvatar component
 */
export type WalletAvatarCustomization = {
  /** Override container element props */
  containerProps?: Partial<ComponentPropsWithoutRef<'div'>>;
  /** Override image element props */
  imageProps?: Partial<ComponentPropsWithoutRef<'img'>>;
  /** Custom components */
  components?: {
    /** Custom loading overlay component */
    LoadingOverlay?: ComponentType<WalletAvatarLoadingOverlayProps>;
    /** Custom avatar image component */
    AvatarImage?: ComponentType<WalletAvatarImageProps>;
    /** Custom fallback content component for extreme error cases */
    FallbackContent?: ComponentType<WalletAvatarFallbackContentProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones and `className`.
     *
     * @param params - The avatar state.
     * @param params.size - The avatar size.
     * @param params.bgColor - Background color from `utils.generateBgColor`.
     * @param params.address - The wallet address.
     * @returns The classes.
     */
    container?: (params: { size: WalletAvatarSize; bgColor: string; address: string }) => string;
    /**
     * Returns the classes of the loading overlay.
     *
     * @param params - The avatar state.
     * @param params.isLoading - Whether the image is loading.
     * @param params.showLoading - The `showLoading` prop.
     * @param params.disableAnimation - The `disableAnimation` prop.
     * @returns The classes.
     */
    loadingOverlay?: (params: { isLoading: boolean; showLoading: boolean; disableAnimation: boolean }) => string;
    /**
     * Returns the classes of the image.
     *
     * @param params - The avatar state.
     * @param params.isLoading - Whether the image is loading.
     * @param params.size - The avatar size.
     * @param params.hasError - Whether the avatar image failed to load.
     * @returns The classes.
     */
    image?: (params: { isLoading: boolean; size: WalletAvatarSize; hasError: boolean }) => string;
    /**
     * Returns the classes of the fallback content.
     *
     * @param params - The avatar state.
     * @param params.size - The avatar size.
     * @param params.address - The wallet address.
     * @returns The classes.
     */
    fallbackContent?: (params: { size: WalletAvatarSize; address: string }) => string;
  };
  /** Custom utilities */
  utils?: {
    /**
     * Returns the image shown without an avatar or when the avatar fails. By default a blockie
     * (`ethereum-blockies-base64`) seeded with the address, for addresses of any network.
     *
     * @param address - The wallet address.
     * @returns An image URL (a data URL by default), or `null`.
     */
    generateBlockie?: (address: string) => string | null;
    /**
     * Returns the background color of the container. By default the first six hexadecimal digits of a `0x` address,
     * or a color derived from the address for other networks (`#6B7280` without an address).
     *
     * @param address - The wallet address.
     * @returns A CSS color.
     */
    generateBgColor?: (address: string) => string;
    /**
     * Returns the address shown in the accessible label and the fallback content. By default `0x1234...abcd`, or the
     * `unknownWallet` label without an address.
     *
     * @param address - The wallet address.
     * @param labels - The labels of Nova Connect.
     * @returns The formatted address.
     */
    formatAddress?: (address: string, labels: Record<string, string>) => string;
  };
};

/** Props of {@link WalletAvatar}. The other props are passed to the container `<div>`. */
export interface WalletAvatarProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role'> {
  /** The user's wallet address, used for the blockie fallback and background color. */
  address: string;
  /** An optional URL for the user's ENS avatar image. */
  ensAvatar?: string | null;
  /** Custom alt text for the avatar image */
  altText?: string;
  /** Size of the avatar. Defaults to `'md'`. */
  size?: WalletAvatarSize;
  /** Whether to show loading animation */
  showLoading?: boolean;
  /** Callback fired when image loads successfully */
  onImageLoad?: () => void;
  /**
   * Called when the avatar image fails to load (the blockie is shown instead).
   *
   * @param error - The error event of the image.
   */
  onImageError?: (error: Event) => void;
  /** Whether to disable the pulse animation */
  disableAnimation?: boolean;
  /** Customization options */
  customization?: WalletAvatarCustomization;
}

// --- Utility Functions ---
const isHexAddress = (value: string): boolean => /^0x[0-9a-fA-F]{6,}$/.test(value);

// A 24-bit color from a string hash (djb2), for addresses that are not hexadecimal (Solana)
const hashColor = (value: string): string => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return `#${(hash & 0xffffff).toString(16).padStart(6, '0')}`;
};

// Size mapping for different avatar sizes
const sizeClasses = {
  sm: 'novacon:h-4 novacon:w-4',
  md: 'novacon:h-6 novacon:w-6',
  lg: 'novacon:h-8 novacon:w-8',
  xl: 'novacon:h-12 novacon:w-12',
} as const;

// --- Default Sub-Components ---
const DefaultLoadingOverlay = ({ isLoading, showLoading, disableAnimation }: WalletAvatarLoadingOverlayProps) => {
  const loadingClasses = cn(
    'novacon:absolute novacon:inset-0 novacon:rounded-full novacon:bg-[var(--tuwa-bg-muted)]',
    {
      'novacon:animate-pulse': !disableAnimation && showLoading && isLoading,
      'novacon:opacity-0': !isLoading || !showLoading,
    },
    'novacon:transition-opacity novacon:duration-300',
  );

  return <div className={loadingClasses} aria-hidden="true" />;
};

const DefaultAvatarImage = ({ src, isLoading, onLoad, onError, address, ensAvatar }: WalletAvatarImageProps) => {
  return (
    <img
      key={`${ensAvatar || 'blockie'}-${address}`}
      className={cn(
        'novacon:h-full novacon:w-full novacon:rounded-full novacon:object-cover novacon:relative novacon:z-10',
        'novacon:transition-opacity novacon:duration-300 novacon:opacity-100',
        {
          'novacon:opacity-0': isLoading,
        },
      )}
      src={src}
      alt=""
      onLoad={onLoad}
      onError={onError}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
};

const DefaultFallbackContent = ({ formattedAddress }: WalletAvatarFallbackContentProps) => {
  return (
    <div
      className="novacon:absolute novacon:inset-0 novacon:flex novacon:items-center novacon:justify-center novacon:text-white novacon:text-xs novacon:font-mono"
      aria-hidden="true"
    >
      {formattedAddress.slice(0, 2)}
    </div>
  );
};

// --- Default Utility Functions ---
const defaultGenerateBlockie = (address: string): string | null => {
  try {
    // The blockie seed is any string: a Solana address gets its own blockie too
    return address ? makeBlockie(address) : null;
  } catch (error) {
    console.warn('Failed to generate blockie for address:', address, error);
    return null;
  }
};

const defaultGenerateBgColor = (address: string): string => {
  if (!address) return '#6B7280';
  return isHexAddress(address) ? `#${address.slice(2, 8)}` : hashColor(address);
};

const defaultFormatAddress = (address: string, labels: Record<string, string>): string => {
  if (!address) return labels.unknownWallet;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * The round avatar of a wallet: `ensAvatar` (an ENS or SNS avatar URL from the Satellite adapters) when it loads,
 * otherwise a blockie of the address on a background color derived from it. The container has `role="img"` and an
 * accessible label.
 *
 * Props: {@link WalletAvatarProps}; the ref is forwarded to the container.
 *
 * Side effect: the browser loads the `ensAvatar` URL.
 */
export const WalletAvatar = forwardRef<HTMLDivElement, WalletAvatarProps>(
  (
    {
      address,
      ensAvatar,
      className,
      altText,
      size = 'md',
      showLoading = true,
      onImageLoad,
      onImageError,
      disableAnimation = false,
      customization,
      ...props
    },
    ref,
  ) => {
    const labels = useNovaConnectLabels();

    // State management
    const [imageSrc, setImageSrc] = useState<string | null>(ensAvatar ?? null);
    const [isLoading, setIsLoading] = useState(Boolean(ensAvatar));
    const [hasError, setHasError] = useState(false);

    // Extract custom components and utilities
    const {
      LoadingOverlay = DefaultLoadingOverlay,
      AvatarImage = DefaultAvatarImage,
      FallbackContent = DefaultFallbackContent,
    } = customization?.components ?? {};

    const {
      generateBlockie = defaultGenerateBlockie,
      generateBgColor = defaultGenerateBgColor,
      formatAddress = defaultFormatAddress,
    } = customization?.utils ?? {};

    // Generate blockie using custom or default function
    const blockie = generateBlockie(address);

    // Generate background color using custom or default function
    // Generate background color using custom or default function
    const bgColor = generateBgColor(address);

    // Format address using custom or default function
    const formattedAddress = formatAddress(address, labels);

    // Generate alt text for accessibility
    const imageAltText = altText
      ? altText
      : hasError || !ensAvatar
        ? `${labels.walletAvatar} ${formattedAddress}`
        : `${labels.ensAvatar} ${formattedAddress}`;

    // A new avatar URL loads again. Compared while rendering, not in an effect: an effect also runs on mount, after a
    // cached image has already fired `load` (a remount after a transaction), and put the avatar back into its loading
    // state for good
    const [shownEnsAvatar, setShownEnsAvatar] = useState(ensAvatar);
    if (ensAvatar !== shownEnsAvatar) {
      setShownEnsAvatar(ensAvatar);
      setImageSrc(ensAvatar ?? null);
      setIsLoading(Boolean(ensAvatar));
      setHasError(false);
    }

    // Handle image load success
    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
      onImageLoad?.();
    }, [onImageLoad]);

    // Handle image load error
    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false);
      setHasError(true);
      const blockie = generateBlockie(address);
      setImageSrc(blockie);
      onImageError?.(event.nativeEvent);
    };

    // Generate container classes
    const containerClasses = customization?.classNames?.container
      ? customization.classNames.container({ size, bgColor, address })
      : cn(
          sizeClasses[size],
          'novacon:flex-shrink-0 novacon:rounded-full novacon:relative novacon:overflow-hidden',
          'novacon:ring-1 novacon:ring-[var(--tuwa-border-primary)]',
          'novacon:focus-within:ring-2 novacon:focus-within:ring-[var(--tuwa-text-accent)]',
          className,
        );

    // Get current image source with fallback
    const currentImageSrc = imageSrc || blockie || '';

    // Container props
    const containerProps = {
      ...customization?.containerProps,
      ...props,
      ref,
      className: containerClasses,
      role: 'img' as const,
      'aria-label': imageAltText,
      title: imageAltText,
    };

    return (
      <div {...containerProps}>
        {/* Loading overlay */}
        <LoadingOverlay
          isLoading={isLoading}
          showLoading={showLoading}
          disableAnimation={disableAnimation}
          size={size}
        />

        {/* Avatar image */}
        {currentImageSrc && (
          <AvatarImage
            src={currentImageSrc}
            isLoading={isLoading}
            onLoad={handleImageLoad}
            onError={handleImageError}
            address={address}
            ensAvatar={ensAvatar}
            size={size}
          />
        )}

        {/* Fallback content for extreme error cases */}
        {!currentImageSrc && <FallbackContent address={address} formattedAddress={formattedAddress} size={size} />}
      </div>
    );
  },
);

WalletAvatar.displayName = 'WalletAvatar';
