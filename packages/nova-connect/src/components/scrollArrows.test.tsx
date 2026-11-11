import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';
import { render } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});
vi.mock('../hooks', () => ({ useNovaConnectLabels: () => defaultLabels }));
import { ToBottomButton } from './ToBottomButton';
import { ToTopButton } from './ToTopButton';

type Node = { type: unknown; props?: Record<string, unknown> & { children?: unknown } };

/** The elements of a tree, depth first. */
const elementsOf = (node: unknown): Node[] => {
  if (Array.isArray(node)) return node.flatMap(elementsOf);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Node;
  return [element, ...elementsOf(element.props?.children)];
};

const buttonOf = (tree: unknown) =>
  elementsOf(tree).find((node) => String(node.props?.className ?? '').includes('novacon:h-6'))!;

// The arrows that scroll a list of chains are cells of it too: a line of 1 px parts each one from the rows, as the rows
// are parted from each other
describe('the arrows of a scrolling list', () => {
  it('are parted from the list by a line of 1 px', () => {
    const render$ = (component: unknown) =>
      String(buttonOf(render((component as { render: (p: object, r?: null) => unknown }).render, {})).props!.className);
    expect(render$(ToTopButton)).toContain('novacon:border-b');
    expect(render$(ToBottomButton)).toContain('novacon:border-t');
  });
});
