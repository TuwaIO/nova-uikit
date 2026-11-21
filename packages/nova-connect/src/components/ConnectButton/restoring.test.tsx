import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import type { NovaConnectLabels } from '../../i18n/types';
import { ukrainianLabels } from '../../i18n/ua';
import { chineseLabels } from '../../i18n/zh';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const state = vi.hoisted(() => ({
  labels: undefined as unknown as NovaConnectLabels,
  restoring: false,
  activeConnection: undefined as unknown,
}));

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => state.labels,
  useNovaConnect: () => ({ setIsConnectedModalOpen: vi.fn(), setIsConnectModalOpen: vi.fn() }),
  useWalletRestoring: () => state.restoring,
}));
vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (store: Record<string, unknown>) => unknown) =>
    selector({ activeConnection: state.activeConnection }),
}));

import { ConnectButton, type ConnectButtonButtonProps } from './ConnectButton';
import { WaitForConnectionContent } from './WaitForConnectionContent';

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

const renderButton = () => {
  const button = (ConnectButton as unknown as { type: (props: object) => unknown }).type;
  const tree = elements(render(button, {}));
  const element = tree.find((node) => 'buttonData' in node.props && 'onKeyDown' in node.props);
  return { tree, button: element?.props as unknown as ConnectButtonButtonProps };
};

// The owner's pass of the Quasar stand: after a reload the button said "Connect Wallet" while Satellite restored the
// last wallet, and the restored wallet replaced it a moment later. While a wallet may still come back, the button says
// nothing it would take back
describe('the connect button while the last wallet is restored', () => {
  beforeEach(() => {
    state.labels = defaultLabels;
    state.restoring = false;
    state.activeConnection = undefined;
  });
  afterEach(() => unmount());

  it.each([
    ['en', defaultLabels],
    ['uk', ukrainianLabels],
    ['zh', chineseLabels],
  ])('%s: shows a neutral state, not the connect prompt, and says why to screen readers', (_, labels) => {
    state.labels = labels;
    state.restoring = true;

    const { tree, button } = renderButton();
    expect(tree.some((node) => node.type === WaitForConnectionContent)).toBe(false);
    // The placeholder draws shapes only; its words are for screen readers
    const content = button.children as Element;
    expect(content.props.label).toBe(labels.restoringWallet);
    expect(text((content.type as (props: object) => unknown)(content.props))).toBe(labels.restoringWallet);
    expect(button['aria-label']).toBe(labels.restoringWallet);
    expect(button.disabled).toBe(true);
    expect((button as unknown as Record<string, unknown>)['aria-busy']).toBe(true);
    expect(button.buttonData.isRestoring).toBe(true);
    // The quiet look of a wallet, not the filled call to connect, and not the faded look of a disabled button
    expect(button.className).not.toContain('tuwa-solid');
    expect(button.className).toContain('novacon:disabled:cursor-progress');
    expect(button.className).not.toContain('novacon:disabled:opacity-50');
  });

  it('asks to connect once nothing is being restored', () => {
    const { tree, button } = renderButton();
    expect(tree.some((node) => node.type === WaitForConnectionContent)).toBe(true);
    expect(button.disabled).toBeFalsy();
    expect((button as unknown as Record<string, unknown>)['aria-busy']).toBeFalsy();
    expect(button['aria-label']).toBe(`${defaultLabels.walletNotConnected}. ${defaultLabels.connectWallet}`);
    expect(button.buttonData.isRestoring).toBe(false);
    expect(button.className).toContain('tuwa-solid');
  });
});
