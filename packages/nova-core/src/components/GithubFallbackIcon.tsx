import { ComponentProps, useEffect, useState } from 'react';

import { svgToBase64 } from '../utils/svgUtils';
import { FallbackIcon } from './FallbackIcon';
import { SvgImg } from './SvgImg';

/**
 * Base URL for fetching raw SVG icons from the web3icons GitHub repository.
 */
// One commit, not a branch: what a page draws must not change under it
const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/0xa3k5/web3icons/fab284b6877de4243700e59fd60ced2164fa4992/raw-svgs';

/**
 * In-memory cache for fetched SVG icons.
 * Key: `${githubSrc}|${firstPathFill ?? ''}` → Value: base64 encoded SVG
 * Persists until page reload.
 */
const svgCache = new Map<string, string>();

/**
 * The request of each icon, kept with its answer, good or bad, for the life of the page: a table of one token asked GitHub
 * once per row, and an icon the repository does not have or a request that failed was asked for again on every mount.
 */
const svgRequests = new Map<string, Promise<string>>();

const requestSvg = (githubSrc: string): Promise<string> => {
  let request = svgRequests.get(githubSrc);
  if (!request) {
    request = fetch(`${GITHUB_RAW_URL}/${githubSrc}`).then((response) => {
      if (!response.ok) throw new Error(`Failed to load icon: ${response.status}`);
      return response.text();
    });
    svgRequests.set(githubSrc, request);
  }
  return request;
};

/** A path without a file name, as for a wallet with an empty name: there is nothing to ask for. */
const hasFileName = (githubSrc: string) => !/(^|\/)\.svg$/.test(githubSrc);

/**
 * Loading state for the icon fetch operation.
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Props for the GithubFallbackIcon component.
 */
export interface GithubFallbackIconProps extends Omit<ComponentProps<'img'>, 'src'> {
  /**
   * Path to the SVG file within the web3icons repository.
   * @example "networks/background/ethereum.svg"
   */
  githubSrc: string;
  /**
   * Optional fill color of the first `<path>` element, the background of a network icon, for testnets and the Solana
   * devnet and testnet: the white mark over it takes the color the background had (`applyFirstPathFill`).
   */
  firstPathFill?: string;
  /** What the fallback shows when the icon cannot be loaded. Defaults to `?`. */
  fallbackContent?: string;
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
export function GithubFallbackIcon({
  githubSrc,
  className,
  alt,
  firstPathFill,
  fallbackContent = '?',
  ...props
}: GithubFallbackIconProps) {
  const cacheKey = `${githubSrc}|${firstPathFill ?? ''}`;
  const cachedImgSrc = svgCache.get(cacheKey);

  const [fetchedImgSrc, setFetchedImgSrc] = useState<string | null>(null);
  const [fetchState, setFetchState] = useState<LoadingState>('idle');

  const imgSrc = cachedImgSrc || fetchedImgSrc;
  const state = cachedImgSrc ? 'success' : fetchState;

  useEffect(() => {
    // Check cache first (might be loaded by another instance)
    if (svgCache.has(cacheKey) || !hasFileName(githubSrc)) return;

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchState('loading');

    requestSvg(githubSrc).then(
      (svg) => {
        if (!isMounted) return;
        const base64Svg = svgToBase64(svg, firstPathFill);
        // Cache the result
        svgCache.set(cacheKey, base64Svg);
        setFetchedImgSrc(base64Svg);
        setFetchState('success');
      },
      () => {
        if (isMounted) setFetchState('error');
      },
    );

    return () => {
      isMounted = false;
    };
  }, [githubSrc, firstPathFill, cacheKey]);

  if (!hasFileName(githubSrc)) {
    return <FallbackIcon content={fallbackContent} className={className} />;
  }

  if (state === 'loading' || state === 'idle') {
    return <FallbackIcon animate className={className} />;
  }

  if (state === 'success' && imgSrc) {
    return <SvgImg {...props} src={imgSrc} alt={alt} className={className} />;
  }

  return <FallbackIcon content={fallbackContent} className={className} />;
}
