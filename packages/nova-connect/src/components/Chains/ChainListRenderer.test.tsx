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

function renderList(props: Partial<ChainListRendererProps>): Element {
  const list = render(ChainListRenderer as (p: ChainListRendererProps) => unknown, {
    chainsList: [1, 137],
    selectValue: '1',
    handleValueChange: vi.fn(),
    getChainData: (chain) => ({ chain, formattedChainId: chain }),
    onClose: vi.fn(),
    ...props,
  }) as Element;
  unmount();
  return list;
}

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

  // A name in two lines, as with `Arbitrum Sepolia Testnet`, squeezed the icon into an oval
  it('keeps the size of the icon however long the name of the chain', () => {
    const { other } = renderDesktopList({});
    const findContent = (element: Element): Element | undefined =>
      'icon' in element.props ? element : childrenOf(element).map(findContent).find(Boolean);
    const content = findContent(renderSelectItem(other))!;

    const drawn = (content.type as (props: unknown) => Element)(content.props);

    expect(JSON.stringify(drawn)).toContain('novacon:shrink-0');
  });
});

// The list stood as a listbox inside another one: the options belonged to neither for a screen reader, and the name of the list
// was said twice
describe('ChainListRenderer, as a list', () => {
  afterEach(() => unmount());

  it('is the listbox of the mobile dialog', () => {
    const list = renderList({ isMobile: true });
    expect(list.props.role).toBe('listbox');
    expect(list.props['aria-label']).toBe(defaultLabels.selectChain);
    expect(renderList({ isMobile: true, 'aria-label': 'Networks' }).props['aria-label']).toBe('Networks');
  });

  it('is a part of the listbox of Radix Select on desktop', () => {
    const list = renderList({});
    expect(list.props.role).toBe('presentation');
    expect(list.props['aria-label']).toBeUndefined();
  });

  it('is a named group of that listbox with a name of its own', () => {
    const list = renderList({ 'aria-label': 'Networks' });
    expect(list.props.role).toBe('group');
    expect(list.props['aria-label']).toBe('Networks');
  });

  // Its words on the screen are "Ethereum" and "Connected", and its name had only the first
  it.each([
    ['mobile', true],
    ['desktop', false],
  ])('%s: the name of the active chain says that it is connected', (_, isMobile) => {
    const [active, other] = childrenOf(renderList({ isMobile }));
    expect(active.props['aria-label']).toBe(`${defaultLabels.chainOption}: Ethereum. ${defaultLabels.connected}`);
    expect(other.props['aria-label']).toBe(`${defaultLabels.chainOption}: Polygon`);
  });
});
