import { isValidElement, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks/useNovaConnectLabels', () => ({ useNovaConnectLabels: () => defaultLabels }));

const store = {
  activeConnection: undefined,
  connectionError: undefined,
  resetConnectionError: vi.fn(),
  setConnectionError: vi.fn(),
  getAdapter: () => undefined,
};

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: typeof store) => unknown) => selector(store),
}));

import { ImpersonateForm, type ImpersonateFormProps } from './ImpersonatedForm';

type Element = ReactElement<Record<string, unknown> & { children?: unknown }>;

/** The first element in the tree with an `onChange` prop: the input. */
const findInput = (node: unknown): Element | undefined => {
  if (!isValidElement(node)) return undefined;
  const element = node as Element;
  if (element.props.onChange) return element;
  return ([] as unknown[]).concat(element.props.children).flat().map(findInput).find(Boolean);
};

const ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

describe('ImpersonateForm', () => {
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  it('validates the first change of the field, or Connect stays disabled after an address set in one go', async () => {
    vi.useFakeTimers();
    const setImpersonatedAddress = vi.fn();
    const props = { impersonatedAddress: '', setImpersonatedAddress } as ImpersonateFormProps;
    const component = (ImpersonateForm as unknown as { render: (p: ImpersonateFormProps) => unknown }).render;

    const input = findInput(render(component, props));
    (input?.props.onChange as (event: unknown) => void)({ target: { value: ADDRESS } });
    await vi.advanceTimersByTimeAsync(600);

    expect(setImpersonatedAddress).toHaveBeenCalledWith(ADDRESS);
  });
});
