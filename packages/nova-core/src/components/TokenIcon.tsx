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
  /** Classes merged with the default classes (full size of the parent, corners of `--tuwa-rounded-full`, square by default). */
  className?: string;
}

/**
 * The icon of a token by its symbol, loaded on demand one icon at a time (a {@link FallbackIcon} meanwhile), for about
 * 1,850 tokens. The tokens of Payments and the popular ones (`web3IconImports`) come from `@web3icons/react` through your
 * bundler. Any other is fetched once from `raw.githubusercontent.com`, so that they cost your build nothing. A token the
 * repository does not have, or a request that fails, shows the first letter of its symbol.
 *
 * Side effect: a token outside the map sends one request to `raw.githubusercontent.com`, cached until the page reloads.
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
