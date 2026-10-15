import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
}));

const motionState = vi.hoisted(() => ({ reduced: false }));
vi.mock('framer-motion', () => ({
  motion: { span: 'span', path: 'path' },
  AnimatePresence: ({ children }: { children: unknown }) => children,
  useReducedMotion: () => motionState.reduced,
}));

const store = vi.hoisted(() => ({ rememberWallet: false, setRememberWallet: vi.fn() }));
vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: typeof store) => unknown) => selector(store),
}));

import { RememberWallet } from './RememberWallet';

type Node = { type?: unknown; props?: Record<string, unknown> & { children?: unknown } };
type Handler = (event?: unknown) => void;

// The elements of the rendered tree (the harness renders one component, without a DOM)
const flatten = (node: unknown): Node[] => {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(flatten);
  const element = node as Node;
  return [element, ...flatten(element.props?.children)];
};
const texts = (nodes: Node[]) => nodes.flatMap((n) => [n.props?.children].flat()).filter((c) => typeof c === 'string');
const renderNodes = () => flatten(render(RememberWallet, {}));
const checkmark = (nodes: Node[]) => nodes.find((n) => n.type === 'path')!.props!;
const infoButton = (nodes: Node[]) => nodes.find((n) => n.type === 'button')!.props! as Record<string, Handler>;
const tooltip = (nodes: Node[]) => nodes.find((n) => n.props?.role === 'tooltip');

// "Remember this wallet" under the wallet list of the connect modal: unticked, the wallet is saved only until the tab
// closes (Satellite `rememberWallet`). The explanation opens from an info button: on hover with a mouse, on a tap or
// click (also on phones), and stays available to screen readers as the description of the checkbox.
describe('RememberWallet', () => {
  beforeEach(() => {
    vi.stubGlobal('document', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => {
    unmount();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    store.rememberWallet = false;
    motionState.reduced = false;
  });

  it('shows the choice of the store and changes it', () => {
    const nodes = renderNodes();
    const input = nodes.find((n) => n.type === 'input')!;

    expect(input.props).toMatchObject({ type: 'checkbox', checked: false });
    expect(texts(nodes)).toContain('Remember this wallet');

    (input.props!.onChange as Handler)({ target: { checked: true } });
    expect(store.setRememberWallet).toHaveBeenCalledWith(true);
  });

  it('describes the checkbox to screen readers with the hint, while the tooltip is closed', () => {
    const nodes = renderNodes();
    const describedBy = nodes.find((n) => n.type === 'input')!.props!['aria-describedby'];

    expect(nodes.find((n) => n.props?.id === describedBy)!.props!.children).toBe(defaultLabels.rememberWalletHint);
    expect(tooltip(nodes)).toBeUndefined();
  });

  it('draws the check mark only when the box is ticked', () => {
    expect(checkmark(renderNodes()).animate).toMatchObject({ pathLength: 0 });
    unmount();

    store.rememberWallet = true;
    expect(checkmark(renderNodes()).animate).toMatchObject({ pathLength: 1 });
  });

  it('does not animate for people who prefer reduced motion', () => {
    motionState.reduced = true;
    store.rememberWallet = true;

    expect(checkmark(renderNodes()).transition).toMatchObject({ duration: 0 });
  });

  it('opens the hint with a tap or click on the info button, and closes it with another one', () => {
    infoButton(renderNodes()).onClick();
    const open = renderNodes();
    expect(texts([tooltip(open)!])).toContain(defaultLabels.rememberWalletHint);
    expect(infoButton(open)['aria-expanded']).toBe(true);

    infoButton(open).onClick();
    expect(tooltip(renderNodes())).toBeUndefined();
  });

  it('closes an open hint on a tap or click elsewhere', () => {
    infoButton(renderNodes()).onClick();
    renderNodes();
    const [, close] = (document.addEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
      ([type]) => type === 'pointerdown',
    )!;

    close({ target: {} });
    expect(tooltip(renderNodes())).toBeUndefined();
  });

  it('shows the hint while a mouse is over the info button, not on a touch', () => {
    infoButton(renderNodes()).onPointerEnter({ pointerType: 'touch' });
    expect(tooltip(renderNodes())).toBeUndefined();

    infoButton(renderNodes()).onPointerEnter({ pointerType: 'mouse' });
    expect(tooltip(renderNodes())).toBeDefined();

    infoButton(renderNodes()).onPointerLeave({ pointerType: 'mouse' });
    expect(tooltip(renderNodes())).toBeUndefined();
  });

  it('closes the hint with Escape before the dialog around it sees the key', () => {
    infoButton(renderNodes()).onClick();
    renderNodes();
    const [, onKeyDown, capture] = (window.addEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
      ([type]) => type === 'keydown',
    )!;
    const event = { key: 'Escape', stopPropagation: vi.fn() };

    onKeyDown(event);

    expect(capture).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(tooltip(renderNodes())).toBeUndefined();
  });

  it('can be hidden', () => {
    expect(render(RememberWallet, { customization: { hidden: true } })).toBeNull();
  });
});
