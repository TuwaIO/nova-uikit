import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks', () => ({ useNovaConnectLabels: () => defaultLabels }));

import { AboutWallets, type AboutWalletsProps } from './AboutWallets';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const draw = (element: Element): Element => (element.type as (props: object) => Element)(element.props);

function renderCarousel(props: AboutWalletsProps = {}) {
  vi.stubGlobal('window', {
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
    setTimeout: vi.fn(),
    clearTimeout: vi.fn(),
  });
  const tree = elements(
    render((AboutWallets as unknown as { render: (props: AboutWalletsProps) => unknown }).render, props),
  );
  return { tree, navigation: tree.find((node) => 'onSlideChange' in node.props)! };
}

describe('AboutWallets', () => {
  afterEach(() => {
    unmount();
    vi.unstubAllGlobals();
  });

  // Every indicator named `slide-0`, `slide-1` … as what it shows, and nothing on the page had such an id. Only the current slide
  // is on the page, and an app may draw a slide of its own: what they all control is the box the slides are in
  it.each([
    ['the default slide', {}],
    ['a slide of the app', { customization: { components: { Slide: () => null } } }],
  ])('every indicator names the box of the slides as what it controls: %s', (_, props) => {
    const { tree, navigation } = renderCarousel(props);
    const indicators = elements(draw(navigation)).filter((node) => 'isActive' in node.props);
    expect(indicators).toHaveLength(2);

    const ids = new Set(indicators.map((indicator) => draw(indicator).props['aria-controls']));
    expect(ids.size).toBe(1);
    const [id] = ids;
    expect(id).toBeTruthy();
    const box = tree.filter((node) => node.props.id === id);
    expect(box).toHaveLength(1);
    expect(elements(box[0]).some((node) => 'slideIndex' in node.props)).toBe(true);
  });
});
