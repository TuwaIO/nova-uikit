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
  }),
}));
vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState.value),
}));

import { ErrorsProvider, type ErrorsProviderProps } from './ErrorsProvider';

const rejected = () => ({ message: 'User rejected the request' });
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
      connectionError: rejected(),
      switchNetworkError: { message: 'The wallet refused the chain' },
    };

    renderProvider();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(titleOfLastToast()).toBe('Switch error');
  });

  it('tells nothing while connected for a connection error alone', () => {
    storeState.value = { activeConnection: { isConnected: true }, connectionError: rejected() };

    renderProvider();

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('tells a connection error without a wallet', () => {
    storeState.value = { connectionError: rejected() };

    renderProvider();

    expect(titleOfLastToast()).toBe('Connection error');
  });

  // It dismissed its own toast and then found the error already shown, so nothing was on screen
  it('keeps the toast of an error that comes again', () => {
    storeState.value = { connectionError: rejected() };
    renderProvider();
    toast.dismiss.mockClear();

    storeState.value = { connectionError: rejected() };
    renderProvider();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.dismiss).not.toHaveBeenCalled();
  });

  // With inline customization every render looked new, and the toast the user had closed came back
  it('does not bring back a toast the user closed', () => {
    const error = rejected();
    storeState.value = { connectionError: error };
    renderProvider({ customization: {} });
    onCloseOfLastToast()();

    renderProvider({ customization: {} });

    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('tells the next failure after the user closed the toast', () => {
    storeState.value = { connectionError: rejected() };
    renderProvider();
    onCloseOfLastToast()();

    storeState.value = { connectionError: rejected() };
    renderProvider();

    expect(toast.error).toHaveBeenCalledTimes(2);
  });
});
