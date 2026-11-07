import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';
import { render, unmount } from '../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return {
    ...(await importOriginal<typeof import('react')>()),
    ...hooks,
    // For the reduced motion of framer-motion in the parts of the button
    useContext: (context: { _currentValue: unknown }) => context._currentValue,
  };
});

const { showPreSubmitErrorToast } = vi.hoisted(() => ({ showPreSubmitErrorToast: vi.fn() }));

vi.mock('../providers/NovaTransactionsLabelsProvider', () => ({ useLabels: () => defaultLabels }));
vi.mock('../providers/NovaTransactionsErrorContext', () => ({
  useNovaTransactionsError: () => ({ showPreSubmitErrorToast }),
}));

import { TxActionButton } from './TxActionButton';

type Button = { props: { onClick: () => Promise<void>; children: unknown } };

const press = async (action: () => Promise<void>) => {
  const props = {
    action,
    getLastTxKey: () => undefined,
    transactionsPool: {},
    walletAddress: '0xabc',
    children: 'Send',
  };
  const button = render(TxActionButton as never, props as never) as Button;
  await button.props.onClick();
  return JSON.stringify(render(TxActionButton as never, props as never));
};

describe('TxActionButton', () => {
  afterEach(() => {
    unmount();
    vi.clearAllMocks();
  });

  // A person who pressed reject saw a red Validation Error and a Failed button
  it('goes back to idle, with no toast, when the person rejected in the wallet', async () => {
    const shown = await press(() => Promise.reject(Object.assign(new Error('rejected'), { code: 4001 })));

    expect(showPreSubmitErrorToast).not.toHaveBeenCalled();
    expect(shown).toContain('Send');
  });

  it('still tells any other failure', async () => {
    const error = new Error('insufficient funds');

    const shown = await press(() => Promise.reject(error));

    expect(showPreSubmitErrorToast).toHaveBeenCalledWith(error);
    expect(shown).toContain(defaultLabels.trackedTxButton.failed);
  });
});
