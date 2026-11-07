import { isValidElement, type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

// The recent wallets list (the only array state of the component) can be preset by a test
let recentList: unknown[] | undefined;

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [Array.isArray(initial) && recentList ? recentList : initial, vi.fn()],
  useEffect: vi.fn(),
  useCallback: (fn: unknown) => fn,
  useMemo: (fn: () => unknown) => fn(),
  useRef: (initial: unknown) => ({ current: initial }),
  useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
  useContext: () => ({ getState: () => storeState }),
}));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
  useNovaConnect: () => ({ setIsConnectModalOpen: vi.fn(), appChains: [{ id: 137 }] }),
  useGetWalletNameAndAvatar: () => ({ ensNameAbbreviated: undefined }),
}));

let storeState: Record<string, unknown> = {};

vi.mock('../../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
}));

import { ConnectionsContent } from './ConnectionsContent';

const connection = {
  connectorType: 'evm:metamask',
  address: '0x1234567890123456789012345678901234567890',
  chainId: 1,
  isConnected: true,
};

type Element = ReactElement<Record<string, unknown> & { children?: unknown }>;

// Direct children of an element, without `false` and `null`
const childrenOf = (element: Element): Element[] =>
  ([] as unknown[]).concat(element.props.children).flat().filter(isValidElement) as Element[];

describe('ConnectionsContent', () => {
  beforeEach(() => {
    recentList = undefined;
    storeState = {
      connections: {},
      activeConnection: undefined,
      switchConnection: vi.fn(),
      disconnect: vi.fn(),
      connect: vi.fn(),
      getAdapter: vi.fn(),
      connecting: false,
      getConnectors: () => ({}),
    };
  });

  it('shows the default empty state message without custom labels', () => {
    const element = ConnectionsContent({}) as ReactElement<{ children: ReactElement<{ children: string }> }>;

    expect(isValidElement(element)).toBe(true);
    expect(element.props.children.props.children).toBe('No connections found');
  });

  it('labels the container without custom labels', () => {
    storeState.connections = { [connection.connectorType]: connection };
    storeState.activeConnection = connection;

    const element = ConnectionsContent({}) as ReactElement<{ 'aria-label'?: string }>;

    expect(element.props['aria-label']).toBe('Wallet connections manager');
  });

  it('uses the custom labels', () => {
    const element = ConnectionsContent({
      customization: { labels: { emptyStateMessage: 'Nothing here' } },
    }) as ReactElement<{ children: ReactElement<{ children: string }> }>;

    expect(element.props.children.props.children).toBe('Nothing here');
  });

  it('handles the keyboard shortcuts on the container, not on window', async () => {
    storeState.connections = { [connection.connectorType]: connection };
    storeState.activeConnection = connection;
    const disconnect = storeState.disconnect as ReturnType<typeof vi.fn>;

    const element = ConnectionsContent({}) as Element;
    const onKeyDown = element.props.onKeyDown as (event: object) => void;
    expect(typeof onKeyDown).toBe('function');

    const keyEvent = (key: string, modifiers: object) => ({
      key,
      ...modifiers,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    // Ctrl/Cmd + D is the browser bookmark shortcut: not used
    const bookmark = keyEvent('d', { metaKey: true });
    onKeyDown(bookmark);
    expect(bookmark.preventDefault).not.toHaveBeenCalled();

    onKeyDown(keyEvent('Backspace', {}));
    await Promise.resolve();
    expect(disconnect).not.toHaveBeenCalled();

    const shortcut = keyEvent('Backspace', { ctrlKey: true });
    onKeyDown(shortcut);
    await Promise.resolve();
    expect(shortcut.preventDefault).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalledWith(connection.connectorType);
  });

  it('reconnects a recent wallet on the first chain of the app', async () => {
    recentList = [[connection.connectorType, { address: connection.address, disconnectedTimestamp: 1 }]];
    storeState.getConnectors = () => ({ evm: [{ name: 'MetaMask' }] });
    const connect = storeState.connect as ReturnType<typeof vi.fn>;

    const element = ConnectionsContent({}) as Element;
    const recentSection = childrenOf(element).find((child) => childrenOf(child).length > 0) as Element;
    const [row] = childrenOf(recentSection);

    await (row.props.onConnect as () => Promise<void>)();
    expect(connect).toHaveBeenCalledWith({ connectorType: connection.connectorType, chainId: 137 });
  });

  // `connect` does not reject: screen readers heard that it connected, and `onAfterConnect` ran for a wallet that had not
  it('tells a recent wallet that failed to connect and runs only the error handler', async () => {
    recentList = [[connection.connectorType, { address: connection.address, disconnectedTimestamp: 1 }]];
    storeState.getConnectors = () => ({ evm: [{ name: 'MetaMask' }] });
    storeState.connectionError = { message: 'User rejected the request' };
    const onAfterConnect = vi.fn();
    const onConnectError = vi.fn();

    const element = ConnectionsContent({ customization: { handlers: { onAfterConnect, onConnectError } } }) as Element;
    const recentSection = childrenOf(element).find((child) => childrenOf(child).length > 0) as Element;
    const [row] = childrenOf(recentSection);
    await (row.props.onConnect as () => Promise<void>)();

    expect(onAfterConnect).not.toHaveBeenCalled();
    expect(onConnectError).toHaveBeenCalledWith(
      connection.connectorType,
      expect.objectContaining({
        message: 'User rejected the request',
      }),
    );
  });

  it('runs the after-handler when the recent wallet is the active one', async () => {
    recentList = [[connection.connectorType, { address: connection.address, disconnectedTimestamp: 1 }]];
    storeState.getConnectors = () => ({ evm: [{ name: 'MetaMask' }] });
    const onAfterConnect = vi.fn();
    const connect = vi.fn(async () => {
      storeState.activeConnection = connection;
    });
    storeState.connect = connect;

    const element = ConnectionsContent({ customization: { handlers: { onAfterConnect } } }) as Element;
    const recentSection = childrenOf(element).find((child) => childrenOf(child).length > 0) as Element;
    const [row] = childrenOf(recentSection);
    await (row.props.onConnect as () => Promise<void>)();

    expect(onAfterConnect).toHaveBeenCalledWith(connection.connectorType);
  });
});
