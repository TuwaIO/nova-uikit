import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { germanLabels } from '../../i18n/de';
import { defaultLabels } from '../../i18n/en';
import { spanishLabels } from '../../i18n/es';
import { italianLabels } from '../../i18n/it';
import type { NovaConnectLabels } from '../../i18n/types';
import { ukrainianLabels } from '../../i18n/ua';
import { chineseLabels } from '../../i18n/zh';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const NAME = 'vitalik.eth';

const state = vi.hoisted(() => ({
  labels: undefined as unknown as NovaConnectLabels,
  status: 'idle',
  balance: null as { value: string; symbol: string } | null,
}));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => state.labels,
  useNovaConnect: () => ({
    setIsConnectedModalOpen: vi.fn(),
    setIsConnectModalOpen: vi.fn(),
    isConnectedModalOpen: false,
    setConnectedButtonStatus: vi.fn(),
    connectedButtonStatus: state.status,
  }),
  useWalletRestoring: () => false,
  useGetWalletNameAndAvatar: () => ({ ensAvatar: null, ensNameAbbreviated: NAME }),
  useWalletNativeBalance: () => ({ balance: state.balance, refetch: vi.fn() }),
}));
vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (store: Record<string, unknown>) => unknown) =>
    selector({
      activeConnection: {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        connectorType: 'evm:metamask',
        isConnected: true,
      },
    }),
}));

import { ConnectButton, type ConnectButtonButtonProps, type ConnectButtonProps } from './ConnectButton';
import { ConnectedContent, type ConnectedContentProps } from './ConnectedContent';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const renderButton = (props: ConnectButtonProps = {}) => {
  const button = (ConnectButton as unknown as { type: (props: ConnectButtonProps) => unknown }).type;
  const element = elements(render(button, props)).find(
    (node) => 'buttonData' in node.props && 'onKeyDown' in node.props,
  );
  const buttonProps = element!.props as unknown as ConnectButtonButtonProps;
  return { props: buttonProps, inside: elements(buttonProps.children) };
};

const renderContent = (props: Partial<ConnectedContentProps>) => {
  const content = (ConnectedContent as unknown as { render: (props: Partial<ConnectedContentProps>) => unknown })
    .render;
  const container = render(content, props) as Element;
  const main = elements(container).find((node) => 'statusDisplay' in node.props)!;
  return {
    name: container.props['aria-label'] as string,
    shown: (main.props.statusDisplay as { displayName: string }).displayName,
  };
};

const LANGUAGES = [
  ['en', defaultLabels],
  ['uk', ukrainianLabels],
  ['zh', chineseLabels],
  ['de', germanLabels],
  ['es', spanishLabels],
  ['it', italianLabels],
] as const;

beforeEach(() => {
  state.labels = defaultLabels;
  state.status = 'idle';
  state.balance = null;
});
afterEach(() => unmount());

// The button said "Wallet connected. Open wallet modal" over the wallet it shows: the name on the screen was not in its name,
// so it could not be pressed by voice, and a screen reader never said which wallet it is
describe('the name of the connect button of a connected wallet', () => {
  it.each(LANGUAGES)('%s: is what the button holds, between what it is and what it opens', (_, labels) => {
    state.labels = labels;
    const { props, inside } = renderButton();

    expect(props['aria-label']).toBeUndefined();
    const at = inside.findIndex((node) => node.type === ConnectedContent);
    const words = inside.filter((node) => String(node.props.className).includes('sr-only'));
    expect(words.map((node) => node.props.children)).toEqual([
      `${labels.walletConnected}. `,
      `. ${labels.openWalletModal}`,
    ]);
    expect(inside.indexOf(words[0])).toBeLessThan(at);
    expect(inside.indexOf(words[1])).toBeGreaterThan(at);
    // The hidden words are placed by the button, not by the page: in a row that scrolls they would widen it
    expect(props.className).toContain('novacon:relative');
  });

  it('is the one the host gives, alone', () => {
    const { props, inside } = renderButton({
      customization: { config: { ariaLabels: { button: () => 'My wallet' } } },
    });

    expect(props['aria-label']).toBe('My wallet');
    expect(inside.filter((node) => String(node.props.className).includes('sr-only'))).toEqual([]);
  });
});

describe('the name of the content of a connected wallet', () => {
  it.each(LANGUAGES)('%s: holds what is shown, in every status', (_, labels) => {
    state.labels = labels;
    for (const status of ['idle', 'loading', 'succeed', 'failed', 'replaced', 'cancelled']) {
      state.status = status;
      unmount();
      const { name, shown } = renderContent({});
      expect(shown).toBeTruthy();
      expect(name, status).toContain(shown);
    }
  });

  it('holds the balance it shows, before the wallet', () => {
    state.balance = { value: '1.5', symbol: 'ETH' };
    expect(renderContent({ withBalance: true }).name).toBe(
      `${defaultLabels.walletBalance}: 1.500. ${defaultLabels.walletAddress}: ${NAME}`,
    );
  });

  it('says that the balance is not known', () => {
    expect(renderContent({ withBalance: true }).name).toBe(
      `${defaultLabels.noBalanceAvailable}. ${defaultLabels.walletAddress}: ${NAME}`,
    );
  });

  it('holds no balance that is not shown', () => {
    state.balance = { value: '1.5', symbol: 'ETH' };
    expect(renderContent({}).name).toBe(`${defaultLabels.walletAddress}: ${NAME}`);
  });

  it('is the one the host gives', () => {
    expect(renderContent({ withBalance: true, 'aria-label': 'My wallet' }).name).toBe('My wallet');
  });
});
