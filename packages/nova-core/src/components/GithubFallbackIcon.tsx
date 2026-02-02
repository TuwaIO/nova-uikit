import { ComponentProps, useEffect, useState } from 'react';

import { svgToBase64 } from '../utils/svgUtils';
import { FallbackIcon } from './FallbackIcon';
import { SvgImg } from './SvgImg';

/**
 * Base URL for fetching raw SVG icons from the web3icons GitHub repository.
 */
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/0xa3k5/web3icons/refs/heads/main/raw-svgs';

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
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [state, setState] = useState<LoadingState>('idle');

  useEffect(() => {
    let isMounted = true;

    const loadSvg = async () => {
      setState('loading');

      try {
        const response = await fetch(`${GITHUB_RAW_URL}/${githubSrc}`);

        if (!response.ok) {
          throw new Error(`Failed to load icon: ${response.status}`);
        }

        const svg = await response.text();

        if (isMounted) {
          setImgSrc(svgToBase64(svg, firstPathFill));
          setState('success');
        }
      } catch {
        if (isMounted) {
          setState('error');
        }
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, [githubSrc, firstPathFill]);

  if (state === 'loading' || state === 'idle') {
    return <FallbackIcon animate className={className} />;
  }

  if (state === 'success' && imgSrc) {
    return <SvgImg {...props} src={imgSrc} alt={alt} className={className} />;
  }

  return <FallbackIcon content="?" className={className} />;
}
