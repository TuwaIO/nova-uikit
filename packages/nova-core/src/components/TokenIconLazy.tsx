import { createElement, use } from 'react';

import { cn } from '../utils';
import { loadWeb3Icon } from '../utils/web3IconLoader';
import { FallbackIcon } from './FallbackIcon';
import { GithubFallbackIcon } from './GithubFallbackIcon';
import { SvgToImg } from './SvgToImg';

/**
 * Renders the icon of a token: one of the map loaded with `loadWeb3Icon` (`token:<SYMBOL>`, one icon at a time), any other
 * fetched from the web3icons repository by {@link GithubFallbackIcon}, or the first letter of the symbol when there is none.
 * It suspends while an icon of the map loads, so render it inside `Suspense`.
 *
 * Side effect: a token outside the map sends one request to `raw.githubusercontent.com`.
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
  if (!Icon) {
    // Only what can be a file name: the symbol comes from outside and goes into a URL
    if (!/^[A-Z0-9]{1,16}$/.test(key)) return <FallbackIcon content={key.charAt(0)} className={className} />;
    return (
      <GithubFallbackIcon
        githubSrc={`tokens/${variant}/${key}.svg`}
        fallbackContent={key.charAt(0)}
        alt={key}
        className={cn('novacore:w-full novacore:h-full novacore:rounded-full', className)}
      />
    );
  }
  // A mono icon is drawn with `currentColor`, which an `<img>` cannot inherit: it was black on every theme
  if (variant === 'mono') {
    return createElement(Icon, {
      variant,
      className: cn('novacore:w-full novacore:h-full novacore:rounded-full', className),
    });
  }
  return (
    <SvgToImg
      iconId={`token-${key}-${variant}`}
      className={cn('novacore:w-full novacore:h-full novacore:rounded-full', className)}
    >
      {(ref) => createElement(Icon, { ref, variant })}
    </SvgToImg>
  );
}
