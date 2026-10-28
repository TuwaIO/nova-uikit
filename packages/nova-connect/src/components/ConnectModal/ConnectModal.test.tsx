import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  // `useContext` reads the Satellite store context, not used here
  return { ...(await importOriginal<typeof import('react')>()), ...hooks, useContext: () => null };
});

const { state } = vi.hoisted(() => ({
  state: {
    modal: {} as Record<string, unknown>,
    wallets: { evm: [], solana: [] } as Record<'evm' | 'solana', { name: string; adapter: string }[]>,
    listeners: new Set<() => void>(),
  },
}));

// The store of a page whose wagmi config is not hydrated yet when the modal opens: Solana wallets only
const storeState = {
  connectionError: undefined,
  connect: vi.fn(),
  activeConnection: undefined,
  getConnectors: () => ({ evm: [...state.wallets.evm], solana: [...state.wallets.solana] }),
  watchConnectors: (onChange: () => void) => {
    state.listeners.add(onChange);
    return () => {
      state.listeners.delete(onChange);
    };
  },
};

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
  useNovaConnect: () => state.modal,
}));
vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));
vi.mock('../../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (store: Record<string, unknown>) => unknown) => selector(storeState),
}));

import { ConnectModal } from './ConnectModal';
import { ConnectorsSelections } from './ConnectorsSelections';
import { NetworkTabs } from './NetworkTabs';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const modal = (ConnectModal as unknown as { type: (props: object) => unknown }).type;
const ofType = (tree: unknown, type: unknown) => elements(tree).find((element) => element.type === type);
const walletNames = (tree: unknown) =>
  (ofType(tree, ConnectorsSelections)?.props.connectors as { name: string }[] | undefined)?.map(({ name }) => name);

const setOpen = (isConnectModalOpen: boolean) => {
  state.modal = { ...state.modal, isConnectModalOpen };
};

describe('ConnectModal wallet list', () => {
  beforeEach(() => {
    state.wallets = {
      evm: [],
      solana: [{ name: 'Phantom', adapter: OrbitAdapter.SOLANA }],
    };
    state.listeners.clear();
    state.modal = {
      isConnectModalOpen: false,
      connectModalContentType: 'connectors',
      selectedAdapter: undefined,
      setIsConnectModalOpen: vi.fn(),
      setConnectModalContentType: vi.fn(),
      setActiveConnector: vi.fn(),
      setImpersonatedAddress: vi.fn(),
      setIsConnected: vi.fn(),
      setSelectedAdapter: vi.fn(),
    };
  });
  afterEach(() => unmount());

  it('shows the wallets added after it opened, and follows them only while open', () => {
    render(modal, {});
    expect(state.listeners.size).toBe(0);

    setOpen(true);
    let tree = render(modal, {});
    expect(walletNames(tree)).toEqual(['Phantom']);
    expect(state.listeners.size).toBe(1);

    // wagmi adds the installed EIP-6963 wallets once the config is hydrated, after the modal opened
    state.wallets.evm = [
      { name: 'MetaMask', adapter: OrbitAdapter.EVM },
      { name: 'Rabby', adapter: OrbitAdapter.EVM },
    ];
    state.listeners.forEach((onChange) => onChange());
    tree = render(modal, {});
    expect(walletNames(tree)).toEqual(['MetaMask', 'Phantom', 'Rabby']);
    expect(ofType(tree, NetworkTabs)?.props.networks).toEqual([OrbitAdapter.EVM, OrbitAdapter.SOLANA]);

    setOpen(false);
    render(modal, {});
    expect(state.listeners.size).toBe(0);
  });

  it('keeps the same wallet list between renders while the wallets stay the same', () => {
    setOpen(true);
    const first = ofType(render(modal, {}), ConnectorsSelections)?.props.connectors;

    // The store reports a change without new wallets (wagmi's `hydrate` always sets a new array)
    state.listeners.forEach((onChange) => onChange());
    const second = ofType(render(modal, {}), ConnectorsSelections)?.props.connectors;

    expect(second).toBe(first);
  });
});
