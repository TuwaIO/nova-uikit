import { lazy, Suspense } from 'react';

import { cn, formatIconNameForGithub, getChainName, isSolanaDev } from '../utils';
import { FallbackIcon } from './FallbackIcon';
import { GithubFallbackIcon } from './GithubFallbackIcon';
import { SvgToImg } from './SvgToImg';

const NetworkIconLazy = lazy(() =>
  import('@web3icons/react/dynamic').then((mod) => ({
    default: mod.NetworkIcon,
  })),
);

/**
 * Props of {@link NetworkIcon}.
 */
export interface NetworkIconProps {
  /**
   * The network: an EVM chain ID (`1`), or a string whose part before `:` is a network id of `@web3icons/common`
   * (`'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'`, `'solana:devnet'`, `'base'`). Solana devnet and testnet get the testnet
   * color under their genesis-hash chain IDs and their names.
   */
  chainId: number | string;
  /** Icon style of `@web3icons/react`. Defaults to `'background'`. */
  variant?: 'background' | 'branded' | 'mono';
  /** Classes merged with the default classes (full size of the parent, rounded). */
  className?: string;
}

/** CSS variable for testnet icon styling */
const TESTNET_FILL = 'var(--tuwa-testnet-icons)';

/**
 * The icon of a network. Networks listed in `@web3icons/common` are drawn with `@web3icons/react`, loaded on demand
 * (a pulsing {@link FallbackIcon} is shown meanwhile) and rendered through {@link SvgToImg}. An unknown numeric chain
 * shows a `?` placeholder; an unknown string id is fetched from the web3icons repository on GitHub
 * ({@link GithubFallbackIcon}). Testnets and the Solana devnet and testnet are recolored with `--tuwa-testnet-icons`.
 *
 * Side effect: a GitHub request (`raw.githubusercontent.com`) for icons that `@web3icons/common` does not list.
 *
 * @param props - See {@link NetworkIconProps}.
 * @returns The icon element.
 */
export function NetworkIcon({ chainId, variant = 'background', className }: NetworkIconProps) {
  const chainInfo = getChainName(chainId);
  const isStringId = typeof chainId === 'string';

  // Normalize ID for icon library
  const networkId = isStringId ? chainId.split(':')[0].toLowerCase() : chainId;

  // Determine if testnet styling should be applied
  const isTestnet = (isStringId && isSolanaDev(chainId)) || chainInfo.name.toLowerCase().includes('testnet');
  const testnetFill = isTestnet ? TESTNET_FILL : undefined;

  const componentClassName = cn('novacore:w-full novacore:h-full novacore:rounded-full', className);

  // Resolve icon ID for the library
  const iconId = typeof networkId === 'string' ? networkId : chainInfo.filePath;
  const githubSrc = `networks/${variant}/${formatIconNameForGithub(iconId)}`;

  // If network not found in @web3icons/common metadata, skip NetworkIconLazy entirely
  // This avoids the async flash from the dynamic component for icons we know don't exist
  const isUnknownNetwork = chainInfo.name === 'Unknown';

  if (isUnknownNetwork) {
    // For numeric chainId we can't resolve the icon name, show placeholder
    // For string chainId (e.g., "base"), try GitHub fallback as the name might match
    if (typeof chainId === 'number') {
      return <FallbackIcon content="?" className={className} />;
    }
    return <GithubFallbackIcon githubSrc={githubSrc} className={componentClassName} firstPathFill={testnetFill} />;
  }

  return (
    <Suspense fallback={<FallbackIcon animate className={className} />}>
      <SvgToImg iconId={`${chainId}-${variant}`} className={componentClassName} firstPathFill={testnetFill}>
        {(ref) =>
          typeof networkId === 'string' ? (
            <NetworkIconLazy ref={ref} id={networkId} variant={variant} />
          ) : (
            <NetworkIconLazy ref={ref} chainId={networkId} variant={variant} />
          )
        }
      </SvgToImg>
    </Suspense>
  );
}
