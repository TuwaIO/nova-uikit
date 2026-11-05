/** The styles of the `@web3icons/react` icons. */
export type IconVariant = 'background' | 'branded' | 'mono';

const PREFERRED: IconVariant[] = ['background', 'branded', 'mono'];

/**
 * The style to draw an icon in. Not every icon has all three (MetaMask has no `mono`), and `@web3icons/react` renders nothing for a
 * style the icon does not have, which leaves an empty place in the UI: such an icon is drawn in a style it has.
 *
 * @param listed - The `variants` of the icon in the `@web3icons/common` metadata.
 * @param wanted - The style that was asked for.
 * @returns The style to draw.
 */
export function iconVariantOf(listed: readonly string[] | undefined, wanted: IconVariant): IconVariant {
  if (!listed?.length || listed.includes(wanted)) return wanted;
  return PREFERRED.find((variant) => listed.includes(variant)) ?? wanted;
}
