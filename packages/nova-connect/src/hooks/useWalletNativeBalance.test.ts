import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return {
    ...(await importOriginal<typeof import('react')>()),
    ...hooks,
    useContext: () => satelliteStore.current,
  };
});

// One Satellite store per test, as the callers of a page share one
const satelliteStore = vi.hoisted(() => ({ current: {} as object }));
const storeState = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock('../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState.value),
}));

import { useWalletNativeBalance } from './useWalletNativeBalance';
import { balanceCacheOf } from './walletBalanceCache';

const connectTo = (getBalance: unknown, connection: Record<string, unknown> = {}) => {
  storeState.value = {
    activeConnection: { address: '0x1', chainId: 1, connectorType: `${OrbitAdapter.EVM}:metamask`, ...connection },
    getAdapter: () => ({ getBalance }),
  };
};
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('useWalletNativeBalance', () => {
  beforeEach(() => {
    satelliteStore.current = {};
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  it('knows nothing without a wallet', () => {
    storeState.value = { activeConnection: null, getAdapter: () => undefined };
    expect(render(useWalletNativeBalance, undefined)).toMatchObject({
      balance: null,
      isLoading: false,
      isError: false,
    });
  });

  it('knows nothing when the adapter has no getBalance', () => {
    connectTo(undefined);
    expect(render(useWalletNativeBalance, undefined)).toMatchObject({
      balance: null,
      isLoading: false,
      isError: false,
    });
  });

  it('asks the adapter once and gives the balance', async () => {
    const getBalance = vi.fn().mockResolvedValue({ value: '2.5', symbol: 'ETH' });
    connectTo(getBalance);

    render(useWalletNativeBalance, undefined);
    expect(getBalance).toHaveBeenCalledWith('0x1', 1);
    await settle();

    expect(render(useWalletNativeBalance, undefined)).toMatchObject({
      balance: { value: '2.5', symbol: 'ETH' },
      isLoading: false,
    });
    expect(getBalance).toHaveBeenCalledTimes(1);
  });

  // An RPC down showed `0.000` on the button of a wallet holding 5 ETH
  it('tells a balance it could not read, and does not ask again by itself', async () => {
    const getBalance = vi.fn().mockRejectedValue(new Error('429'));
    connectTo(getBalance);

    render(useWalletNativeBalance, undefined);
    await settle();
    const data = render(useWalletNativeBalance, undefined);

    expect(data).toMatchObject({ balance: null, isLoading: false, isError: true });
    expect(getBalance).toHaveBeenCalledTimes(1);
  });

  // It was cached and read as no entry, which asked the node again on every render
  it('takes a getBalance that resolves to nothing for a failure', async () => {
    const getBalance = vi.fn().mockResolvedValue(undefined);
    connectTo(getBalance);

    render(useWalletNativeBalance, undefined);
    await settle();
    render(useWalletNativeBalance, undefined);
    await settle();
    render(useWalletNativeBalance, undefined);

    expect(getBalance).toHaveBeenCalledTimes(1);
  });

  it('asks again with refetch, keeping the balance on screen meanwhile', async () => {
    const getBalance = vi
      .fn()
      .mockResolvedValueOnce({ value: '2.5', symbol: 'ETH' })
      .mockResolvedValueOnce({ value: '1.5', symbol: 'ETH' });
    connectTo(getBalance);

    render(useWalletNativeBalance, undefined);
    await settle();
    (render(useWalletNativeBalance, undefined) as ReturnType<typeof useWalletNativeBalance>).refetch();
    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: { value: '2.5' }, isLoading: true });

    await settle();
    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: { value: '1.5' }, isLoading: false });
  });

  it('clears the balance when a refresh fails', async () => {
    const getBalance = vi
      .fn()
      .mockResolvedValueOnce({ value: '2.5', symbol: 'ETH' })
      .mockRejectedValueOnce(new Error('503'));
    connectTo(getBalance);

    render(useWalletNativeBalance, undefined);
    await settle();
    (render(useWalletNativeBalance, undefined) as ReturnType<typeof useWalletNativeBalance>).refetch();
    await settle();

    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: null, isError: true });
    expect(getBalance).toHaveBeenCalledTimes(2);
  });

  it('sends nothing while it is not enabled', () => {
    const getBalance = vi.fn().mockResolvedValue({ value: '2.5', symbol: 'ETH' });
    connectTo(getBalance);

    render(useWalletNativeBalance, { enabled: false });

    expect(getBalance).not.toHaveBeenCalled();
  });

  // The button with `withBalance` off still tells the window, which reads the balance when it opens, that a transaction ended
  it('only forgets the balance on refetch while it is not enabled', async () => {
    const getBalance = vi.fn().mockResolvedValue({ value: '2.5', symbol: 'ETH' });
    connectTo(getBalance);
    const cache = balanceCacheOf(satelliteStore.current);
    cache.load('0x1-1', getBalance);
    await settle();
    getBalance.mockClear();

    (render(useWalletNativeBalance, { enabled: false }) as ReturnType<typeof useWalletNativeBalance>).refetch();

    expect(getBalance).not.toHaveBeenCalled();
    expect(cache.read('0x1-1').balance).toBeNull();
  });

  // The button kept `1.500` after paying 1 ETH of it, and the refresh in the window did not reach it
  it('shares the balance and the request between the callers of a store', async () => {
    const getBalance = vi
      .fn()
      .mockResolvedValueOnce({ value: '1.5', symbol: 'ETH' })
      .mockResolvedValueOnce({ value: '0.5', symbol: 'ETH' });
    connectTo(getBalance);
    const cache = balanceCacheOf(satelliteStore.current);

    render(useWalletNativeBalance, undefined);
    cache.load('0x1-1', getBalance);
    await settle();
    expect(getBalance).toHaveBeenCalledTimes(1);

    cache.load('0x1-1', getBalance, true);
    await settle();

    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: { value: '0.5' } });
  });

  it('ignores the answer of an older request', async () => {
    let answerOld: (value: unknown) => void = () => undefined;
    const old = new Promise((resolve) => {
      answerOld = resolve;
    });
    const getBalance = vi.fn().mockReturnValueOnce(old).mockResolvedValueOnce({ value: '0.5', symbol: 'ETH' });
    connectTo(getBalance);

    (render(useWalletNativeBalance, undefined) as ReturnType<typeof useWalletNativeBalance>).refetch();
    await settle();
    answerOld({ value: '1.5', symbol: 'ETH' });
    await settle();

    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: { value: '0.5' } });
  });

  it('keeps a balance of each address and chain', async () => {
    const getBalance = vi
      .fn()
      .mockResolvedValueOnce({ value: '2.5', symbol: 'ETH' })
      .mockResolvedValueOnce({ value: '9', symbol: 'POL' });
    connectTo(getBalance);
    render(useWalletNativeBalance, undefined);
    await settle();
    render(useWalletNativeBalance, undefined);

    connectTo(getBalance, { chainId: 137 });
    render(useWalletNativeBalance, undefined);
    await settle();
    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: { value: '9' } });

    connectTo(getBalance);
    expect(render(useWalletNativeBalance, undefined)).toMatchObject({ balance: { value: '2.5' } });
    expect(getBalance).toHaveBeenCalledTimes(2);
  });
});
