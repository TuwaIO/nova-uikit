import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';
import { RecentBadge } from './RecentBadge';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});
vi.mock('../../hooks', () => ({ useNovaConnectLabels: () => defaultLabels }));
vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));

// The "Recent" badge draws the eye to the wallet of the last visit with a light running along its frame. It was still for a
// while (paper and ink), and the light is back by default; `animated={false}` and reduced motion keep the frame still

type Render = (props: Record<string, unknown>, ref?: null) => unknown;
type Element = { props: { children?: unknown; animated?: boolean } };

// The render function of the badge, a `forwardRef` inside `memo`
const renderBadge = (RecentBadge as unknown as { type: { render: Render } }).type.render;

/** Whether the frame of the rendered badge runs its light. */
function runsItsLight(props: Record<string, unknown>) {
  const container = render(renderBadge, props) as Element;
  const parts = [container.props.children].flat() as Element[];
  return parts.find((part) => part && typeof part.props?.animated === 'boolean')?.props.animated;
}

describe('the Recent badge', () => {
  afterEach(() => unmount());

  it('runs a light along its frame by default', () => {
    expect(runsItsLight({})).toBe(true);
  });

  it('keeps its frame still when asked, by the prop or the customization', () => {
    expect(runsItsLight({ animated: false })).toBe(false);
    unmount();
    expect(runsItsLight({ customization: { config: { animated: false } } })).toBe(false);
  });
});
