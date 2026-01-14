import { lazy, Suspense } from 'react';

import { cn } from '../utils';
import { FallbackIcon } from './FallbackIcon';

/**
 * Lazily loaded WalletIcon component from @web3icons/react.
 * Uses dynamic import to reduce the initial bundle size.
 */
const WalletIconLazy = lazy(() =>
  import('@web3icons/react/dynamic').then((mod) => ({
    default: mod.WalletIcon,
  })),
);

/**
 * Props for the WalletIcon component.
 */
interface WalletIconProps {
  /**
   * The unique identifier of the wallet.
   * Examples: 'metamask', 'phantom', 'coinbase', 'walletconnect'.
   */
  walletName: string;
  /**
   * Visual style variant for the icon.
   * @default 'background'
   */
  variant?: 'background' | 'branded' | 'mono';
  /** Additional CSS class names to apply to the component. */
  className?: string;
}

/**
 * Renders a wallet icon based on the wallet ID.
 *
 * It handles logic for:
 * 1. Lazy loading the heavy icon library.
 * 2. Displaying a standardized fallback UI while loading or if the icon is missing.
 *
 * @param props - {@link WalletIconProps}
 * @returns The wallet icon or a fallback UI.
 */
export function WalletIcon({ walletName, variant = 'background', className }: WalletIconProps) {
  const componentClassName = cn('novacore:w-full novacore:h-full novacore:rounded-full', className);

  return (
    <Suspense fallback={<FallbackIcon animate className={className} />}>
      <WalletIconLazy
        id={walletName}
        variant={variant}
        className={componentClassName}
        fallback={<FallbackIcon content="?" className={className} />}
      />
    </Suspense>
  );
}
