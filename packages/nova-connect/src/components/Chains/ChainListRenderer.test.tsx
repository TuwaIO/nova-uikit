import { isValidElement, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));

import { ChainListRenderer, type ChainListRendererProps } from './ChainListRenderer';

type Element = ReactElement<Record<string, unknown> & { children?: unknown }>;

const childrenOf = (element: Element): Element[] =>
  ([] as unknown[]).concat(element.props.children).flat().filter(isValidElement) as Element[];

const keyEvent = (key: string) => ({ key, preventDefault: vi.fn(), ctrlKey: false, altKey: false, metaKey: false });

function renderDesktopList(props: Partial<ChainListRendererProps>) {
  const handleValueChange = vi.fn();
  const onClose = vi.fn();
  const list = render(ChainListRenderer as (p: ChainListRendererProps) => unknown, {
    chainsList: [1, 137],
    selectValue: '1',
    handleValueChange,
    getChainData: (chain) => ({ chain, formattedChainId: chain }),
    onClose,
    ...props,
  }) as Element;
  unmount();
  const [active, other] = childrenOf(list);
  return { active, other, handleValueChange, onClose };
}

// The Radix `Select.Item` rendered by an item of the desktop list
function renderSelectItem(item: Element): Element {
  const itemRender = (item.type as unknown as { render: (p: unknown) => unknown }).render;
  return render(itemRender, item.props) as Element;
}

describe('ChainListRenderer (desktop)', () => {
  afterEach(() => unmount());

  it('marks the active chain with the active indicator', () => {
    const { active, other } = renderDesktopList({});

    expect(active.props.isActive).toBe(true);
    expect(other.props.isActive).toBe(false);
    expect(renderSelectItem(active).props['aria-selected']).toBe(true);
    unmount();
    // The indicator wrapper renders the indicator for the active chain
    expect(childrenOf(active).length).toBe(2);
  });

  it('selects through the handlers on click, instead of the selection of Radix Select', () => {
    const onClick = vi.fn((originalHandler: () => void) => originalHandler());
    const onSelect = vi.fn((originalHandler: (chainId: string) => void, chainId: string) => originalHandler(chainId));
    const { other, handleValueChange, onClose } = renderDesktopList({
      customization: { handlers: { onClick, onSelect } },
    });

    const selectItem = renderSelectItem(other);
    const click = { preventDefault: vi.fn() };
    (selectItem.props.onClick as (event: unknown) => void)(click);

    expect(click.preventDefault).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledWith(expect.any(Function), {
      chainId: 137,
      chainName: expect.any(String),
      isActive: false,
    });
    expect(onSelect).toHaveBeenCalledWith(handleValueChange, '137', expect.objectContaining({ isActive: false }));
    expect(handleValueChange).toHaveBeenCalledWith('137');
    expect(onClose).toHaveBeenCalled();
  });

  it('selects on Enter, and keeps Space for the type-ahead search', () => {
    const { other, handleValueChange } = renderDesktopList({});
    const onKeyDown = other.props.onKeyDown as (event: unknown) => void;

    const letter = keyEvent('p');
    onKeyDown(letter);
    const space = keyEvent(' ');
    onKeyDown(space);
    expect(space.preventDefault).not.toHaveBeenCalled();
    expect(handleValueChange).not.toHaveBeenCalled();

    const enter = keyEvent('Enter');
    onKeyDown(enter);
    expect(enter.preventDefault).toHaveBeenCalled();
    expect(handleValueChange).toHaveBeenCalledWith('137');
  });
});
