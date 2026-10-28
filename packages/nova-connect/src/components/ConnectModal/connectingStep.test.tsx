import { OrbitAdapter } from '@tuwaio/orbit-core';
import { motion } from 'framer-motion';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import type { NovaConnectLabels } from '../../i18n/types';
import { ukrainianLabels } from '../../i18n/ua';
import { chineseLabels } from '../../i18n/zh';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  // `useContext` reads the Satellite store context, not used here
  return { ...(await importOriginal<typeof import('react')>()), ...hooks, useContext: () => null };
});

const { state } = vi.hoisted(() => ({
  state: {
    labels: undefined as unknown as NovaConnectLabels,
    modal: {} as Record<string, unknown>,
  },
}));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => state.labels,
  useNovaConnect: () => state.modal,
}));
vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => state.labels }));
vi.mock('../../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (store: Record<string, unknown>) => unknown) =>
    selector({ connectionError: undefined, getConnectors: () => ({ evm: [] }), connect: vi.fn() }),
}));

import type { GroupedConnector } from '../../utils/getGroupedConnectors';
import { Connecting, type ConnectingProps } from './Connecting';
import { ConnectModal } from './ConnectModal';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const text = (node: unknown): string =>
  Array.isArray(node) ? node.map(text).join('') : typeof node === 'string' ? node : '';

const named = (tree: unknown, name: string) =>
  elements(tree).find((element) => (element.type as { displayName?: string })?.displayName === name);

const wallet = (name: string): GroupedConnector => ({
  name,
  icon: `data:image/svg+xml,${name}`,
  adapters: [OrbitAdapter.EVM],
  connectors: [],
});

const renderConnecting = (props: Partial<ConnectingProps>) => {
  const connecting = (Connecting as unknown as { type: { render: (props: ConnectingProps) => unknown } }).type.render;
  return render(connecting, {
    activeConnector: 'metamask',
    selectedAdapter: OrbitAdapter.EVM,
    connectors: [wallet('MetaMask')],
    isConnected: false,
    ...props,
  });
};

const heading = (tree: unknown) =>
  text(elements(tree).find((element) => element.props.id === 'connecting-message')?.props.children);

describe('the connecting step', () => {
  beforeEach(() => {
    state.labels = defaultLabels;
  });
  afterEach(() => {
    unmount();
    vi.unstubAllGlobals();
  });

  it.each([
    ['en', defaultLabels, 'Connecting to MetaMask...'],
    ['uk', ukrainianLabels, 'Підключення до MetaMask...'],
    ['zh', chineseLabels, '正在连接至 MetaMask...'],
  ])('%s: names the wallet as the header does, not by its connector type', (_, labels, expected) => {
    state.labels = labels;
    // The connector type kept by the modal (`formatConnectorName` of the wallet name)
    const tree = renderConnecting({ activeConnector: 'metamask' });

    expect(heading(tree)).toBe(expected);
    const all = elements(tree)
      .map((element) => text(element.props.children))
      .join(' ');
    expect(all).not.toMatch(/metamask/);
  });

  it.each([
    // `Base Account` is `coinbase`, `Coinbase Wallet` is `coinbasewallet`
    ['coinbase', [wallet('Coinbase Wallet'), wallet('Base Account')], 'Base Account'],
    ['safe', [wallet('SafePal'), wallet('Safe')], 'Safe'],
    ['metamask', [wallet('MetaMask Flask'), wallet('MetaMask')], 'MetaMask'],
  ])('`%s` is the wallet whose connector type is exactly it, not one that contains it', (type, connectors, name) => {
    const tree = renderConnecting({ activeConnector: type, connectors });

    expect(heading(tree)).toBe(`Connecting to ${name}...`);
    const icon = elements(tree).find((element) => typeof element.props.altText === 'string');
    expect(icon?.props.icon).toBe(`data:image/svg+xml,${name}`);
    expect(icon?.props.altText).toBe(`${name} ${defaultLabels.walletIcon}`);
  });

  it('falls back to a wallet whose connector type contains the active one', () => {
    const tree = renderConnecting({ activeConnector: 'trust', connectors: [wallet('Trust Wallet Extension')] });
    expect(heading(tree)).toBe('Connecting to Trust Wallet Extension...');
  });

  // The modal on the wallet list, with a `ResizeObserver` that reports when a test asks
  const openModal = () => {
    const observed: Array<() => void> = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        // A real observer reports later, when the page renders a frame
        observe() {
          observed.push(this.callback);
        }
        disconnect() {}
      },
    );
    state.modal = {
      isConnectModalOpen: true,
      connectModalContentType: 'connectors',
      selectedAdapter: OrbitAdapter.EVM,
      setIsConnectModalOpen: vi.fn(),
      setConnectModalContentType: vi.fn(),
      setActiveConnector: vi.fn(),
      setImpersonatedAddress: vi.fn(),
      setIsConnected: vi.fn(),
      setSelectedAdapter: vi.fn(),
    };
    const modal = (ConnectModal as unknown as { type: (props: object) => unknown }).type;
    const tree = render(modal, {});
    return { modal, tree, observed };
  };

  // Shows the wallet list, `height` px high, to the modal
  const showList = (tree: unknown, modal: (props: object) => unknown, height: number) => {
    const list = { offsetHeight: height };
    const setRef = named(tree, 'DefaultModalContainer')?.props.ref as (element: object | null) => void;
    setRef(list);
    render(modal, {});
    return { list, setRef };
  };

  const show = (modal: (props: object) => unknown, screen: Record<string, unknown>) => {
    state.modal = { ...state.modal, ...screen };
    return render(modal, {});
  };

  const keptHeight = (tree: unknown) => {
    const container = named(tree, 'DefaultModalContainer');
    const className = String(container?.props.className ?? '');
    if (!className.includes('novacon:min-h-[min(var(--novacon-connect-list-height),calc(100dvh_-_2rem))]')) return null;
    return (container?.props.style as Record<string, string> | undefined)?.['--novacon-connect-list-height'] ?? null;
  };

  it('has no layout animation around its screens: the window is never stretched for a frame after a size change', () => {
    const { tree } = openModal();

    expect(elements(tree).filter((element) => 'layout' in element.props)).toEqual([]);
    const wrapper = elements(tree).find((element) => element.type === motion.div);
    // A layout root: the layout animations inside it (the network tabs) ignore the move of the centered window
    expect(wrapper?.props.layoutRoot).toBe(true);
    expect(wrapper?.props.transition).toBeUndefined();
  });

  it('keeps the height of the wallet list on the network step too, so it resizes neither there nor when connecting', () => {
    const { modal, tree } = openModal();
    showList(tree, modal, 480);

    let next = show(modal, { connectModalContentType: 'network', activeConnector: 'phantom' });
    expect(keptHeight(next)).toBe('480px');
    // The footer at the bottom, the network list at the top
    expect(named(next, 'DefaultMainContent')?.props.className).toContain('novacon:flex-1');
    expect(named(next, 'DefaultMainContent')?.props.className).not.toContain('novacon:justify-center');

    next = show(modal, { connectModalContentType: 'connecting', selectedAdapter: OrbitAdapter.SOLANA });
    expect(keptHeight(next)).toBe('480px');
  });

  it('forgets the height of the wallet list when the modal closes', () => {
    const { modal, tree } = openModal();
    showList(tree, modal, 480);

    show(modal, { isConnectModalOpen: false });
    // Opened again straight on the connecting screen (the reset to the wallet list comes after the render)
    const next = show(modal, {
      isConnectModalOpen: true,
      connectModalContentType: 'connecting',
      activeConnector: 'metamask',
    });
    expect(keptHeight(next)).toBeNull();
  });

  it('forgets the height of the wallet list when its element is removed', () => {
    const { modal, tree } = openModal();
    const { setRef } = showList(tree, modal, 480);

    setRef(null);
    render(modal, {});
    const next = show(modal, { connectModalContentType: 'connecting', activeConnector: 'metamask' });
    expect(keptHeight(next)).toBeNull();
  });

  it('keeps the height of the wallet list (at most the window height), the status centered, the footer at the bottom', () => {
    const observed: Array<() => void> = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        // A real observer reports later, when the page renders a frame
        observe() {
          observed.push(this.callback);
        }
        disconnect() {}
      },
    );
    const modal = (ConnectModal as unknown as { type: (props: object) => unknown }).type;
    state.modal = {
      isConnectModalOpen: true,
      connectModalContentType: 'connectors',
      selectedAdapter: OrbitAdapter.EVM,
      setIsConnectModalOpen: vi.fn(),
      setConnectModalContentType: vi.fn(),
      setActiveConnector: vi.fn(),
      setImpersonatedAddress: vi.fn(),
      setIsConnected: vi.fn(),
      setSelectedAdapter: vi.fn(),
    };

    // The wallet list is on screen, 480 px high, then 520 px once another wallet is listed
    let tree = render(modal, {});
    const list = { offsetHeight: 480 };
    (named(tree, 'DefaultModalContainer')?.props.ref as (element: object | null) => void)(list);
    render(modal, {});
    list.offsetHeight = 520;
    observed.forEach((report) => report());
    render(modal, {});

    // A wallet is chosen: the modal does not shrink to the spinner, and never grows past the window
    state.modal = { ...state.modal, connectModalContentType: 'connecting', activeConnector: 'metamask' };
    tree = render(modal, {});
    const container = named(tree, 'DefaultModalContainer');
    expect(container?.props.className).toContain(
      'novacon:min-h-[min(var(--novacon-connect-list-height),calc(100dvh_-_2rem))]',
    );
    expect((container?.props.style as Record<string, string>)['--novacon-connect-list-height']).toBe('520px');
    const main = named(tree, 'DefaultMainContent');
    expect(main?.props.className).toContain('novacon:flex-1');
    expect(main?.props.className).toContain('novacon:justify-center');

    // Back on the wallet list, the modal takes the height of its content again
    state.modal = { ...state.modal, connectModalContentType: 'connectors' };
    tree = render(modal, {});
    expect(named(tree, 'DefaultModalContainer')?.props.style).toBeUndefined();
    expect(named(tree, 'DefaultModalContainer')?.props.className).not.toContain('min-h-');
  });
});
