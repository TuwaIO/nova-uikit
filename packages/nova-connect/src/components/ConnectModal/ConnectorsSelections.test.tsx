import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const { detectSafeApp } = vi.hoisted(() => ({ detectSafeApp: vi.fn(async () => true) }));

vi.mock('@tuwaio/orbit-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/orbit-core')>()),
  // An HTTPS iframe
  isInSecureIframe: true,
  detectSafeApp,
}));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
  useNovaConnect: () => ({ withImpersonated: false }),
}));

let getSafeConnectorChainId: () => Promise<number | undefined>;

// A store function, stable between renders as in Zustand
const getAdapter = () => ({ key: 'evm', getSafeConnectorChainId });

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector({ getAdapter }),
}));

import { ConnectorsSelections, type ConnectorsSelectionsProps } from './ConnectorsSelections';

const connectors = [
  { name: 'Safe', adapters: [OrbitAdapter.EVM], connectors: [] },
  { name: 'Rabby Wallet', adapters: [OrbitAdapter.EVM], connectors: [] },
] as unknown as ConnectorsSelectionsProps['connectors'];

// Names of the installed wallets listed by the component
const renderInstalled = (): string[] => {
  const element = render(
    (ConnectorsSelections as unknown as { type: { render: (p: ConnectorsSelectionsProps) => unknown } }).type.render,
    {
      selectedAdapter: OrbitAdapter.EVM,
      connectors,
      onClick: vi.fn(),
      setIsConnected: vi.fn(),
      setIsOpen: vi.fn(),
      setContentType: vi.fn(),
    },
  ) as { props: { selectionsData: { connectorGroups: { installed: { name: string }[] } } } };
  return element.props.selectionsData.connectorGroups.installed.map((group) => group.name);
};

describe('ConnectorsSelections', () => {
  afterEach(() => unmount());

  it('lists the Safe connector when the EVM adapter of Satellite detects Safe{Wallet}', async () => {
    getSafeConnectorChainId = vi.fn(async () => 1);

    expect(renderInstalled()).toEqual(['Rabby Wallet']);
    await Promise.resolve();
    expect(renderInstalled()).toEqual(['Safe', 'Rabby Wallet']);
    expect(getSafeConnectorChainId).toHaveBeenCalledTimes(1);
    // The `postMessage` check of orbit-core accepts a reply from any window: not used
    expect(detectSafeApp).not.toHaveBeenCalled();
  });

  it('hides the Safe connector outside Safe{Wallet}', async () => {
    getSafeConnectorChainId = vi.fn(async () => {
      throw new Error('No provider');
    });

    renderInstalled();
    await Promise.resolve();
    await Promise.resolve();
    expect(renderInstalled()).toEqual(['Rabby Wallet']);
  });
});
