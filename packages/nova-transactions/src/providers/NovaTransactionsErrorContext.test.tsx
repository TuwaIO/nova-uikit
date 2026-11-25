import type { ReactElement } from 'react';
import type { ToastContentProps } from 'react-toastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast } = vi.hoisted(() => ({ toast: vi.fn() }));

vi.mock('react', async () => ({
  ...(await vi.importActual<object>('react')),
  ...(await import('../testing/hookHarness')).hooks,
  // Outside of a provider: what the context was made with
  useContext: (context: { _currentValue: unknown }) => context._currentValue,
}));
vi.mock('react-toastify', async (importActual) => ({ ...(await importActual<object>()), toast }));

const { render } = await import('../testing/hookHarness');
const { useNovaTransactionsError } = await import('./NovaTransactionsErrorContext');

/** The props of the toast an error is shown with. */
function shown(error: unknown, options?: { title?: string; message?: string }) {
  render(() => useNovaTransactionsError().showPreSubmitErrorToast(error, options), {});
  const content = toast.mock.calls[0][0] as (props: ToastContentProps) => ReactElement<Record<string, unknown>>;
  return content({} as ToastContentProps).props;
}

describe('useNovaTransactionsError', () => {
  beforeEach(() => {
    toast.mockClear();
  });

  it('shows the error in its own words', () => {
    expect(shown(new Error('Insufficient funds'))).toMatchObject({ message: 'Insufficient funds', title: undefined });
  });

  it('shows the words it is given, and keeps the error itself to copy', () => {
    const props = shown(new Error('nonce too low'), { title: 'Could not replace', message: 'Already in a block' });

    expect(props).toMatchObject({ title: 'Could not replace', message: 'Already in a block' });
    expect(props.rawError).toContain('nonce too low');
  });
});
