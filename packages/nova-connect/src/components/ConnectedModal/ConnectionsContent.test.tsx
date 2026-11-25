import { isValidElement, type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { germanLabels } from '../../i18n/de';
import { defaultLabels } from '../../i18n/en';
import { spanishLabels } from '../../i18n/es';
import { italianLabels } from '../../i18n/it';
import { ukrainianLabels } from '../../i18n/ua';
import { chineseLabels } from '../../i18n/zh';

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
  useNovaConnectLabels: () => labels,
  useNovaConnect: () => ({ setIsConnectModalOpen: vi.fn(), appChains: [{ id: 137 }] }),
  useGetWalletNameAndAvatar: () => ({ ensNameAbbreviated: undefined }),
}));

let storeState: Record<string, unknown> = {};
let labels = defaultLabels;

vi.mock('../../satellite', () => ({
  SatelliteStoreContext: {},
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
}));

// The hook of nova-core runs the React of its own build
vi.mock('@tuwaio/nova-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tuwaio/nova-core')>()),
  useCopyToClipboard: () => ({ copy: vi.fn(), isCopied: false }),
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

// The connected wallets, the active one first, as the screen passes them to their rows
const rowsFor = (...connections: (typeof connection)[]): Element[] => {
  storeState.connections = Object.fromEntries(connections.map((item) => [item.connectorType, item]));
  storeState.activeConnection = connections[0];
  const screen = ConnectionsContent({}) as Element;
  return childrenOf(childrenOf(screen).find((child) => 'count' in child.props)!);
};

// A row as it is drawn (a `forwardRef` component)
const drawRow = (row: Element): Element =>
  (row.type as unknown as { render: (props: object, ref: null) => Element }).render(row.props, null);

describe('ConnectionsContent', () => {
  beforeEach(() => {
    recentList = undefined;
    labels = defaultLabels;
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

  // In Ukrainian the button "Відключити" stood past the window of a phone of 320 and of 360 px
  it('takes the disconnect button to the next line when the row of the active wallet has no place for it', () => {
    const row = drawRow(rowsFor(connection)[0]);
    expect(row.props.className).toContain('novacon:flex-wrap');
    const [, content, button] = childrenOf(row);
    // The wallet gives way inside its own place, and the button keeps to the end of the line
    expect(content.props.className).toContain('novacon:min-w-0');
    expect(button.props.className).toContain('novacon:ml-auto');
  });

  // The badge in the corner lay on the end of a name of twenty letters: on the line of text of its box it stood 4 px lower than
  // its place, and 5 px into the name
  it('keeps the name of the active wallet under its badge on a phone', () => {
    const row = drawRow(rowsFor(connection)[0]);
    expect(row.props.className).toContain('novacon:max-[480px]:pt-8');
    const [badge] = childrenOf(row);
    expect(badge.props.className).toContain('novacon:flex');
  });

  // Two labels put together: "Активний Конектори (1)", "Aktiv Konnektoren (1)"
  it.each([
    ['en', defaultLabels],
    ['uk', ukrainianLabels],
    ['zh', chineseLabels],
    ['de', germanLabels],
    ['es', spanishLabels],
    ['it', italianLabels],
  ])('%s: the title of the connected wallets is a label of its own', (_, of) => {
    labels = of;
    storeState.connections = { [connection.connectorType]: connection };
    storeState.activeConnection = connection;
    const section = childrenOf(ConnectionsContent({}) as Element).find((child) => 'count' in child.props)!;
    const [title] = childrenOf(drawRow(section));

    expect(title.type).toBe('h3');
    expect(([] as unknown[]).concat(title.props.children).join('')).toBe(`${of.connectors} (1)`);
  });

  // "Disconnect evm:metamask": the type of the connector, which means nothing to a person
  it('names the wallet a disconnect button disconnects', () => {
    storeState.getConnectors = () => ({ evm: [{ name: 'MetaMask' }, { name: 'Rainbow' }] });
    const rows = rowsFor(connection, { ...connection, connectorType: 'evm:rainbow' });
    const names = rows.map((row) => childrenOf(drawRow(row)).at(-1)!.props['aria-label']);
    expect(names).toEqual(['Disconnect MetaMask', 'Disconnect Rainbow']);
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
