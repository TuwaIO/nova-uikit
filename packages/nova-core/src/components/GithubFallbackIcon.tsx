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
const svgCache = new Map<string, { src: string; isMono: boolean }>();

/**
 * The request of each icon, kept with its answer, good or bad, for the life of the page: a table of one token asked GitHub
 * once per row, and an icon the repository does not have or a request that failed was asked for again on every mount.
 */
const svgRequests = new Map<string, Promise<{ svg: string; path: string }>>();

/** Asks for the paths in order until the repository has one. Only a 404 moves on: a failure says nothing of the file. */
const requestSvg = (paths: string[]): Promise<{ svg: string; path: string }> => {
  const key = paths.join('|');
  let request = svgRequests.get(key);
  if (!request) {
    request = (async () => {
      for (const path of paths) {
        const response = await fetch(`${GITHUB_RAW_URL}/${path}`);
        if (response.ok) return { svg: await response.text(), path };
        if (response.status !== 404) throw new Error(`Failed to load icon: ${response.status}`);
      }
      throw new Error('The repository has no such icon');
    })();
    svgRequests.set(key, request);
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
  /** Paths to try in order when the repository does not have `githubSrc`, such as the other styles of an icon. */
  alternativeSrcs?: string[];
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
  alternativeSrcs,
  ...props
}: GithubFallbackIconProps) {
  const cacheKey = `${githubSrc}|${firstPathFill ?? ''}`;
  const cached = svgCache.get(cacheKey);

  const [fetched, setFetched] = useState<{ src: string; isMono: boolean } | null>(null);
  const [fetchState, setFetchState] = useState<LoadingState>('idle');

  const drawn = cached ?? fetched;
  const state = cached ? 'success' : fetchState;
  const alternativesKey = alternativeSrcs?.join('|') ?? '';

  useEffect(() => {
    // Check cache first (might be loaded by another instance)
    if (svgCache.has(cacheKey) || !hasFileName(githubSrc)) return;

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchState('loading');

    requestSvg([githubSrc, ...(alternativesKey ? alternativesKey.split('|') : [])]).then(
      ({ svg, path }) => {
        if (!isMounted) return;
        const icon = { src: svgToBase64(svg, firstPathFill), isMono: path.includes('/mono/') };
        // Cache the result
        svgCache.set(cacheKey, icon);
        setFetched(icon);
        setFetchState('success');
      },
      () => {
        if (isMounted) setFetchState('error');
      },
    );

    return () => {
      isMounted = false;
    };
  }, [githubSrc, alternativesKey, firstPathFill, cacheKey]);

  if (!hasFileName(githubSrc)) {
    return <FallbackIcon content={fallbackContent} className={className} />;
  }

  if (state === 'loading' || state === 'idle') {
    return <FallbackIcon animate className={className} />;
  }

  if (state === 'success' && drawn?.isMono) {
    // By its shape, in the color of the text: drawn with `currentColor`, which an `<img>` cannot inherit, it was black on a
    // dark theme
    const mask = `url("${drawn.src}") center / contain no-repeat`;
    return (
      <span
        role="img"
        aria-label={alt}
        className={className}
        style={{ display: 'block', backgroundColor: 'currentColor', mask, WebkitMask: mask }}
      />
    );
  }

  if (state === 'success' && drawn) {
    return <SvgImg {...props} src={drawn.src} alt={alt} className={className} />;
  }

  return <FallbackIcon content={fallbackContent} className={className} />;
}
