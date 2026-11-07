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
  activeConnection: undefined as { isConnected: boolean } | undefined,
  connectionError: undefined,
  resetConnectionError: vi.fn(),
  setConnectionError: vi.fn(),
  getAdapter: (() => undefined) as () => unknown,
};

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: typeof store) => unknown) => selector(store),
}));

import { OrbitAdapter } from '@tuwaio/orbit-core';

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

  describe('with names', () => {
    const OTHER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const component = (ImpersonateForm as unknown as { render: (p: ImpersonateFormProps) => unknown }).render;
    const type = (props: ImpersonateFormProps, value: string) =>
      (findInput(render(component, props))?.props.onChange as (event: unknown) => void)({ target: { value } });

    afterEach(() => {
      store.getAdapter = () => undefined;
      store.activeConnection = undefined;
      store.setConnectionError.mockClear();
    });

    // `a.eth` answered after `b.eth`: the field said b.eth, and Connect impersonated the address of a.eth
    it('takes the name in the field, not the one that answered last', async () => {
      vi.useFakeTimers();
      let answerFirst: (address: string) => void = () => undefined;
      const getAddress = vi.fn((name: string) =>
        name === 'a.eth' ? new Promise<string>((resolve) => (answerFirst = resolve)) : Promise.resolve(OTHER),
      );
      store.getAdapter = () => ({ getAddress, getName: vi.fn() });
      const setImpersonatedAddress = vi.fn();
      const props = {
        impersonatedAddress: '',
        setImpersonatedAddress,
        selectedAdapter: OrbitAdapter.EVM,
      } as ImpersonateFormProps;

      type(props, 'a.eth');
      await vi.advanceTimersByTimeAsync(600);
      type(props, 'b.eth');
      await vi.advanceTimersByTimeAsync(600);
      answerFirst(ADDRESS);
      await vi.advanceTimersByTimeAsync(0);

      expect(setImpersonatedAddress).toHaveBeenLastCalledWith(OTHER);
    });

    // While the new name was looked up, Connect impersonated the address of the old one
    it('forgets the resolved address as soon as the text changes', () => {
      vi.useFakeTimers();
      const setImpersonatedAddress = vi.fn();
      const props = { impersonatedAddress: ADDRESS, setImpersonatedAddress } as ImpersonateFormProps;

      type(props, 'typo.eth');

      expect(setImpersonatedAddress).toHaveBeenLastCalledWith('');
    });

    // The name passed, and Connect then did nothing and said nothing
    it('tells that a wallet is connected for a name as well', async () => {
      vi.useFakeTimers();
      store.activeConnection = { isConnected: true };
      store.getAdapter = () => ({ getAddress: vi.fn(), getName: vi.fn() });
      const props = {
        impersonatedAddress: '',
        setImpersonatedAddress: vi.fn(),
        selectedAdapter: OrbitAdapter.EVM,
      } as ImpersonateFormProps;

      type(props, 'a.eth');
      await vi.advanceTimersByTimeAsync(600);

      expect(store.setConnectionError).toHaveBeenCalledWith(
        expect.objectContaining({ message: defaultLabels.impersonateAddressConnected }),
      );
    });
  });
});
