import { isValidElement, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';
import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));

import { BalanceDisplay, type BalanceDisplayProps } from './BalanceDisplay';

// `showSuccess` passed to the refresh button
function showSuccess(props: Partial<BalanceDisplayProps>): boolean {
  const element = render(BalanceDisplay as (p: BalanceDisplayProps) => unknown, {
    balance: { value: '1.5', symbol: 'ETH' },
    onRefetch: vi.fn(),
    ...props,
  }) as ReactElement<{ children: unknown[] }>;
  const refreshButton = element.props.children.filter(isValidElement)[1] as ReactElement<{ showSuccess: boolean }>;
  return refreshButton.props.showSuccess;
}

describe('BalanceDisplay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  it('shows the success indicator once after a refresh, for `successDuration`', () => {
    const customization = { config: { successDuration: 1000 } };
    expect(showSuccess({ isLoading: true, customization })).toBe(false);
    showSuccess({ isLoading: false, customization });
    // The state set during the render is read by the next render, as React does right away
    expect(showSuccess({ isLoading: false, customization })).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(showSuccess({ isLoading: false, customization })).toBe(false);

    // A new `successDuration` does not show it again
    expect(showSuccess({ isLoading: false, customization: { config: { successDuration: 2000 } } })).toBe(false);
    expect(showSuccess({ isLoading: false, customization: { config: { successDuration: 2000 } } })).toBe(false);
  });
});
