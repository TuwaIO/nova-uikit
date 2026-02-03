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
