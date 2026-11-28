import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
  useEffect: (effect: () => unknown) => effect(),
  // No icon of the bundled map: the token goes to its fallback
  use: () => null,
}));

import { FallbackIcon } from './FallbackIcon';
import { GithubFallbackIcon } from './GithubFallbackIcon';
import { NetworkIcon } from './NetworkIcon';
import { TokenIcon } from './TokenIcon';
import { TokenIconLazy } from './TokenIconLazy';
import { WalletIcon } from './WalletIcon';

type Element = ReactElement<Record<string, unknown> & { children?: unknown }>;

// An icon outside the bundle came from raw.githubusercontent.com on every page that showed one, which told GitHub who
// looked at what: it is asked for only when the app says so, and is a fallback drawn here otherwise
describe('the remote fallback of the icons', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks GitHub nothing unless remoteFallback is on, and shows the fallback drawn here at once', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    const icon = GithubFallbackIcon({
      githubSrc: 'tokens/branded/LOCAL.svg',
      fallbackContent: 'L',
      className: 'size-6',
    }) as Element;

    expect(fetch).not.toHaveBeenCalled();
    expect(icon.type).toBe(FallbackIcon);
    expect(icon.props).toMatchObject({ content: 'L', className: 'size-6' });
    expect(icon.props.animate).toBeUndefined();
  });

  it('asks GitHub with remoteFallback', () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => '<svg></svg>' });
    vi.stubGlobal('fetch', fetch);

    GithubFallbackIcon({ githubSrc: 'tokens/branded/REMOTE.svg', remoteFallback: true });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toMatch(/^https:\/\/raw\.githubusercontent\.com\/.+\/tokens\/branded\/REMOTE\.svg$/);
  });

  it.each([
    ['NetworkIcon', (remoteFallback?: boolean) => NetworkIcon({ chainId: 'nonetwork:1', remoteFallback })],
    ['WalletIcon', (remoteFallback?: boolean) => WalletIcon({ walletName: 'No Such Wallet', remoteFallback })],
    ['TokenIconLazy', (remoteFallback?: boolean) => TokenIconLazy({ symbol: 'ZZZQ', remoteFallback })],
  ])('%s passes remoteFallback on, off by default', (_, draw) => {
    for (const [asked, passed] of [
      [undefined, false],
      [false, false],
      [true, true],
    ] as const) {
      const icon = draw(asked) as Element;
      expect(icon.type).toBe(GithubFallbackIcon);
      expect(Boolean(icon.props.remoteFallback)).toBe(passed);
    }
  });

  it('TokenIcon hands remoteFallback to the icon it loads', () => {
    const lazy = (TokenIcon({ symbol: 'ZZZQ', remoteFallback: true }) as Element).props.children as Element;

    expect(lazy.type).toBe(TokenIconLazy);
    expect(lazy.props.remoteFallback).toBe(true);
  });
});
