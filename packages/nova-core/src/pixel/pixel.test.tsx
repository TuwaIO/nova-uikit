import { readFileSync } from 'node:fs';
import path from 'node:path';

import { pixelFlight } from '@tuwaio/nova-icons';
import * as outline from '@tuwaio/nova-icons/24/outline';
import * as solid from '@tuwaio/nova-icons/24/solid';
import { createElement as h, isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { presence, slots } = vi.hoisted(() => ({
  presence: { initial: undefined as boolean | undefined },
  // The state of one mounted component across its renders: a test clears it to mount a new one
  slots: { values: [] as unknown[], next: 0 },
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: (initial: unknown) => {
      const index = slots.next++;
      if (!(index in slots.values))
        slots.values[index] = typeof initial === 'function' ? (initial as () => unknown)() : initial;
      return [slots.values[index], () => undefined];
    },
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

  // Not lit up in place: the mark assembles from its pixels, each flying in from a spot nearby (`pixelFlight` of
  // @tuwaio/nova-icons, the one motion of every pixel drawing of Nova)
  it('assembles a result from its pixels', () => {
    presence.initial = undefined;
    const check = cellsDrawn(h(DrawnCheck, {}), 'tuwa-drawn-px');
    for (const node of check) {
      expect(node.props['data-px']).toBe('');
      expect(node.props.style).toEqual(pixelFlight(Number(node.props.x), Number(node.props.y)));
    }
    expect(check.length).toBe(cellsOf(art.CHECK).length);
    expect(svgOf(h(DrawnCheck, {})).props.shapeRendering).toBe('crispEdges');
    expect(svgOf(h(DrawnCheck, {})).props['data-motion']).toBe('assemble');
    // On a disc the mark is cut out: its pixels are drawn in the color of the page
    const onDisc = cellsDrawn(h(DrawnCross, { variant: 'disc' }), 'tuwa-drawn-px');
    expect(onDisc.length).toBe(cellsOf(art.CROSS_CUT).length);
    expect(onDisc[0].props.fill).toBe('var(--tuwa-bg-primary)');
  });

  it('shows a mark that is already there when the page opens, without drawing it', () => {
    const mount = () => {
      slots.values = [];
      slots.next = 0;
    };
    const render = () => {
      slots.next = 0;
      return svgOf(h(DrawnCheck, {})).props['data-motion'];
    };
    mount();
    presence.initial = false;
    expect(render()).toBeUndefined();
    // On its way out, framer-motion gives the presence again without `initial`: the mark stays still, not drawn again
    presence.initial = undefined;
    expect(render()).toBeUndefined();
    mount();
    expect(render()).toBe('assemble');
  });

  it('turns the sheets of a copy into a check mark, which assembles from its pixels', () => {
    const copied = svgOf(h(CopyIcon, { copied: true }));
    expect(copied.props['data-copied']).toBe('');
    expect(copied.props['data-motion']).toBe('assemble');
    expect(svgOf(h(CopyIcon, {})).props['data-copied']).toBeUndefined();
    expect(svgOf(h(CopyIcon, {})).props['data-motion']).toBeUndefined();
    for (const node of cellsDrawn(h(CopyIcon, { copied: true }), 'tuwa-copy-px-check')) {
      expect(node.props.style).toEqual(pixelFlight(Number(node.props.x), Number(node.props.y)));
    }
    expect(cellsDrawn(h(CopyIcon, {}), 'tuwa-copy-px-check').length).toBe(cellsOf(art.CHECK).length);
    expect(cellsDrawn(h(CopyIcon, {}), 'tuwa-copy-px-sheets')).toHaveLength(1);
  });

  it('moves the arrow of a link, of an exit and the lid of the bin by two pixels', () => {
    expect(cellsDrawn(h(ExternalLinkIcon, {}), 'tuwa-link-arrow-px')).toHaveLength(1);
    expect(cellsDrawn(h(ExitIcon, {}), 'tuwa-exit-arrow-px')).toHaveLength(1);
    expect(cellsDrawn(h(TrashIcon, {}), 'tuwa-trash-lid-px')).toHaveLength(1);
    const css = readFileSync(path.resolve(__dirname, '../styles/icons.css'), 'utf8');
    expect(css).toContain('button:not(:disabled):hover .tuwa-link-arrow-px');
    expect(css).toContain('transform: translate(2px, -2px)');
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

// Found in a browser: Chrome ends a one-shot animation a hair short of its end (progress 0.9999…), and step-end
// then keeps its first frame: pixels that should have appeared stayed hidden for good. One-shot animations are linear; only
// the endless ones step
describe('the stylesheets of Nova', () => {
  const sheets = [
    '../styles/icons.css',
    '../styles/quasar-loader.css',
    '../../../nova-connect/src/styles/app.css',
    '../../../nova-transactions/src/styles/app.css',
    '../../../nova-icons/motion.css',
  ].map((file) => readFileSync(path.resolve(__dirname, file), 'utf8'));

  it('step only through endless animations', () => {
    for (const css of sheets) {
      for (const [declaration] of css.matchAll(/animation:[^;]*;/g)) {
        if (/step-end|steps\(/.test(declaration)) expect(declaration, declaration).toContain('infinite');
      }
    }
  });
});

// Under the pointer the icon of a link, of an exit and of a bin move smoothly, by two pixels of the grid (a step of one
// pixel went unseen), and take the color of what they do: the accent for a link, red for an exit or a bin
describe('the icons of actions under the pointer', () => {
  const css = readFileSync(path.resolve(__dirname, '../styles/icons.css'), 'utf8');
  const unlayered = css.slice(css.indexOf('/* Under the pointer an icon of an action'));
  const svgOf = (tree: unknown) => elements(tree).find((node) => node.type === 'svg')!;

  it('move smoothly, never in a step', () => {
    for (const part of ['tuwa-link-arrow-px', 'tuwa-exit-arrow-px', 'tuwa-trash-lid-px']) {
      const rule = css.slice(css.indexOf(`.${part}`), css.indexOf('}', css.indexOf(`.${part}`)));
      expect(rule, part).not.toMatch(/step-end|steps\(/);
    }
  });

  it('take the color of their action, over the classes a host gives them', () => {
    expect(unlayered).toMatch(/\.tuwa-link-icon \{\s*color: var\(--tuwa-text-accent\)/);
    expect(unlayered).toMatch(/\.tuwa-exit-icon,[^{]*\.tuwa-trash-icon \{\s*color: var\(--tuwa-error-icon\)/);
  });

  // On a filled button the icon keeps the color of its label: the accent on the accent read as nothing
  it('keep their color on a filled button (`tuwa-solid`)', () => {
    const selectors = unlayered
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('{')
      .slice(0, -1)
      .flatMap((block) => block.slice(block.lastIndexOf('}') + 1).split(','))
      .map((selector) => selector.trim())
      .filter(Boolean);
    expect(selectors.length).toBeGreaterThan(8);
    for (const selector of selectors) expect(selector, selector).toMatch(/^(a|button):not\(\.tuwa-solid\)/);
  });

  it('carry the class of their action in both looks', () => {
    for (const [Icon, name] of [
      [ExternalLinkIcon, 'tuwa-link-icon'],
      [ExitIcon, 'tuwa-exit-icon'],
      [TrashIcon, 'tuwa-trash-icon'],
    ] as const) {
      for (const look of ['pixel', 'classic'] as const) {
        expect(String(svgOf(h(Icon, { look })).props.className), `${name} ${look}`).toContain(name);
      }
    }
  });
});
