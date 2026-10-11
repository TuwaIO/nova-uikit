import { createElement, Suspense, use } from 'react';

import { cn } from '../utils';
import { loadWeb3Icon } from '../utils/web3IconLoader';
import { FallbackIcon } from './FallbackIcon';
import { SvgToImg } from './SvgToImg';

/**
 * Props for the {@link TokenIcon} component.
 */
export interface TokenIconProps {
  /** The token symbol, for example `USDC` (any letter case). */
  symbol: string;
  /** Icon style of `@web3icons/react`. Defaults to `'background'`. */
  variant?: 'background' | 'branded' | 'mono';
  /** Classes merged with the default classes (full size of the parent, rounded). */
  className?: string;
}

/** The icon once loaded, or the first letter of the symbol when `@web3icons/react` has none. */
function LoadedTokenIcon({ symbol, variant = 'background', className }: TokenIconProps) {
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

/**
 * The icon of a token by its symbol, drawn with `@web3icons/react` and loaded on demand one icon at a time (a pulsing
 * {@link FallbackIcon} meanwhile), without the token list of `@web3icons/common`. A token without an icon shows the
 * first letter of its symbol.
 *
 * @param props - See {@link TokenIconProps}.
 * @returns The icon element.
 */
export function TokenIcon(props: TokenIconProps) {
  return (
    <Suspense fallback={<FallbackIcon animate className={props.className} />}>
      <LoadedTokenIcon {...props} />
    </Suspense>
  );
}
