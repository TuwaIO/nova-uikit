import { ComponentProps, ReactNode, useCallback, useState } from 'react';

import { svgToBase64 } from '../utils/svgUtils';
import { SvgImg } from './SvgImg';

/**
 * Props for the SvgToImg component.
 */
export interface SvgToImgProps extends Omit<ComponentProps<'img'>, 'ref' | 'src' | 'children'> {
  /**
   * Renders the SVG. Pass `ref` to the `<svg>` element: when it mounts, its markup is converted to an image.
   *
   * @param ref - Callback ref for the `<svg>` element; it receives the element (or `null` when it unmounts).
   * @returns The SVG to convert.
   */
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
 * @param props - See {@link SvgToImgProps}; the other props are passed to the `<img>` element.
 * @returns The `<img>` with the converted SVG, or the output of `children` until the SVG has mounted.
 *
 * @example
 * ```tsx
 * import { SvgToImg } from '@tuwaio/nova-core';
 *
 * export const DotIcon = () => (
 *   <SvgToImg iconId="dot" alt="Dot">
 *     {(ref) => (
 *       <svg ref={ref} viewBox="0 0 24 24">
 *         <circle cx="12" cy="12" r="10" />
 *       </svg>
 *     )}
 *   </SvgToImg>
 * );
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
