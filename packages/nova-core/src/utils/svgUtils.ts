/**
 * Resolves a CSS variable to its computed value on `document.documentElement`.
 * Returns the original value if it's not a CSS variable. Call it in the browser: it reads `getComputedStyle`.
 *
 * @param value - Color value, potentially a CSS variable like `var(--my-color)`
 * @returns Resolved color value (e.g., `#ff0000`) or original if not a variable
 */
export function resolveCssVariable(value: string): string {
  if (!value.startsWith('var(')) return value;

  // Extract variable name: var(--tuwa-color) -> --tuwa-color
  // Also handles fallback: var(--tuwa-color, #fff) -> --tuwa-color
  const match = value.match(/var\(\s*(--[\w-]+)/);
  if (!match) return value;

  const varName = match[1];
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

  // Return resolved value or original if variable is undefined
  return resolved || value;
}

/**
 * A `<path>` element of an SVG, as {@link recolorTestnetPaths} reads and writes it.
 * @internal
 */
export interface SvgPathLike {
  /**
   * Reads an attribute.
   *
   * @param name - The attribute name.
   * @returns Its value, or `null`.
   */
  getAttribute(name: string): string | null;
  /**
   * Writes an attribute.
   *
   * @param name - The attribute name.
   * @param value - The new value.
   */
  setAttribute(name: string, value: string): void;
}

/** A white fill: the mark of a network icon drawn over its background. */
const WHITE_FILL = /^\s*(?:#f{3}|#f{4}|#f{6}|#f{8}|white)\s*$/i;

/**
 * Recolors the drawn paths of an icon for a testnet: the first one, the background, takes `fillColor`, and the white
 * paths over it (the mark) take the fill the background had, so the mark keeps the brand color on the new background.
 * Without that, a mark that is a plain shape reads as something else: the white square of Base on a grey background
 * looked like an empty checkbox. A mark with colors of its own (the Ethereum diamond) keeps them, and so does a white one
 * over a gradient (the Solana bars stay white): only a solid color moves to the mark.
 *
 * @param paths - The drawn `<path>` elements in document order, without those of `<defs>`, `<clipPath>` or `<mask>`.
 * @param fillColor - The fill of the background.
 * @internal
 */
export function recolorTestnetPaths(paths: readonly SvgPathLike[], fillColor: string): void {
  const [background, ...rest] = paths;
  if (!background) return;
  const brandFill = background.getAttribute('fill');
  background.setAttribute('fill', fillColor);
  if (!brandFill || brandFill === 'none' || brandFill.startsWith('url(')) return;
  for (const path of rest) {
    if (WHITE_FILL.test(path.getAttribute('fill') ?? '')) path.setAttribute('fill', brandFill);
  }
}

/**
 * Recolors a network icon for a testnet: the first drawn `<path>` (the background) takes the color, and the white paths
 * over it (the mark) take a solid color the background had, so the mark keeps its brand color (the Base square stays blue
 * on grey instead of reading as an empty white box); over a gradient it stays white, and a mark with colors of its own keeps
 * them. Paths of `<defs>`,
 * `<clipPath>` and `<mask>` are left alone. Uses DOMParser for safe XML manipulation, so call it in the browser. Automatically resolves CSS variables (e.g., `var(--color)`) to their computed values with
 * {@link resolveCssVariable}.
 *
 * @param svgString - The original SVG markup
 * @param fillColor - The color of the background (supports CSS variables)
 * @returns Modified SVG string, or the original string (with a console warning) when it cannot be parsed
 */
export function applyFirstPathFill(svgString: string, fillColor: string): string {
  const resolvedColor = resolveCssVariable(fillColor);

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn('SVG parse error, returning original');
    return svgString;
  }

  // The paths that are drawn: those of clip paths, masks and other definitions only shape them
  const drawn = [...doc.querySelectorAll('path')].filter(
    (path) => !path.closest('defs, clipPath, mask, pattern, symbol, marker'),
  );
  recolorTestnetPaths(drawn, resolvedColor);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc.documentElement);
}

/**
 * Encodes an SVG string to a base64 data URL.
 *
 * @param svgString - The SVG markup
 * @param firstPathFill - Optional testnet color of the background, applied with {@link applyFirstPathFill} (browser only)
 * @returns Base64-encoded data URL (`data:image/svg+xml;base64,…`)
 */
export function svgToBase64(svgString: string, firstPathFill?: string): string {
  let processedSvg = svgString;

  if (firstPathFill) {
    processedSvg = applyFirstPathFill(processedSvg, firstPathFill);
  }

  const base64 = btoa(unescape(encodeURIComponent(processedSvg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Formats a name string into a GitHub-compatible SVG filename.
 *
 * Converts spaces to hyphens and lowercases the string,
 * then appends the `.svg` extension.
 *
 * @param name - The name to format (e.g., "Wallet Connect", "MetaMask")
 * @returns Formatted filename (e.g., "wallet-connect.svg", "metamask.svg")
 *
 * @example
 * ```ts
 * import { formatIconNameForGithub } from '@tuwaio/nova-core';
 *
 * formatIconNameForGithub('Wallet Connect'); // → 'wallet-connect.svg'
 * formatIconNameForGithub('MetaMask'); // → 'metamask.svg'
 * ```
 */
export const formatIconNameForGithub = (name: string): string => `${name.replace(/\s+/g, '-').toLowerCase()}.svg`;
