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
});
