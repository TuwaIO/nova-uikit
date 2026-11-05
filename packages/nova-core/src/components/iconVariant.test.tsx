import { networks } from '@web3icons/common/metadata/networks';
import { wallets } from '@web3icons/common/metadata/wallets';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { Web3IconLazy } from '../web3-icons';
import { iconVariantOf } from './iconVariant';
import { NetworkIcon } from './NetworkIcon';
import { SvgToImg } from './SvgToImg';
import { WalletIcon } from './WalletIcon';

type Props = { children?: ReactElement | ((ref: () => void) => ReactElement); filePath?: string; variant?: string };

/** The element inside `Suspense`: the icon itself or the conversion to an image. */
const insideSuspense = (element: ReactElement) => (element.props as Props).children as ReactElement;

/** The style of a drawn icon, also when it goes through the conversion to an image. */
const drawnVariant = (element: ReactElement) => {
  const inside = insideSuspense(element);
  const icon =
    inside.type === SvgToImg
      ? ((inside.props as Props).children as (ref: () => void) => ReactElement)(() => {})
      : inside;
  return (icon.props as Props).variant;
};

describe('iconVariantOf', () => {
  it('keeps a style the icon has', () => {
    expect(iconVariantOf(['branded', 'mono', 'background'], 'mono')).toBe('mono');
  });

  it('takes a style the icon has when it lacks the asked one, as otherwise nothing is drawn', () => {
    expect(iconVariantOf(['branded', 'background'], 'mono')).toBe('background');
    expect(iconVariantOf(['branded'], 'mono')).toBe('branded');
    expect(iconVariantOf(['mono'], 'background')).toBe('mono');
  });

  it('keeps the asked style without metadata', () => {
    expect(iconVariantOf(undefined, 'mono')).toBe('mono');
  });
});

describe('icons in the mono style', () => {
  it('MetaMask, which has no mono icon, is still drawn', () => {
    expect(wallets.find((wallet) => wallet.id === 'metamask')?.variants).not.toContain('mono');
    expect(drawnVariant(WalletIcon({ walletName: 'metamask', variant: 'mono' }))).toBe('background');
  });

  it('a mono wallet icon is not turned into an image, where `currentColor` would be black in every theme', () => {
    const id = wallets.find((wallet) => (wallet.variants as string[]).includes('mono'))!.id;
    const inside = insideSuspense(WalletIcon({ walletName: id, variant: 'mono' }));
    expect(inside.type).toBe(Web3IconLazy);
    expect((inside.props as Props).variant).toBe('mono');
  });

  it('a mono network icon is not turned into an image either', () => {
    expect(networks.find((network) => network.id === 'ethereum')?.variants).toContain('mono');
    const inside = insideSuspense(NetworkIcon({ chainId: 1, variant: 'mono' }));
    expect(inside.type).toBe(Web3IconLazy);
  });

  it('other styles still go through the image, which keeps the ids of the SVGs apart', () => {
    expect(insideSuspense(WalletIcon({ walletName: 'metamask', variant: 'branded' })).type).toBe(SvgToImg);
    expect(insideSuspense(NetworkIcon({ chainId: 1 })).type).toBe(SvgToImg);
  });
});
