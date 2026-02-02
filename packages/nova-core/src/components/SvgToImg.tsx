import { ComponentProps, ReactNode, useCallback, useState } from 'react';

import { svgToBase64 } from '../utils/svgUtils';
import { SvgImg } from './SvgImg';

/**
 * Props for the SvgToImg component.
 */
interface SvgToImgProps extends Omit<ComponentProps<'img'>, 'ref' | 'src' | 'children'> {
  /** Child SVG element to render while converting */
  children: (ref: (node: SVGSVGElement | null) => void) => ReactNode;
  /**
   * Unique identifier for the icon. When this changes, the cached image is reset.
   * Prevents showing stale icons when content changes dynamically.
   */
  iconId: string | number;
  /**
   * Optional fill color to apply to the first `<path>` element.
   * Used for testnet/devnet visual differentiation.
   * @example "var(--tuwa-testnet-icons)"
   */
  firstPathFill?: string;
}

/**
 * Converts an SVG element to an `<img>` tag with a base64-encoded data URL.
 *
 * This component solves the problem of duplicate SVG `id` attributes
 * when rendering multiple identical icons on the same page.
 *
 * Uses a render prop pattern to inject a callback ref that captures
 * the SVG immediately when it mounts.
 *
 * @param props - {@link SvgToImgProps}
 * @returns The converted image or the original children while loading
 *
 * @example
 * ```tsx
 * <SvgToImg iconId={chainId} firstPathFill={TESTNET_FILL}>
 *   {(ref) => <NetworkIconLazy ref={ref} chainId={chainId} />}
 * </SvgToImg>
 * ```
 */
export function SvgToImg({ children, iconId, alt, firstPathFill, ...props }: SvgToImgProps) {
  const [cache, setCache] = useState<{ id: string | number; src: string } | null>(null);

  const captureRef = useCallback(
    (node: SVGSVGElement | null) => {
      if (node) {
        const src = svgToBase64(node.outerHTML, firstPathFill);
        setCache({ id: iconId, src });
      }
    },
    [iconId, firstPathFill],
  );

  // Show cached image if it matches current iconId
  if (cache && cache.id === iconId) {
    return <SvgImg {...props} src={cache.src} alt={alt} />;
  }

  return <>{children(captureRef)}</>;
}
