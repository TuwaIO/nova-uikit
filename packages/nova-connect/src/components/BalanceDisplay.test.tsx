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

  // A failed refresh drew a check, as if it had worked
  it('shows no success after a refresh that left no balance', () => {
    showSuccess({ isLoading: true, balance: { value: '1.5', symbol: 'ETH' } });
    const after = { isLoading: false, balance: null };
    render(BalanceDisplay as (p: BalanceDisplayProps) => unknown, { onRefetch: vi.fn(), ...after });

    expect(showSuccess({ isLoading: false })).toBe(false);
  });

  // The loader in a line of its own made the button taller for as long as it ran, and it looked bigger than the icon
  it('keeps one size for the icon and the loader of the refresh button', () => {
    const buttonWhen = (isLoading: boolean) => {
      const tree = render(BalanceDisplay as (p: BalanceDisplayProps) => unknown, {
        balance: { value: '0', symbol: 'BNB' },
        isLoading,
        onRefetch: vi.fn(),
      }) as ReactElement<{ children: unknown[] }>;
      const button = tree.props.children.filter(isValidElement)[1] as ReactElement & {
        type: (props: unknown) => unknown;
      };
      return JSON.stringify(button.type(button.props));
    };

    expect(buttonWhen(false)).toContain('novacon:flex novacon:h-4 novacon:w-4');
    const loading = buttonWhen(true);
    expect(loading).toContain('novacon:flex novacon:h-4 novacon:w-4');
    expect(loading).toContain('"size":14');
  });
});
