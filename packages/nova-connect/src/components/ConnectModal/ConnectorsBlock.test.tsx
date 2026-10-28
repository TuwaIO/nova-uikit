import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import type { NovaConnectLabels } from '../../i18n/types';
import { ukrainianLabels } from '../../i18n/ua';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  const react = await importOriginal<typeof import('react')>();
  // `useContext` reads the Satellite store context, not used here; the component also calls `React.useEffect`
  const mocked = { ...hooks, useContext: () => null };
  return { ...react, ...mocked, default: { ...react, ...mocked } };
});

const { state } = vi.hoisted(() => ({ state: { labels: undefined as unknown as NovaConnectLabels } }));

vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => state.labels }));
vi.mock('../../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (store: Record<string, unknown>) => unknown) => selector({ connect: vi.fn() }),
}));

import type { GroupedConnector } from '../../utils/getGroupedConnectors';
import { ConnectorsBlock, type ConnectorsBlockProps } from './ConnectorsBlock';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components), with the elements of its props
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children), ...elements(element.props.icon)];
}

const wallet = (name: string): GroupedConnector => ({
  name,
  icon: `data:image/svg+xml,${name}`,
  adapters: [OrbitAdapter.EVM],
  connectors: [],
});

const renderBlock = (connectors: GroupedConnector[]) =>
  render((ConnectorsBlock as unknown as { type: { render: (props: ConnectorsBlockProps) => unknown } }).type.render, {
    selectedAdapter: OrbitAdapter.EVM,
    connectors,
    title: 'Installed',
    onClick: vi.fn(),
    setIsConnected: vi.fn(),
    setIsOpen: vi.fn(),
  });

describe('ConnectorsBlock', () => {
  afterEach(() => unmount());

  it.each([
    ['en', defaultLabels],
    ['uk', ukrainianLabels],
  ])('%s: names a wallet icon after the wallet, not its lower-case connector type', (_, labels) => {
    state.labels = labels;
    const tree = renderBlock([wallet('MetaMask'), wallet('Trust Wallet')]);

    const icons = elements(tree).filter((element) => typeof element.props.name === 'string' && 'icon' in element.props);
    expect(icons.map((icon) => icon.props.altText)).toEqual([
      `MetaMask ${labels.walletIcon}`,
      `Trust Wallet ${labels.walletIcon}`,
    ]);
  });
});
