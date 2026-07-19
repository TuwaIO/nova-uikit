import { ComponentProps, useEffect, useState } from 'react';

import { svgToBase64 } from '../utils/svgUtils';
import { FallbackIcon } from './FallbackIcon';
import { SvgImg } from './SvgImg';

/**
 * Base URL for fetching raw SVG icons from the web3icons GitHub repository.
 */
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/0xa3k5/web3icons/refs/heads/main/raw-svgs';

/**
 * In-memory cache for fetched SVG icons.
 * Key: `${githubSrc}|${firstPathFill ?? ''}` → Value: base64 encoded SVG
 * Persists until page reload.
 */
const svgCache = new Map<string, string>();

/**
 * Loading state for the icon fetch operation.
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Props for the GithubFallbackIcon component.
 */
interface GithubFallbackIconProps extends Omit<ComponentProps<'img'>, 'src'> {
  /**
   * Path to the SVG file within the web3icons repository.
   * @example "networks/background/ethereum.svg"
   */
  githubSrc: string;
  /**
   * Optional fill color to apply to the first `<path>` element.
   * Used for testnet/devnet visual differentiation.
   */
  firstPathFill?: string;
}

/**
 * Fetches and displays an SVG icon from the web3icons GitHub repository.
 *
 * Used as a fallback when the bundled `@web3icons/react` library
 * doesn't have a specific icon available.
 *
 * @param props - {@link GithubFallbackIconProps}
 * @returns Loading indicator, the fetched icon, or an error fallback
 */
export function GithubFallbackIcon({ githubSrc, className, alt, firstPathFill, ...props }: GithubFallbackIconProps) {
  const cacheKey = `${githubSrc}|${firstPathFill ?? ''}`;
  const cachedImgSrc = svgCache.get(cacheKey);

  const [fetchedImgSrc, setFetchedImgSrc] = useState<string | null>(null);
  const [fetchState, setFetchState] = useState<LoadingState>('idle');

  const imgSrc = cachedImgSrc || fetchedImgSrc;
  const state = cachedImgSrc ? 'success' : fetchState;

  useEffect(() => {
    let isMounted = true;

    // Check cache first (might be loaded by another instance)
    if (svgCache.has(cacheKey)) {
      return;
    }

    const loadSvg = async () => {
      setFetchState('loading');

      try {
        const response = await fetch(`${GITHUB_RAW_URL}/${githubSrc}`);

        if (!response.ok) {
          throw new Error(`Failed to load icon: ${response.status}`);
        }

        const svg = await response.text();

        if (isMounted) {
          const base64Svg = svgToBase64(svg, firstPathFill);
          // Cache the result
          svgCache.set(cacheKey, base64Svg);
          setFetchedImgSrc(base64Svg);
          setFetchState('success');
        }
      } catch {
        if (isMounted) {
          setFetchState('error');
        }
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, [githubSrc, firstPathFill, cacheKey]);

  if (state === 'loading' || state === 'idle') {
    return <FallbackIcon animate className={className} />;
  }

  if (state === 'success' && imgSrc) {
    return <SvgImg {...props} src={imgSrc} alt={alt} className={className} />;
  }

  return <FallbackIcon content="?" className={className} />;
}
