import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { recolorTestnetPaths, type SvgPathLike } from '../utils/svgUtils';
import { loadWeb3Icon } from '../utils/web3IconLoader';
import { NetworkIcon } from './NetworkIcon';
import { SvgToImg } from './SvgToImg';

type Element = ReactElement<Record<string, unknown> & { children?: unknown }>;

/** The SvgToImg element NetworkIcon renders (inside Suspense), and the icon it draws. */
function iconOf(chainId: number | string) {
  const tree = NetworkIcon({ chainId }) as Element;
  const image = (tree.props.children as Element | undefined) ?? tree;
  expect(image.type).toBe(SvgToImg);
  const draw = image.props.children as (ref: () => void) => ReactNode;
  const icon = draw(() => undefined);
  expect(isValidElement(icon)).toBe(true);
  return { fill: image.props.firstPathFill, filePath: (icon as Element).props.filePath as string };
}

// The networks of the checkout presets and of the Cosmos playground: each draws the icon of its mainnet, recolored
describe('NetworkIcon of a testnet', () => {
  it.each([
    ['Base Sepolia', 84532, 'network:base'],
    ['Sepolia', 11155111, 'network:ethereum'],
    ['Polygon Amoy', 80002, 'network:polygon'],
    ['Arbitrum Sepolia', 421614, 'network:arbitrum-one'],
    ['OP Sepolia', 11155420, 'network:optimism'],
    ['Solana Devnet', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', 'network:solana'],
    ['Solana Testnet', 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z', 'network:solana'],
    ['Solana Devnet by name', 'solana:devnet', 'network:solana'],
  ])('%s draws the %s icon of its mainnet in the testnet colors', async (_name, chainId, filePath) => {
    const icon = iconOf(chainId);
    expect(icon).toEqual({ fill: 'var(--tuwa-testnet-icons)', filePath });
    expect(await loadWeb3Icon(filePath)).not.toBeNull();
  });

  it.each([
    [8453, 'network:base'],
    [1, 'network:ethereum'],
    ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'network:solana'],
  ])('a mainnet (%s) keeps its colors', (chainId, filePath) => {
    expect(iconOf(chainId)).toEqual({ fill: undefined, filePath });
  });
});

/** A `<path>` with attributes, as the DOM gives it. */
function path(fill?: string): SvgPathLike & { fill: string | null } {
  const item = {
    fill: fill ?? null,
    getAttribute: (name: string) => (name === 'fill' ? item.fill : null),
    setAttribute: (name: string, value: string) => {
      if (name === 'fill') item.fill = value;
    },
  };
  return item;
}

// Showcase review, 2026-10-29: Base Sepolia showed an empty square. The Base icon is a white square on a blue
// background; recoloring only the background left a white square on grey, which reads as an empty checkbox
describe('recolorTestnetPaths', () => {
  it('gives the background the testnet color and the white mark the color the background had', () => {
    const base = [path('#00F'), path('#fff')];
    recolorTestnetPaths(base, '#c4bfb8');
    expect(base.map((item) => item.fill)).toEqual(['#c4bfb8', '#00F']);

    const solana = [path('url(#solana__b)'), path('#FFF'), path('white'), path('#ffffff')];
    recolorTestnetPaths(solana, '#c4bfb8');
    expect(solana.map((item) => item.fill)).toEqual([
      '#c4bfb8',
      'url(#solana__b)',
      'url(#solana__b)',
      'url(#solana__b)',
    ]);
  });

  it('keeps a mark that has colors of its own (Ethereum on Sepolia)', () => {
    const ethereum = [path('#000'), path('#8FFCF3'), path('#CABCF8')];
    recolorTestnetPaths(ethereum, '#c4bfb8');
    expect(ethereum.map((item) => item.fill)).toEqual(['#c4bfb8', '#8FFCF3', '#CABCF8']);
  });

  it('keeps a white mark white when the background had no fill to give', () => {
    const icon = [path(), path('#fff')];
    recolorTestnetPaths(icon, '#c4bfb8');
    expect(icon.map((item) => item.fill)).toEqual(['#c4bfb8', '#fff']);
    expect(() => recolorTestnetPaths([], '#c4bfb8')).not.toThrow();
  });
});
