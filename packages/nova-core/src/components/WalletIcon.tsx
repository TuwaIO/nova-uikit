import { IMPERSONATED_CONNECTOR_ID } from '@tuwaio/orbit-core';
import { wallets } from '@web3icons/common/metadata/wallets';
import { Suspense } from 'react';

import { cn, formatIconNameForGithub } from '../utils';
import { Web3IconLazy } from '../web3-icons';
import { FallbackIcon } from './FallbackIcon';
import { GithubFallbackIcon } from './GithubFallbackIcon';
import { iconVariantOf } from './iconVariant';
import { SvgToImg } from './SvgToImg';

/**
 * Props for the WalletIcon component.
 */
export interface WalletIconProps {
  /**
   * The unique identifier of the wallet.
   * Examples: 'metamask', 'phantom', 'coinbase', 'walletconnect'.
   */
  walletName: string;
  /**
   * Visual style variant for the icon. An icon without this style is drawn in a style it has, and a mono icon stays an inline
   * SVG, so that its `currentColor` follows the theme.
   * @default 'background'
   */
  variant?: 'background' | 'branded' | 'mono';
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Mapping table to normalize incoming wallet names to @web3icons IDs.
 * Used to handle discrepancies (e.g., 'walletconnect' vs 'wallet-connect').
 */
const WALLET_ID_MAP: Record<string, string> = {
  walletconnect: 'wallet-connect',
};

/**
 * Finds the icon of a wallet in the @web3icons/common metadata.
 * @param id - Normalized wallet ID (e.g., 'metamask', 'wallet-connect')
 */
function findWalletIcon(id: string) {
  return wallets.find((w) => w.id === id || w.name?.toLowerCase() === id);
}

/**
 * Internal component for the icon of the impersonated wallet (watch mode): a TUWA pixel mask on a tile of the TUWA orange
 * with scanlines, its eyes lit at the inner corners. Drawn for Nova on a 16 × 16 grid; its colors are fixed, as it is shown as an
 * image (`SvgToImg`) and reads on a light and on a dark page alike.
 */
const ImpersonatedWalletIcon = ({ className, ref }: { className?: string; ref: React.Ref<SVGSVGElement> }) => (
  <svg
    ref={ref}
    className={className}
    viewBox="0 0 16 16"
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="16" height="16" fill="#f05a14" />
    <path
      fill="#e34f0d"
      d="M0 1h16v1H0zM0 3h16v1H0zM0 5h16v1H0zM0 7h16v1H0zM0 9h16v1H0zM0 11h16v1H0zM0 13h16v1H0zM0 15h16v1H0z"
    />
    <path
      fill="#f2f1ee"
      d="M1 5h2v1h-2zM13 5h2v1h-2zM1 6h4v1h-4zM11 6h4v1h-4zM1 7h14v1h-14zM0 8h3v1h-3zM6 8h4v1h-4zM13 8h3v1h-3zM0 9h4v1h-4zM6 9h4v1h-4zM12 9h4v1h-4zM1 10h6v1h-6zM9 10h6v1h-6zM2 11h4v1h-4zM10 11h4v1h-4zM3 12h2v1h-2zM11 12h2v1h-2z"
    />
    <path fill="#101014" d="M4 8h2v2h-2zM10 8h2v2h-2z" />
    <path fill="#ffc9ad" d="M3 8h1v1h-1zM12 8h1v1h-1z" />
  </svg>
);

/**
 * Renders a wallet icon based on the wallet name.
 *
 * It handles logic for:
 * 1. Rendering a custom SVG for 'impersonatedwallet' (Watch mode).
 * 2. Normalizing IDs for common wallets (e.g. 'walletconnect' -> 'wallet-connect').
 * 3. Lazy loading other icons from @web3icons/react, one icon at a time (see `Web3IconLazy`). An icon without the asked style is
 *    drawn in a style it has, and a mono icon stays an inline SVG, so that its `currentColor` follows the theme.
 *
 * @param props - {@link WalletIconProps}
 * @returns The wallet icon or a fallback UI.
 */
export function WalletIcon({ walletName, variant = 'background', className }: WalletIconProps) {
  const componentClassName = cn(
    'novacore:w-full novacore:h-full novacore:rounded-[var(--tuwa-rounded-full)]',
    className,
  );
  const normalizedName = walletName.toLowerCase();

  // 1. Handle Custom Icon (Impersonated/Watch Mode)
  if (normalizedName === IMPERSONATED_CONNECTOR_ID) {
    return (
      <SvgToImg iconId={IMPERSONATED_CONNECTOR_ID} className={componentClassName}>
        {(ref) => <ImpersonatedWalletIcon ref={ref} />}
      </SvgToImg>
    );
  }

  // 2. Resolve Library ID (Handle overrides or use name as-is)
  const libraryId = WALLET_ID_MAP[normalizedName] ?? normalizedName;
  const githubSrc = `wallets/${variant}/${formatIconNameForGithub(libraryId)}`;

  // 3. If wallet not found in @web3icons/common metadata, skip the icon library entirely
  const icon = findWalletIcon(libraryId);
  if (!icon?.filePath) {
    return <GithubFallbackIcon githubSrc={githubSrc} className={componentClassName} />;
  }
  const drawnVariant = iconVariantOf(icon.variants, variant);

  // A mono icon is drawn with `currentColor`, which an `<img>` cannot inherit: it stays inline and follows the theme
  if (drawnVariant === 'mono') {
    return (
      <Suspense fallback={<FallbackIcon animate className={className} />}>
        <Web3IconLazy filePath={icon.filePath} variant="mono" className={componentClassName} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FallbackIcon animate className={className} />}>
      <SvgToImg iconId={`${libraryId}-${drawnVariant}`} className={componentClassName}>
        {(ref) => <Web3IconLazy ref={ref} filePath={icon.filePath} variant={drawnVariant} />}
      </SvgToImg>
    </Suspense>
  );
}
