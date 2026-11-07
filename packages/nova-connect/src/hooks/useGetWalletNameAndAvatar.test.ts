import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const storeState = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState.value),
}));

import { useGetWalletNameAndAvatar } from './useGetWalletNameAndAvatar';

const connectWith = (adapter: object) => {
  storeState.value = {
    activeConnection: { address: '0x1234567890123456789012345678901234567890', connectorType: `${OrbitAdapter.EVM}:x` },
    getAdapter: () => adapter,
  };
};
const settle = async () => {
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
};

describe('useGetWalletNameAndAvatar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    unmount();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // The button, the window and the list of wallets each looked the name up, on every page load
  it('looks a wallet up once, whoever asks', async () => {
    const adapter = { getName: vi.fn().mockResolvedValue('alice.eth'), getAvatar: vi.fn().mockResolvedValue('img') };
    connectWith(adapter);

    render(useGetWalletNameAndAvatar, {});
    await settle();
    unmount();
    const second = render(useGetWalletNameAndAvatar, {});
    await settle();

    expect(adapter.getName).toHaveBeenCalledTimes(1);
    expect(adapter.getAvatar).toHaveBeenCalledTimes(1);
    expect(second).toBeDefined();
  });

  it('does not keep a failed lookup', async () => {
    const adapter = { getName: vi.fn().mockRejectedValueOnce(new Error('503')).mockResolvedValue('alice.eth') };
    connectWith(adapter);

    render(useGetWalletNameAndAvatar, {});
    await settle();
    unmount();
    render(useGetWalletNameAndAvatar, {});
    await settle();

    expect(adapter.getName).toHaveBeenCalledTimes(2);
  });

  it('keeps the name when only the avatar fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = {
      getName: vi.fn().mockResolvedValue('alice.eth'),
      getAvatar: vi.fn().mockRejectedValue(new Error('x')),
    };
    connectWith(adapter);

    render(useGetWalletNameAndAvatar, {});
    await settle();
    await settle();

    expect(adapter.getName).toHaveBeenCalledTimes(1);
    expect(adapter.getAvatar).toHaveBeenCalledTimes(1);
  });

  // A name service that stays down cost 1200 lookups an hour for each hook
  it('stops retrying after a few attempts, each later than the last', async () => {
    const adapter = { getName: vi.fn().mockRejectedValue(new Error('503')) };
    connectWith(adapter);

    render(useGetWalletNameAndAvatar, { autoRetry: true, retryDelay: 1000 });
    await settle();
    expect(adapter.getName).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(999);
    expect(adapter.getName).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(adapter.getName).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2000);
    expect(adapter.getName).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(3_600_000);
    expect(adapter.getName).toHaveBeenCalledTimes(6);
  });
});
