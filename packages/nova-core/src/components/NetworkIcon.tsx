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

interface NetworkIconProps {
  chainId: number | string;
  variant?: 'background' | 'branded' | 'mono';
  className?: string;
}

/** CSS variable for testnet icon styling */
const TESTNET_FILL = 'var(--tuwa-testnet-icons)';

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

  return (
    <Suspense fallback={<FallbackIcon animate className={className} />}>
      <SvgToImg iconId={`${chainId}-${variant}`} className={componentClassName} firstPathFill={testnetFill}>
        {(ref) =>
          typeof networkId === 'string' ? (
            <NetworkIconLazy
              ref={ref}
              id={networkId}
              variant={variant}
              fallback={
                <GithubFallbackIcon githubSrc={githubSrc} className={componentClassName} firstPathFill={testnetFill} />
              }
            />
          ) : (
            <NetworkIconLazy
              ref={ref}
              chainId={networkId}
              variant={variant}
              fallback={
                <GithubFallbackIcon githubSrc={githubSrc} className={componentClassName} firstPathFill={testnetFill} />
              }
            />
          )
        }
      </SvgToImg>
    </Suspense>
  );
}
