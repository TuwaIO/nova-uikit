import { afterEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const state = vi.hoisted(() => ({ chainsList: [] as number[], chainId: 1 }));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => ({ currentChain: 'Current chain', chainSelector: 'Chain selector' }),
  useNovaConnect: () => ({
    appChains: [],
    isChainsListOpen: false,
    setIsChainsListOpen: vi.fn(),
    isChainsListOpenMobile: false,
    setIsChainsListOpenMobile: vi.fn(),
  }),
  useWalletChainsList: () => ({ chainsList: state.chainsList }),
}));

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (store: Record<string, unknown>) => unknown) =>
    selector({ activeConnection: { chainId: state.chainId, connectorType: 'evm:metamask' }, switchNetwork: vi.fn() }),
}));

import { ChainSelector } from './ChainSelector';

const SingleChain = () => null;

const renderSelector = () =>
  JSON.stringify(
    render(
      ChainSelector as never,
      {
        customization: {
          components: {
            SingleChainDisplay: SingleChain,
            DesktopSelector: () => null,
            MobileSelector: () => null,
          },
        },
      } as never,
    ),
    (_, value) => (value === SingleChain ? 'single chain display' : value),
  );

describe('ChainSelector', () => {
  afterEach(() => {
    unmount();
  });

  it('shows the chain alone in a one-chain app on that chain', () => {
    state.chainsList = [1];
    state.chainId = 1;

    expect(renderSelector()).toContain('single chain display');
  });

  // A wallet moved to another network in a one-chain app, and the button to bring it back was not there
  it('offers the way back in a one-chain app when the wallet is on another network', () => {
    state.chainsList = [1];
    state.chainId = 137;

    expect(renderSelector()).not.toContain('single chain display');
  });

  it('offers the list with several chains', () => {
    state.chainsList = [1, 137];
    state.chainId = 1;

    expect(renderSelector()).not.toContain('single chain display');
  });

  it('shows the chain alone without any chain to offer', () => {
    state.chainsList = [];
    state.chainId = 1;

    expect(renderSelector()).toContain('single chain display');
  });
});
