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
const play = vi.hoisted(() => vi.fn());
const icons = vi.hoisted(() => ({ look: 'classic' as 'classic' | 'pixel' }));
vi.mock('@tuwaio/nova-core', async (importOriginal) => ({
  // The real flight: what the pixels of the check mark are given is what is checked
  pixelFlight: (await importOriginal<typeof import('@tuwaio/nova-core')>()).pixelFlight,
  useNovaSounds: () => play,
  NovaSetIcon: () => null,
  useNovaIcons: () => icons,
}));
vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: typeof store) => unknown) => selector(store),
}));

import { pixelFlight } from '@tuwaio/nova-core';

import { RememberWallet } from './RememberWallet';
import { CHECK_FLIGHT } from './rememberWalletCheck';

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

  // The pixel look: a check mark that shows when the box is ticked (CSS, by `data-on`), and assembles from its pixels
  it('draws the pixel check mark only when the box is ticked, in the pixel look', () => {
    icons.look = 'pixel';
    const svgOf = (nodes: Node[]) => nodes.find((n) => n.type === 'svg' && n.props?.viewBox === '0 0 7 7')!;
    expect(svgOf(renderNodes()).props!['data-on']).toBeUndefined();
    unmount();

    // Already ticked when the list opens (the default): the mark is simply there, it does not assemble again
    store.rememberWallet = true;
    const already = renderNodes();
    expect(svgOf(already).props!['data-on']).toBe('');
    expect(svgOf(already).props!['data-motion']).toBeUndefined();
    unmount();

    // Ticked here: the check mark assembles from its pixels, as every pixel drawing of Nova
    store.rememberWallet = false;
    (renderNodes().find((n) => n.type === 'input')!.props!.onChange as Handler)({ target: { checked: true } });
    store.rememberWallet = true;
    const ticked = renderNodes();
    expect(svgOf(ticked).props!['data-motion']).toBe('assemble');
    const pixels = ticked.filter((n) => n.props?.className === 'tuwa-remember-px');
    expect(pixels).toHaveLength(13);
    for (const pixel of pixels) {
      expect(pixel.props!['data-px']).toBe('');
      expect(pixel.props!.style).toEqual(pixelFlight(Number(pixel.props!.x), Number(pixel.props!.y), CHECK_FLIGHT));
    }
    icons.look = 'classic';
  });

  // The pixel check was too thin to read (a line one pixel wide on a grid of 6). Its line is two pixels
  // thick: every row of it has runs of two pixels at least
  it('draws the pixel check mark two pixels thick', () => {
    icons.look = 'pixel';
    store.rememberWallet = true;
    const cells = renderNodes()
      .filter((n) => n.props?.className === 'tuwa-remember-px')
      .map((n) => [Number(n.props!.x), Number(n.props!.y)] as const);
    for (const row of new Set(cells.map(([, y]) => y))) {
      const xs = cells.filter(([, y]) => y === row).map(([x]) => x);
      for (const x of xs) expect(xs.includes(x - 1) || xs.includes(x + 1), `pixel ${x},${row}`).toBe(true);
    }
    icons.look = 'classic';
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

  // The checkbox has a sound of its own
  it('plays a sound when it is pressed, and still changes the choice', () => {
    const input = renderNodes().find((n) => n.type === 'input')!;
    (input.props!.onChange as Handler)({ target: { checked: true } });

    expect(play).toHaveBeenCalledWith('checkbox');
    expect(store.setRememberWallet).toHaveBeenCalledWith(true);
  });

  it('can be hidden', () => {
    expect(render(RememberWallet, { customization: { hidden: true } })).toBeNull();
  });
});
