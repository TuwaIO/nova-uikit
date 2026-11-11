import { readFileSync } from 'node:fs';
import path from 'node:path';

import * as outline from '@tuwaio/nova-icons/24/outline';
import * as solid from '@tuwaio/nova-icons/24/solid';
import { createElement as h, isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { presence } = vi.hoisted(() => ({ presence: { initial: undefined as boolean | undefined } }));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    // The icon set without a provider (pixel), and the presence of an AnimatePresence a test sets
    useContext: (context: { _currentValue: unknown; displayName?: string }) =>
      context._currentValue && typeof context._currentValue === 'object' && 'look' in (context._currentValue as object)
        ? context._currentValue
        : presence.initial === undefined
          ? context._currentValue
          : { initial: presence.initial },
  };
});
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => false,
}));

import { ChevronArrowWithAnim } from '../components/ChevronArrowWithAnim';
import { CloseIcon } from '../components/CloseIcon';
import { CopyIcon } from '../components/CopyIcon';
import { DrawnCheck, DrawnCross } from '../components/DrawnCheck';
import { ExitIcon } from '../components/ExitIcon';
import { ExternalLinkIcon } from '../components/ExternalLinkIcon';
import { TrashIcon } from '../components/TrashIcon';
import * as art from './art';
import { type Cell, cellsOf } from './draw';

type Node = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

/**
 * The elements of a tree. The component at its top, and one it returns, are rendered (with the mocked hooks); the
 * components inside them, such as the motion paths of the classic look, are kept as elements: their hooks need a renderer.
 */
function elements(node: unknown, depth = 0): Node[] {
  if (Array.isArray(node)) return node.flatMap((child) => elements(child, depth));
  if (!isValidElement(node)) return [];
  const element = node as unknown as Node;
  // The top, and a component it returns as a whole (DrawnCheck returns its mark)
  if (depth <= 1 && typeof element.type === 'function') {
    return elements((element.type as (props: object) => unknown)(element.props), depth + 1);
  }
  if (depth === 0 && typeof element.type === 'object' && element.type && 'render' in (element.type as object)) {
    return elements(
      (element.type as { render: (props: object, ref: unknown) => unknown }).render(element.props, null),
      1,
    );
  }
  return [element, ...elements(element.props.children, depth + 1)];
}

const key = ({ x, y }: Cell) => `${x},${y}`;
const set = (cells: Cell[]) => new Set(cells.map(key));
/** The pixels a path of runs draws. */
const pixelsOfPath = (d: unknown) =>
  new Set(
    [...String(d).matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)].flatMap(([, x, y, w]) =>
      Array.from({ length: Number(w) }, (_, i) => `${Number(x) + i},${y}`),
    ),
  );
const pixelsOfIcon = (Icon: (props: object) => ReactElement) =>
  new Set(elements(Icon({})).flatMap((node) => (node.type === 'path' ? [...pixelsOfPath(node.props.d)] : [])));
const union = (...sets: Set<string>[]) => new Set(sets.flatMap((s) => [...s]));
const flipH = (cells: Cell[]) => cells.map(({ x, y }) => ({ x: 15 - x, y }));

describe('the pixel drawings of nova-core', () => {
  // A drawing that moves is split into layers: together they must stay the icon of @tuwaio/nova-icons
  it('are the icons of @tuwaio/nova-icons', () => {
    expect(set(cellsOf(art.CHECK))).toEqual(pixelsOfIcon(outline.CheckIcon));
    expect(set(cellsOf(art.CROSS))).toEqual(pixelsOfIcon(outline.XMarkIcon));
    expect(set(cellsOf(art.SHEETS))).toEqual(pixelsOfIcon(outline.DocumentDuplicateIcon));
    expect(union(set(cellsOf(art.LINK_BOX)), set(cellsOf(art.LINK_ARROW)))).toEqual(
      pixelsOfIcon(outline.ArrowTopRightOnSquareIcon),
    );
    expect(set(flipH([...cellsOf(art.EXIT_DOOR), ...cellsOf(art.EXIT_ARROW)]))).toEqual(
      pixelsOfIcon(outline.ArrowRightStartOnRectangleIcon),
    );
    expect(union(set(cellsOf(art.TRASH_LID)), set(cellsOf(art.TRASH_CAN)))).toEqual(pixelsOfIcon(outline.TrashIcon));
    const disc = set(cellsOf(art.DISC));
    const cut = set(cellsOf(art.CHECK_CUT));
    expect(new Set([...disc].filter((cell) => !cut.has(cell)))).toEqual(pixelsOfIcon(solid.CheckCircleIcon));
    for (const cell of cellsOf(art.CROSS_CUT)) expect(disc.has(key(cell))).toBe(true);
  });
});

describe('the pixel look of the parts that move', () => {
  const svgOf = (tree: unknown) => elements(tree).find((node) => node.type === 'svg')!;
  const cellsDrawn = (tree: unknown, className: string) =>
    elements(tree).filter((node) => String(node.props.className ?? '').includes(className));

  it('draws a result pixel by pixel, in the order of its strokes', () => {
    presence.initial = undefined;
    const check = cellsDrawn(h(DrawnCheck, {}), 'tuwa-drawn-px');
    expect(check.map((node) => Number((node.props.style as Record<string, number>)['--k']))).toEqual(
      check.map((_, index) => index),
    );
    expect(check.length).toBe(cellsOf(art.CHECK).length);
    expect(svgOf(h(DrawnCheck, {})).props.shapeRendering).toBe('crispEdges');
    // On a disc the mark is cut out: its pixels are drawn in the color of the page
    const onDisc = cellsDrawn(h(DrawnCross, { variant: 'disc' }), 'tuwa-drawn-px');
    expect(onDisc.length).toBe(cellsOf(art.CROSS_CUT).length);
    expect(onDisc[0].props.fill).toBe('var(--tuwa-bg-primary)');
  });

  it('shows a mark that is already there when the page opens, without drawing it', () => {
    presence.initial = false;
    expect(svgOf(h(DrawnCheck, {})).props['data-still']).toBe('');
    presence.initial = undefined;
    expect(svgOf(h(DrawnCheck, {})).props['data-still']).toBeUndefined();
  });

  it('turns the sheets of a copy into a check mark', () => {
    const copied = svgOf(h(CopyIcon, { copied: true }));
    expect(copied.props['data-copied']).toBe('');
    expect(svgOf(h(CopyIcon, {})).props['data-copied']).toBeUndefined();
    expect(cellsDrawn(h(CopyIcon, {}), 'tuwa-copy-px-check').length).toBe(cellsOf(art.CHECK).length);
    expect(cellsDrawn(h(CopyIcon, {}), 'tuwa-copy-px-sheets')).toHaveLength(1);
  });

  it('moves the arrow of a link, of an exit and the lid of the bin by one pixel', () => {
    expect(cellsDrawn(h(ExternalLinkIcon, {}), 'tuwa-link-arrow-px')).toHaveLength(1);
    expect(cellsDrawn(h(ExitIcon, {}), 'tuwa-exit-arrow-px')).toHaveLength(1);
    expect(cellsDrawn(h(TrashIcon, {}), 'tuwa-trash-lid-px')).toHaveLength(1);
    const css = readFileSync(path.resolve(__dirname, '../styles/icons.css'), 'utf8');
    expect(css).toContain('button:not(:disabled):hover .tuwa-link-arrow-px');
    expect(css).toContain('transform: translate(1px, -1px)');
  });

  it('draws the close cross and the chevron on the grid', () => {
    expect(svgOf(h(CloseIcon, { className: 'h-4 w-4' })).props).toMatchObject({
      viewBox: '0 0 16 16',
      shapeRendering: 'crispEdges',
    });
    expect(svgOf(h(ChevronArrowWithAnim, { isOpen: false })).props.viewBox).toBe('0 0 16 16');
  });

  it('keeps the classic drawings with the classic look', () => {
    expect(svgOf(h(CloseIcon, { look: 'classic' })).props.viewBox).toBe('0 0 24 24');
    expect(svgOf(h(ExternalLinkIcon, { look: 'classic' })).props.viewBox).toBe('0 0 24 24');
    expect(svgOf(h(CopyIcon, { look: 'classic' })).props.viewBox).toBe('0 0 24 24');
  });
});
