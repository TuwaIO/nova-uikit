import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { IMPERSONATED_CONNECTOR_ID } from '@tuwaio/orbit-core';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { WalletIcon } from './WalletIcon';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// The icon of the impersonated wallet is redrawn in the TUWA pixel style, a new picture of Nova's own
// (a mask on a tile of the TUWA blue), and the note that it came from BGD Labs is gone with the old picture
describe('the icon of the impersonated wallet', () => {
  const svgOf = () => {
    const image = WalletIcon({ walletName: IMPERSONATED_CONNECTOR_ID }) as unknown as Element;
    const icon = (image.props.children as (ref: () => void) => Element)(() => {});
    return (icon.type as (props: Record<string, unknown>) => ReactElement)(icon.props) as unknown as Element;
  };

  it('is the TUWA pixel mask on a 16 x 16 grid, on the TUWA blue', () => {
    const svg = svgOf();
    expect(svg.props.viewBox).toBe('0 0 16 16');
    expect(svg.props.shapeRendering).toBe('crispEdges');
    const [tile] = svg.props.children as Element[];
    expect(tile.props.fill).toBe('#0052ff');
  });

  it('credits no one else: the NOTICE names no source for it', () => {
    const notice = readFileSync(join(__dirname, '../../NOTICE'), 'utf8');
    expect(notice).not.toMatch(/bgd|web3-icons|ImpersonatedWalletIcon/i);
    expect(readFileSync(join(__dirname, 'WalletIcon.tsx'), 'utf8')).not.toMatch(/bgd/i);
  });
});
