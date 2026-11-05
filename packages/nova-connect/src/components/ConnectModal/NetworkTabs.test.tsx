import { readFileSync } from 'node:fs';
import path from 'node:path';

import { OrbitAdapter } from '@tuwaio/orbit-core';
import type { Variants } from 'framer-motion';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useEffect: vi.fn(),
  useEffectEvent: (fn: unknown) => fn,
}));

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => false,
}));

vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));

import { NetworkTabs } from './NetworkTabs';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const render = (NetworkTabs as unknown as { type: { render: (props: object, ref: null) => unknown } }).type.render;

const renderTabs = () =>
  render({ networks: [OrbitAdapter.EVM, OrbitAdapter.SOLANA], selectedAdapter: undefined, onSelect: vi.fn() }, null);

describe('NetworkTabs', () => {
  it('has no layout animation but the indicator: it would take the tabs up and down when the centered window moves', () => {
    const source = readFileSync(path.resolve(__dirname, 'NetworkTabs.tsx'), 'utf8');

    expect(source).not.toMatch(/^\s*layout$/m);
    expect(source).not.toMatch(/\blayout=/);
    expect(source).toMatch(/layoutId="indicator"/);
  });

  it('gives the name of a tab that is not selected no width, and keeps it in the flow: the width moves the other tabs', () => {
    const name = elements(renderTabs()).find((element) => 'variants' in element.props);
    const { active, inactive } = name?.props.variants as Variants as Record<string, Record<string, unknown>>;

    expect(active.width).toBe('auto');
    expect(inactive.width).toBe(0);
    expect(active.position).toBeUndefined();
    expect(inactive.position).toBeUndefined();
  });

  it('shows the name of the selected tab only', () => {
    const names = elements(renderTabs()).filter((element) => 'variants' in element.props);

    expect(names.map((element) => element.props.animate)).toEqual(['active', 'inactive', 'inactive']);
  });
});
