import { createElement, type Ref, use } from 'react';

import { loadWeb3Icon } from '../utils/web3IconLoader';

/**
 * Renders an icon of `@web3icons/react` loaded with `loadWeb3Icon` (one icon at a time). It suspends while the icon loads, so render it
 * inside `Suspense`, and renders nothing when the icon does not exist.
 *
 * @param props - The `filePath` of the icon in the metadata, its `variant`, `className` and the `ref` of the SVG element.
 * @returns The icon element, or `null`.
 * @internal
 */
export function Web3IconLazy({
  filePath,
  variant,
  className,
  ref,
}: {
  filePath: string;
  variant?: 'background' | 'branded' | 'mono';
  className?: string;
  ref?: Ref<SVGSVGElement>;
}) {
  const Icon = use(loadWeb3Icon(filePath));
  // `Icon` is the default export of the icon module, cached per icon, so its identity never changes between renders
  // (the case the static-components rule guards against). `createElement` renders it, as `@web3icons/react` itself does.
  return Icon ? createElement(Icon, { ref, variant, className }) : null;
}
