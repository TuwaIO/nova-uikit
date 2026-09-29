import { OrbitAdapter } from '@tuwaio/orbit-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks', () => ({ useNovaConnectLabels: () => defaultLabels }));
vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));
vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ connectionError: undefined }),
}));

import { Connecting } from './Connecting';
import { Disclaimer } from './Disclaimer';
import { GetWallet } from './GetWallet';
import { RecentBadge } from './RecentBadge';

type Render<P> = (props: P, ref?: null) => unknown;

// The render function of a `forwardRef` component, also inside `memo`
function renderFunction<P>(component: unknown): Render<P> {
  const inner = (component as { type?: unknown }).type ?? component;
  return (inner as { render: Render<P> }).render;
}

describe('handlers of mount and unmount', () => {
  afterEach(() => unmount());

  it.each([
    ['Disclaimer', renderFunction(Disclaimer), { title: 'Title', description: 'Text', learnMoreAction: 'https://a.b' }],
    ['GetWallet', renderFunction(GetWallet), {}],
    ['RecentBadge', renderFunction(RecentBadge), {}],
  ])('%s: a new handlers object on every render does not re-run the mount effect', (_, component, props) => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const renderWithNewHandlers = () =>
      render(component as Render<Record<string, unknown>>, {
        ...props,
        customization: { handlers: { onMount: () => onMount(), onUnmount: () => onUnmount() } },
      });

    renderWithNewHandlers();
    renderWithNewHandlers();
    renderWithNewHandlers();
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onUnmount).not.toHaveBeenCalled();

    unmount();
    expect(onUnmount).toHaveBeenCalledTimes(1);
  });

  it('Connecting: onCleanup runs on unmount only, not when a new handlers object is passed', () => {
    const onCleanup = vi.fn();
    const renderWithNewHandlers = () =>
      render(renderFunction(Connecting), {
        activeConnector: 'metamask',
        selectedAdapter: OrbitAdapter.EVM,
        connectors: [],
        customization: { handlers: { onCleanup: (data: unknown) => onCleanup(data) } },
      });

    renderWithNewHandlers();
    renderWithNewHandlers();
    expect(onCleanup).not.toHaveBeenCalled();

    unmount();
    expect(onCleanup).toHaveBeenCalledTimes(1);
  });
});
