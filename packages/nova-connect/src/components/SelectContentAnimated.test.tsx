import { afterEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('@radix-ui/react-select', () => ({
  Portal: 'portal',
  Content: 'content',
  ScrollUpButton: 'scroll-up',
  ScrollDownButton: 'scroll-down',
  Viewport: 'viewport',
}));

vi.mock('../hooks', () => ({ useNovaConnectLabels: () => ({ chainListContainer: 'Chains' }) }));
vi.mock('./ToTopButton', () => ({ ToTopButton: 'to-top' }));
vi.mock('./ToBottomButton', () => ({ ToBottomButton: 'to-bottom' }));

import { SelectContentAnimated } from './SelectContentAnimated';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const renderFunction = (component: unknown) => {
  let current = component as { type?: unknown; render?: unknown };
  while (current.type) current = current.type as typeof current;
  return current.render as (props: { children: string }, ref?: null) => unknown;
};

describe('SelectContentAnimated', () => {
  afterEach(unmount);

  // Owner, 2026-11-07: the frame was on the list, and the scroll arrows, next to it, stood outside the frame
  it('draws the frame around the list and its scroll buttons', () => {
    const tree = elements(render(renderFunction(SelectContentAnimated), { children: 'chains' }));
    const content = tree.find((element) => element.type === 'content')!;
    const inside = elements(content.props.children);

    expect(content.props.className).toContain('novacon:ring-1');
    expect(content.props.className).toContain('novacon:overflow-hidden');
    expect(inside.some((element) => element.type === 'scroll-up')).toBe(true);
    expect(inside.some((element) => element.type === 'scroll-down')).toBe(true);
    expect(inside.filter((element) => String(element.props.className).includes('novacon:ring-1'))).toEqual([]);
  });
});
