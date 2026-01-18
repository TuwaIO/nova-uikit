import { lazy, Suspense } from 'react';

import { cn, getChainName } from '../utils';
import { isSolanaDev } from '../utils/isSolanaDev';
import { FallbackIcon } from './FallbackIcon';

/**
 * Lazily loaded NetworkIcon component from @web3icons/react.
 * Uses dynamic import to reduce the initial bundle size.
 */
const NetworkIconLazy = lazy(() =>
  import('@web3icons/react/dynamic').then((mod) => ({
    default: mod.NetworkIcon,
  })),
);

/**
 * Props for the NetworkIcon component.
 */
interface NetworkIconProps {
  /**
   * Chain identifier.
   * - `number`: For EVM networks (e.g., 1, 137).
   * - `string`: For non-EVM networks (e.g., "solana:mainnet", "solana:devnet").
   */
  chainId: number | string;
  /**
   * Visual style variant for the icon.
   * @default 'background'
   */
  variant?: 'background' | 'branded' | 'mono';
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Renders a network icon based on the chain ID.
 *
 * It handles logic for:
 * 1. Lazy loading the heavy icon library.
 * 2. Normalizing string IDs (e.g., converts "solana:devnet" -> "solana").
 * 3. Applying specific styling for Testnets/Devnets (e.g., muted colors for Solana Devnet).
 *
 * @param props - {@link NetworkIconProps}
 * @returns The network icon or a fallback UI.
 */
export function NetworkIcon({ chainId, variant = 'background', className }: NetworkIconProps) {
  const chainName = getChainName(chainId);
  const isStringId = typeof chainId === 'string';

  // Normalize ID: If "solana:devnet", we need "solana" for the icon library.
  const networkId = isStringId ? chainId.split(':')[0].toLowerCase() : chainId;

  // Visual logic: Apply muted fill if it's a known Solana dev environment.
  const isSolanaTestnet = isStringId && isSolanaDev(chainId);

  const componentClassName = cn('novacore:w-full novacore:h-full novacore:rounded-full', className, {
    'novacore:[&_path]:first-of-type:fill-[var(--tuwa-testnet-icons)]':
      isSolanaTestnet || chainName.toLowerCase().includes('testnet'),
  });

  return (
    <Suspense fallback={<FallbackIcon animate className={className} />}>
      {typeof networkId === 'string' ? (
        <NetworkIconLazy
          id={networkId}
          variant={variant}
          className={componentClassName}
          fallback={<FallbackIcon content="?" className={className} />}
        />
      ) : (
        <NetworkIconLazy
          chainId={networkId}
          variant={variant}
          className={componentClassName}
          fallback={<FallbackIcon content="?" className={className} />}
        />
      )}
    </Suspense>
  );
}
