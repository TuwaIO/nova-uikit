import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

const toast = vi.hoisted(() => ({ error: vi.fn(), dismiss: vi.fn() }));
const storeState = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock('react-toastify', () => ({ toast, ToastContainer: () => null, Bounce: {} }));
vi.mock('@tuwaio/nova-core', () => ({ ToastCloseButton: () => null }));
vi.mock('../components', () => ({ ToastError: () => null }));
vi.mock('../hooks/useNovaConnectLabels', () => ({
  useNovaConnectLabels: () => ({
    connectionError: 'Connection error',
    errorWhenChainSwitching: 'Switch error',
    somethingWentWrong: 'Something went wrong',
    closeToast: 'Закрити сповіщення',
  }),
}));
vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState.value),
}));

import { ErrorsProvider, type ErrorsProviderProps } from './ErrorsProvider';

const failed = () => ({ message: 'The wallet is not installed', raw: {} });
/** A request the person declined in the wallet, as the store keeps it. */
const declined = () => ({ message: 'User rejected the request.', raw: { code: 4001 } });
const titleOfLastToast = () => (toast.error.mock.lastCall?.[0] as { props: { title: string } }).props.title;
const onCloseOfLastToast = () => (toast.error.mock.lastCall?.[1] as { onClose: () => void }).onClose;
const renderProvider = (props: ErrorsProviderProps = {}) => render(ErrorsProvider, props);

describe('ErrorsProvider', () => {
  beforeEach(() => {
    storeState.value = { activeConnection: undefined, connectionError: undefined, switchNetworkError: undefined };
  });

  afterEach(() => {
    unmount();
    vi.clearAllMocks();
  });

  // The toast of the failed switch never came, as the connection error told by the connect window stayed in the store
  it('tells a switch error while connected, over a leftover connection error', () => {
    storeState.value = {
      activeConnection: { isConnected: true },
      connectionError: failed(),
      switchNetworkError: { message: 'The wallet refused the chain' },
    };

    renderProvider();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(titleOfLastToast()).toBe('Switch error');
  });

  // The cross said "Close toast notification" in every language
  it('names the cross of its toasts in the language of the labels, and as the app names it', () => {
    const crossOf = (props: ErrorsProviderProps = {}) => {
      const { closeButton } = (renderProvider(props) as ReactElement<{ closeButton: (props: object) => ReactElement }>)
        .props;
      const { ariaLabel, title } = closeButton({}).props as { ariaLabel?: string; title?: string };
      unmount();
      return [ariaLabel, title];
    };
    expect(crossOf()).toEqual(['Закрити сповіщення', 'Закрити сповіщення']);
    expect(crossOf({ customization: { toastCloseButton: { ariaLabel: 'Hide', title: 'Hide it' } } })).toEqual([
      'Hide',
      'Hide it',
    ]);
  });

  it('tells nothing while connected for a connection error alone', () => {
    storeState.value = { activeConnection: { isConnected: true }, connectionError: failed() };

    renderProvider();

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('tells a connection error without a wallet', () => {
    storeState.value = { connectionError: failed() };

    renderProvider();

    expect(titleOfLastToast()).toBe('Connection error');
  });

  // The owner's pass of the Quasar stand: a sign-in declined in MetaMask showed the connect window's error and, over it, a
  // toast with viem's English message. Declining is the person's own action: the connect window says it in their words
  it('toasts no request the person declined in the wallet: the connection, or a network switch', () => {
    storeState.value = { connectionError: declined() };
    renderProvider();
    expect(toast.error).not.toHaveBeenCalled();

    unmount();
    storeState.value = { activeConnection: { isConnected: true }, switchNetworkError: declined() };
    renderProvider();
    expect(toast.error).not.toHaveBeenCalled();
  });

  // It dismissed its own toast and then found the error already shown, so nothing was on screen
  it('keeps the toast of an error that comes again', () => {
    storeState.value = { connectionError: failed() };
    renderProvider();
    toast.dismiss.mockClear();

    storeState.value = { connectionError: failed() };
    renderProvider();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.dismiss).not.toHaveBeenCalled();
  });

  // With inline customization every render looked new, and the toast the user had closed came back
  it('does not bring back a toast the user closed', () => {
    const error = failed();
    storeState.value = { connectionError: error };
    renderProvider({ customization: {} });
    onCloseOfLastToast()();

    renderProvider({ customization: {} });

    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('tells the next failure after the user closed the toast', () => {
    storeState.value = { connectionError: failed() };
    renderProvider();
    onCloseOfLastToast()();

    storeState.value = { connectionError: failed() };
    renderProvider();

    expect(toast.error).toHaveBeenCalledTimes(2);
  });
});
