import { createElement, use } from 'react';

import { cn } from '../utils';
import { loadWeb3Icon } from '../utils/web3IconLoader';
import { FallbackIcon } from './FallbackIcon';
import { SvgToImg } from './SvgToImg';

/**
 * Renders the icon of a token of `@web3icons/react` loaded with `loadWeb3Icon` (`token:<SYMBOL>`, one icon at a time),
 * or the first letter of the symbol when the icon map has no icon for it. It suspends while the icon loads, so render it
 * inside `Suspense`.
 *
 * @param props - The token `symbol` (any letter case), the icon `variant` and the `className` merged with the default
 *   classes.
 * @returns The icon element, or the letter fallback.
 * @internal
 */
export function TokenIconLazy({
  symbol,
  variant = 'background',
  className,
}: {
  symbol: string;
  variant?: 'background' | 'branded' | 'mono';
  className?: string;
}) {
  const key = symbol.toUpperCase();
  const Icon = use(loadWeb3Icon(`token:${key}`));
  if (!Icon) return <FallbackIcon content={key.charAt(0)} className={className} />;
  return (
    <SvgToImg
      iconId={`token-${key}-${variant}`}
      className={cn('novacore:w-full novacore:h-full novacore:rounded-full', className)}
    >
      {(ref) => createElement(Icon, { ref, variant })}
    </SvgToImg>
  );
}
