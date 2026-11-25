import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks', () => ({ useNovaConnectLabels: () => defaultLabels }));

import { ChainListRenderer } from './ChainListRenderer';
import { ScrollableChainList, type ScrollableChainListProps } from './ScrollableChainList';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const renderList = () =>
  elements(
    render(ScrollableChainList as (props: ScrollableChainListProps) => unknown, {
      chainsList: [1, 137],
      selectValue: '1',
      handleValueChange: vi.fn(),
      getChainData: (chain) => ({ chain, formattedChainId: chain }),
      onClose: vi.fn(),
    }),
  );

describe('ScrollableChainList', () => {
  afterEach(() => unmount());

  // The box that scrolls was a listbox around the listbox of the chains, and one without options while the list is loading
  it('scrolls the listbox of the chains and is not one itself', () => {
    const tree = renderList();
    expect(tree.filter((node) => node.props.role === 'listbox')).toEqual([]);
    const list = tree.find((node) => node.type === ChainListRenderer)!;
    expect(list.props.isMobile).toBe(true);
    // Still reached by the keyboard, which scrolls it by a page
    const scroller = tree.find((node) => typeof node.props.onKeyDown === 'function')!;
    expect(scroller.props.role).toBe('group');
    expect(scroller.props.tabIndex).toBe(0);
    expect(scroller.props['aria-label']).toBe(defaultLabels.selectChain);
  });
});
