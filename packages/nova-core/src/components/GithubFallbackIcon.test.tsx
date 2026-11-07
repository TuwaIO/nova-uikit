import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
  useEffect: (effect: () => unknown) => effect(),
}));

import { GithubFallbackIcon } from './GithubFallbackIcon';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('GithubFallbackIcon', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // A table of one token asked GitHub once per row
  it('asks for an icon once, however many draw it', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => '<svg></svg>' });
    vi.stubGlobal('fetch', fetch);

    GithubFallbackIcon({ githubSrc: 'tokens/branded/ONE.svg' });
    GithubFallbackIcon({ githubSrc: 'tokens/branded/ONE.svg' });
    await settle();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // Every mount asked again for what had failed
  it('does not ask again for an icon that failed', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', fetch);

    GithubFallbackIcon({ githubSrc: 'tokens/branded/MISSING.svg' });
    await settle();
    GithubFallbackIcon({ githubSrc: 'tokens/branded/MISSING.svg' });
    await settle();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('asks nothing for an empty name', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    GithubFallbackIcon({ githubSrc: 'wallets/branded/.svg' });

    expect(fetch).not.toHaveBeenCalled();
  });

  // OKB has only `mono`: asking for its `background` showed a letter
  it('tries the other styles when the repository does not have the one asked for', async () => {
    const fetch = vi.fn(async (url: string) =>
      url.includes('/mono/')
        ? { ok: true, status: 200, text: async () => '<svg></svg>' }
        : { ok: false, status: 404, text: async () => '' },
    );
    vi.stubGlobal('fetch', fetch);

    GithubFallbackIcon({
      githubSrc: 'tokens/background/OKB.svg',
      alternativeSrcs: ['tokens/branded/OKB.svg', 'tokens/mono/OKB.svg'],
    });
    await settle();

    expect(fetch.mock.calls.map(([url]) => url.split('/raw-svgs/')[1])).toEqual([
      'tokens/background/OKB.svg',
      'tokens/branded/OKB.svg',
      'tokens/mono/OKB.svg',
    ]);
  });

  it('stops at a failure that says nothing of the file', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetch);

    GithubFallbackIcon({ githubSrc: 'tokens/background/DOWN.svg', alternativeSrcs: ['tokens/mono/DOWN.svg'] });
    await settle();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
