import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { cleanups, playNovaSound } = vi.hoisted(() => ({ cleanups: [] as Array<() => void>, playNovaSound: vi.fn() }));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useMemo: (factory: () => unknown) => factory(),
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  },
}));

vi.mock('../utils/sounds', () => ({ playNovaSound }));

import { NovaSoundsProvider } from './NovaSoundsProvider';

type Listener = (event: { target: unknown }) => void;

const linkClick = (selector: string | null) => ({
  target: { closest: (asked: string) => (asked === 'a[data-nova-external-link]' ? selector : null) },
});

describe('NovaSoundsProvider', () => {
  let listeners: Listener[];

  beforeEach(() => {
    vi.clearAllMocks();
    listeners = [];
    cleanups.length = 0;
    vi.stubGlobal('document', {
      addEventListener: (_type: string, listener: Listener) => listeners.push(listener),
      removeEventListener: (_type: string, listener: Listener) => {
        listeners = listeners.filter((other) => other !== listener);
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  // A link to another site flies away
  it('plays a click on a link of Nova that opens a new tab', () => {
    NovaSoundsProvider({ sounds: true, children: null });

    listeners[0](linkClick('the link'));
    expect(playNovaSound).toHaveBeenCalledExactlyOnceWith('externalLink', true);
  });

  it('leaves the links of the app alone', () => {
    NovaSoundsProvider({ sounds: true, children: null });

    listeners[0](linkClick(null));
    expect(playNovaSound).not.toHaveBeenCalled();
  });

  it('listens to nothing with sounds off, and stops when it goes', () => {
    NovaSoundsProvider({ children: null });
    expect(listeners).toHaveLength(0);

    NovaSoundsProvider({ sounds: { volume: 0.3 }, children: null });
    expect(listeners).toHaveLength(1);
    cleanups.forEach((cleanup) => cleanup());
    expect(listeners).toHaveLength(0);
  });
});
