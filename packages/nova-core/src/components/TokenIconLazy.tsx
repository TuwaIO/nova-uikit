import { createElement, use } from 'react';

import { cn } from '../utils';
import { getWeb3IconKey, loadWeb3Icon, web3TokenIconVariants } from '../utils/web3IconLoader';
import { FallbackIcon } from './FallbackIcon';
import { GithubFallbackIcon } from './GithubFallbackIcon';
import { iconVariantOf } from './iconVariant';
import { SvgToImg } from './SvgToImg';

const ICON_STYLES = ['background', 'branded', 'mono'] as const;

/**
 * Renders the icon of a token: one of the map loaded with `loadWeb3Icon` (`token:<SYMBOL>`, one icon at a time), any other
 * fetched from the web3icons repository by {@link GithubFallbackIcon}, or the first letter of the symbol when there is none.
 * It suspends while an icon of the map loads, so render it inside `Suspense`.
 *
 * A token that does not have the style asked for is drawn in a style it has.
 *
 * Side effect: a token outside the map sends a request to `raw.githubusercontent.com`, once per page, and up to three when
 * the repository does not have the style asked for.
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
    // Not every token has every style: OKB has only `mono`, and asking for its `background` showed a letter
    const [githubSrc, ...alternativeSrcs] = [variant, ...ICON_STYLES.filter((style) => style !== variant)].map(
      (style) => `tokens/${style}/${key}.svg`,
    );
    return (
      <GithubFallbackIcon
        githubSrc={githubSrc}
        alternativeSrcs={alternativeSrcs}
        fallbackContent={key.charAt(0)}
        alt={key}
        className={cn('novacore:w-full novacore:h-full novacore:rounded-[var(--tuwa-rounded-full)]', className)}
      />
    );
  }
  const drawnVariant = iconVariantOf(web3TokenIconVariants[getWeb3IconKey(`token:${key}`)], variant);
  // A mono icon is drawn with `currentColor`, which an `<img>` cannot inherit: it was black on every theme
  if (drawnVariant === 'mono') {
    return createElement(Icon, {
      variant: drawnVariant,
      className: cn('novacore:w-full novacore:h-full novacore:rounded-[var(--tuwa-rounded-full)]', className),
    });
  }
  return (
    <SvgToImg
      iconId={`token-${key}-${drawnVariant}`}
      className={cn('novacore:w-full novacore:h-full novacore:rounded-[var(--tuwa-rounded-full)]', className)}
    >
      {(ref) => createElement(Icon, { ref, variant: drawnVariant })}
    </SvgToImg>
  );
}
