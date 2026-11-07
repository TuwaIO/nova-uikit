import { AnimatedHeight } from '@tuwaio/nova-core';
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
  return { ...(await importOriginal<typeof import('react')>()), ...hooks, useContext: () => state.context };
});

const { state } = vi.hoisted(() => ({
  state: {
    labels: undefined as unknown as NovaConnectLabels,
    modal: {} as Record<string, unknown>,
    context: null as { isWaitingForSignature?: boolean } | null,
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
  Array.isArray(node)
    ? node.map(text).join('')
    : typeof node === 'string'
      ? node
      : node && typeof node === 'object' && 'props' in node
        ? text((node.props as { children?: unknown }).children)
        : '';

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
    state.context = null;
  });
  afterEach(() => {
    unmount();
    vi.unstubAllGlobals();
  });

  // The wallet waits at the gate of the sign-in: a window that said "connecting" gave no reason to look at the wallet
  it.each([
    ['en', defaultLabels, 'Sign the message in your wallet'],
    ['uk', ukrainianLabels, 'Підпишіть повідомлення в гаманці'],
    ['zh', chineseLabels, '请在钱包中签署消息'],
  ])('%s: says what the wallet is waiting for while it is asked to sign in', (_, labels, expected) => {
    state.labels = labels;
    state.context = { isWaitingForSignature: true };

    expect(heading(renderConnecting({}))).toBe(expected);
  });

  it('works without the provider, which is not needed for the step on its own', () => {
    state.context = null;

    expect(heading(renderConnecting({}))).toBe('Connecting to MetaMask...');
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

  // The modal on the wallet list
  const openModal = () => {
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
    return { modal, tree };
  };

  const show = (modal: (props: object) => unknown, screen: Record<string, unknown>) => {
    state.modal = { ...state.modal, ...screen };
    return render(modal, {});
  };

  it('has no layout animation around its screens: the window is never stretched for a frame after a size change', () => {
    const { tree } = openModal();

    expect(elements(tree).filter((element) => 'layout' in element.props)).toEqual([]);
    const wrapper = elements(tree).find((element) => element.type === motion.div);
    // A layout root: what the indicator of the network tabs measures against in a fixed window
    expect(wrapper?.props.layoutRoot).toBe(true);
    expect(wrapper?.props.transition).toBeUndefined();
  });

  it.each(['connectors', 'network', 'connecting'])(
    'takes the height of its content on the %s screen: no empty space stays in the window',
    (screen) => {
      const { modal } = openModal();
      const tree = show(modal, { connectModalContentType: screen, activeConnector: 'metamask' });

      expect(String(named(tree, 'DefaultModalContainer')?.props.className)).not.toContain('min-h-');
      expect(named(tree, 'DefaultModalContainer')?.props.style).toBeUndefined();
      expect(String(named(tree, 'DefaultMainContent')?.props.className)).not.toContain('flex-1');
    },
  );

  it('keeps its top edge in place and lets the body glide: nothing jumps when the height changes', () => {
    const { tree } = openModal();

    const dialog = elements(tree).find((element) => 'anchorTop' in element.props);
    expect(dialog?.props.anchorTop).toBe(true);
    expect(dialog?.props.animateHeight).toBe(false);

    const body = elements(tree).find((element) => element.type === AnimatedHeight);
    expect(named(body?.props.children, 'DefaultMainContent')).toBeDefined();
  });
});
