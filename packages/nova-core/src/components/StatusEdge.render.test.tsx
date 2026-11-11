import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => false,
}));

import { StatusEdge } from './StatusEdge';

type Node = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

/** The elements of a tree, depth first. */
const elementsOf = (node: unknown): Node[] => {
  if (Array.isArray(node)) return node.flatMap(elementsOf);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Node;
  return [element, ...elementsOf(element.props.children)];
};

const classOf = (node: Node) => String(node.props.className ?? '');

/** The colored layers of the edge outside its strip: a tint of the card. */
const tintsOf = (tree: unknown) => {
  const strip = elementsOf(tree).find((node) => classOf(node).includes('novacore:h-0.5'));
  const inStrip = new Set(elementsOf(strip));
  return elementsOf(tree).filter((node) => {
    const style = node.props.style as Record<string, unknown> | undefined;
    return !inStrip.has(node) && !!style && ('background' in style || 'backgroundColor' in style);
  });
};

// A result is told by the strip alone: a tint of the status over the whole card (the details of a transaction, a toast)
// was too much color. A host asks for one with `classNames.wash`
describe('the edge of a result', () => {
  it('leaves the card its own color', () => {
    for (const tone of ['success', 'error', 'neutral', 'warning'] as const) {
      expect(tintsOf(StatusEdge({ tone })), tone).toEqual([]);
    }
  });

  it('lays a layer over the card only when a host asks for it', () => {
    const tree = StatusEdge({ tone: 'success', classNames: { wash: 'tint' } });
    expect(elementsOf(tree).some((node) => classOf(node).includes('tint'))).toBe(true);
  });
});

// The glint of a wait runs past the end of the strip before it starts again: its run, in its own width, reaches the end of
// the strip. A narrower glint with the old run stopped inside the strip and jumped back
describe('the glint of a wait', () => {
  it('leaves the strip before it starts again', () => {
    const glint = elementsOf(StatusEdge({ tone: 'pending' })).find((node) =>
      classOf(node).includes('tuwa-status-glint'),
    )!;
    const [, numerator, denominator] = classOf(glint).match(/novacore:w-(\d+)\/(\d+)/)!;
    const share = Number(numerator) / Number(denominator);
    const css = readFileSync(join(__dirname, '../styles/status-edge.css'), 'utf8');
    const run = Number(css.match(/to \{\s*transform: translateX\((\d+)%\)/)![1]) / 100;
    expect(share * run).toBeGreaterThanOrEqual(1);
  });
});
