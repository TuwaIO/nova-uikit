import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const play = vi.fn();
vi.mock('@tuwaio/nova-core', () => ({ useNovaSounds: () => play }));

type Store = {
  activeConnection?: { connectorType: string; chainId: number };
  connections: Record<string, unknown>;
  connectionError?: string;
  switchNetworkError?: string;
  isAutoConnectFinished?: boolean;
};
let store: Store;
vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Store) => unknown) => selector(store),
}));

import { NovaConnectSounds } from './NovaConnectSounds';

const metamask = { connectorType: 'evm:metamask', chainId: 1 };
const rabby = { connectorType: 'evm:rabby', chainId: 1 };
const step = (next: Partial<Store>) => {
  store = { ...store, ...next };
  render(NovaConnectSounds, {});
};

describe('NovaConnectSounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = { connections: {}, isAutoConnectFinished: true };
    render(NovaConnectSounds, {});
  });
  afterEach(unmount);

  it('stays silent until something changes', () => {
    render(NovaConnectSounds, {});
    expect(play).not.toHaveBeenCalled();
  });

  it('plays a wallet connected, and disconnected', () => {
    step({ activeConnection: metamask, connections: { metamask } });
    expect(play).toHaveBeenLastCalledWith('connect');

    step({ activeConnection: undefined, connections: {} });
    expect(play).toHaveBeenLastCalledWith('disconnect');
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('counts a disconnect that another wallet takes over from', () => {
    step({ activeConnection: rabby, connections: { metamask, rabby } });
    play.mockClear();

    step({ activeConnection: metamask, connections: { metamask } });
    expect(play).toHaveBeenCalledExactlyOnceWith('disconnect');
  });

  it('plays a change of network, and of the active wallet between connected ones', () => {
    step({ activeConnection: metamask, connections: { metamask, rabby } });
    play.mockClear();

    step({ activeConnection: { ...metamask, chainId: 10 } });
    expect(play).toHaveBeenCalledExactlyOnceWith('networkSwitch');

    play.mockClear();
    step({ activeConnection: rabby });
    expect(play).toHaveBeenCalledExactlyOnceWith('networkSwitch');
  });

  it('plays a new error, and not the same one again', () => {
    step({ connectionError: 'Rejected' });
    expect(play).toHaveBeenCalledExactlyOnceWith('error');

    render(NovaConnectSounds, {});
    expect(play).toHaveBeenCalledOnce();

    step({ connectionError: undefined, switchNetworkError: 'No such chain' });
    expect(play).toHaveBeenCalledTimes(2);
  });

  // Nobody asked for anything on a page load
  it('makes no sound for a wallet restored after a page load', () => {
    unmount();
    store = { connections: {}, isAutoConnectFinished: false };
    render(NovaConnectSounds, {});

    step({ activeConnection: metamask, connections: { metamask } });
    step({ isAutoConnectFinished: true });

    expect(play).not.toHaveBeenCalled();

    step({ activeConnection: undefined, connections: {} });
    expect(play).toHaveBeenCalledExactlyOnceWith('disconnect');
  });
});
