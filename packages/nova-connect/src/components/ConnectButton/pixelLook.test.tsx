import { describe, expect, it, vi } from 'vitest';

const icons = vi.hoisted(() => ({ look: 'pixel' as 'pixel' | 'classic' }));
const marks = vi.hoisted(() => ({
  DrawnCheck: (props: object) => ({ mark: 'check', props }),
  DrawnCross: (props: object) => ({ mark: 'cross', props }),
  NovaSetIcon: (props: object) => ({ mark: 'set', props }),
}));

vi.mock('@tuwaio/nova-core', () => ({ ...marks, useNovaIcons: () => icons }));
vi.mock('../../hooks/useNovaConnectLabels', () => ({
  useNovaConnectLabels: () => ({
    successIcon: 'Success',
    errorIcon: 'Error',
    replacedIcon: 'Replaced',
    statusIcon: 'Status',
    connectWallet: 'Connect',
  }),
}));
vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: { activeConnection: undefined }) => unknown) =>
    selector({ activeConnection: undefined }),
}));

import { DEFAULT_STATUS_PATHS, StatusIcon } from './StatusIcon';
import { WaitForConnectionContent } from './WaitForConnectionContent';

type Node = { type?: unknown; props?: Record<string, unknown> & { children?: unknown } };

/**
 * The elements of a tree, the components of nova-core kept as they are, with the elements passed in props too (the content of
 * the wait for a connection takes its icon as a prop).
 */
const flatten = (node: unknown): Node[] => {
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Node;
  return [element, ...Object.values(element.props ?? {}).flatMap(flatten)];
};
const render = (Component: unknown, props: object) =>
  flatten((Component as { render: (props: object, ref: null) => unknown }).render(props, null));
const markOf = (nodes: Node[], component: (props: object) => unknown) => nodes.find((node) => node.type === component);

describe('the pixel look of the connect button', () => {
  // What Nova draws has a pixel variant; the status marks assemble from their pixels
  it('draws the status of a transaction with the pixel marks of nova-core', () => {
    icons.look = 'pixel';
    expect(
      markOf(
        render(StatusIcon, { txStatus: 'succeed', colorVar: 'success', children: DEFAULT_STATUS_PATHS.succeed }),
        marks.DrawnCheck,
      ),
    ).toBeDefined();
    expect(
      markOf(
        render(StatusIcon, { txStatus: 'failed', colorVar: 'error', children: DEFAULT_STATUS_PATHS.failed }),
        marks.DrawnCross,
      ),
    ).toBeDefined();
    const replaced = markOf(
      render(StatusIcon, { txStatus: 'replaced', colorVar: 'text', children: DEFAULT_STATUS_PATHS.replaced }),
      marks.NovaSetIcon,
    );
    expect(replaced?.props).toMatchObject({ solid: 'ArrowPathIcon', motion: 'assemble' });
  });

  it('keeps the drawn path with the classic look, and a customized svg in any look', () => {
    icons.look = 'classic';
    expect(
      markOf(
        render(StatusIcon, { txStatus: 'succeed', colorVar: 'success', children: DEFAULT_STATUS_PATHS.succeed }),
        marks.DrawnCheck,
      ),
    ).toBeUndefined();
    icons.look = 'pixel';
    const custom = render(StatusIcon, {
      txStatus: 'succeed',
      colorVar: 'success',
      children: DEFAULT_STATUS_PATHS.succeed,
      customization: { svg: { viewBox: '0 0 20 20' } },
    });
    expect(markOf(custom, marks.DrawnCheck)).toBeUndefined();
  });

  // A customization of the path, or a path of one's own, is the classic drawing in any look: it would be lost otherwise
  it('keeps a path given by the app and every option of the path in the pixel look', () => {
    icons.look = 'pixel';
    const status = (props: object) => render(StatusIcon, { txStatus: 'succeed', colorVar: 'success', ...props });
    expect(markOf(status({ children: DEFAULT_STATUS_PATHS.succeed }), marks.DrawnCheck)).toBeDefined();
    expect(markOf(status({ children: 'M1 1l2 2' }), marks.DrawnCheck)).toBeUndefined();
    for (const customization of [
      { components: { Path: () => null } },
      { classNames: { path: () => 'p' } },
      { variants: { path: {} } },
      { animation: { path: { duration: 1 } } },
    ]) {
      expect(
        markOf(status({ children: DEFAULT_STATUS_PATHS.succeed, customization }), marks.DrawnCheck),
      ).toBeUndefined();
      expect(markOf(render(WaitForConnectionContent, { customization }), marks.NovaSetIcon)).toBeUndefined();
    }
  });

  it('gathers the pixels of the wallet while it waits for a connection, still when animations are off', () => {
    icons.look = 'pixel';
    const wallet = markOf(render(WaitForConnectionContent, {}), marks.NovaSetIcon);
    expect(wallet?.props).toMatchObject({ outline: 'WalletIcon', motion: 'assemble' });
    const still = markOf(
      render(WaitForConnectionContent, { customization: { config: { disableAnimation: true } } }),
      marks.NovaSetIcon,
    );
    expect(still?.props?.motion).toBeUndefined();
  });
});
