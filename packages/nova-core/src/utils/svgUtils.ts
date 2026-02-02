/**
 * Resolves a CSS variable to its computed value.
 * Returns the original value if it's not a CSS variable.
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
 * Modifies the fill attribute of the first `<path>` element in an SVG string.
 * Uses DOMParser for safe XML manipulation.
 * Automatically resolves CSS variables (e.g., `var(--color)`) to their computed values.
 *
 * @param svgString - The original SVG markup
 * @param fillColor - The color to apply (supports CSS variables)
 * @returns Modified SVG string
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

  const firstPath = doc.querySelector('path');
  if (firstPath) {
    firstPath.setAttribute('fill', resolvedColor);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc.documentElement);
}

/**
 * Encodes an SVG string to a base64 data URL.
 *
 * @param svgString - The SVG markup
 * @param firstPathFill - Optional fill color to apply to the first path
 * @returns Base64-encoded data URL
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
 * formatIconNameForGithub("Wallet Connect")
 * // → "wallet-connect.svg"
 *
 * formatIconNameForGithub("MetaMask")
 * // → "metamask.svg"
 *
 * formatIconNameForGithub("coinbase")
 * // → "coinbase.svg"
 * ```
 */
export const formatIconNameForGithub = (name: string): string => `${name.replace(/\s+/g, '-').toLowerCase()}.svg`;
