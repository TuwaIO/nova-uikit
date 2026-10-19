import { Suspense } from 'react';

import { TokenIconLazy } from '../web3-icons';
import { FallbackIcon } from './FallbackIcon';

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

/**
 * The icon of a token by its symbol, drawn with `@web3icons/react` and loaded on demand one icon at a time (a pulsing
 * {@link FallbackIcon} meanwhile), without the token list of `@web3icons/common`. Icons exist for the tokens of the icon
 * map (the tokens of networks and of Payments: USDC, USDT, EURC, PYUSD, DAI, GHO, ETH, POL, BNB, SOL); any other
 * token shows the first letter of its symbol.
 *
 * @param props - See {@link TokenIconProps}.
 * @returns The icon element.
 */
export function TokenIcon(props: TokenIconProps) {
  return (
    <Suspense fallback={<FallbackIcon animate className={props.className} />}>
      <TokenIconLazy {...props} />
    </Suspense>
  );
}
