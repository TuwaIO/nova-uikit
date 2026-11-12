import { isValidElement, type ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';
import { ukrainianLabels } from '../i18n/ua';
import { chineseLabels } from '../i18n/zh';
import { VALIDATION_ERROR_CONTAINER_ID } from './NovaTransactionsErrorContext';

vi.mock('react', async () => ({
  ...(await vi.importActual<object>('react')),
  ...(await import('../testing/hookHarness')).hooks,
}));

// The hooks of nova-core come built, with the React of their own import: the one the provider calls is given here
vi.mock('@tuwaio/nova-core', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMediaQuery: () => false,
}));

const { render, unmount } = await import('../testing/hookHarness');
const { NovaTransactionsProvider } = await import('./NovaTransactionsProvider');

type Props = Parameters<typeof NovaTransactionsProvider>[0];

/** Every element (at any depth of element props) that matches. */
function findElements(node: unknown, match: (element: ReactElement) => boolean, found: ReactElement[] = []) {
  if (Array.isArray(node)) {
    for (const child of node) findElements(child, match, found);
  } else if (isValidElement(node)) {
    if (match(node)) found.push(node);
    for (const value of Object.values(node.props as Record<string, unknown>)) findElements(value, match, found);
  }
  return found;
}

/** The toast containers the provider renders, by their container ids. */
function regions(props: Partial<Props> = {}) {
  const tree = render(
    NovaTransactionsProvider as (props: Props) => unknown,
    {
      transactionsPool: {},
      closeTxTrackedModal: () => undefined,
      executeTxAction: async () => undefined,
      ...props,
    } as Props,
  );
  const containers = findElements(tree, (element) => element.type === ToastContainer).map(
    (element) => element.props as { containerId: string; 'aria-label'?: string },
  );
  return {
    count: containers.length,
    transactions: containers.find((container) => container.containerId === 'nova-transactions')?.['aria-label'],
    errors: containers.find((container) => container.containerId === VALIDATION_ERROR_CONTAINER_ID)?.['aria-label'],
  };
}

afterEach(unmount);

// The provider renders two toast containers of react-toastify, and each is a region named `Notifications Alt+T` unless
// it is given a name: two regions of a page with one name cannot be told apart by a screen reader (axe:
// `landmark-unique`, reported for `#nova-transactions` on every page of a site with the provider).
describe('the regions of the toasts', () => {
  it('have a name each, from the labels', () => {
    const found = regions();
    expect(found.count).toBe(2);
    expect(found.transactions).toBe(defaultLabels.toast.region);
    expect(found.errors).toBe(defaultLabels.validationError.region);
    expect(found.transactions).not.toBe(found.errors);
  });

  it('are named in the language of the labels, and never by one name', () => {
    for (const labels of [defaultLabels, ukrainianLabels, chineseLabels]) {
      const found = regions({ labels });
      expect(found.transactions).toBe(labels.toast.region);
      expect(found.errors).toBe(labels.validationError.region);
      expect(labels.toast.region).not.toBe(labels.validationError.region);
      // Each names the shortcut that moves the focus to its first toast, as the name of react-toastify does
      expect(labels.toast.region).toMatch(/Alt\+T$/);
      expect(labels.validationError.region).toMatch(/Alt\+T$/);
    }
  });

  it('take a label of an app in place of the default one', () => {
    const found = regions({ labels: { toast: { ...defaultLabels.toast, region: 'Payments' } } });
    expect(found.transactions).toBe('Payments');
    expect(found.errors).toBe(defaultLabels.validationError.region);
  });

  it('let the `aria-label` prop name the region of the transaction toasts', () => {
    expect(regions({ 'aria-label': 'Order updates' }).transactions).toBe('Order updates');
  });

  it('stay apart when one of the two is turned off', () => {
    const onlyErrors = regions({ features: { toasts: false } });
    expect(onlyErrors).toEqual({ count: 1, transactions: undefined, errors: defaultLabels.validationError.region });
    const onlyTransactions = regions({ features: { validationErrorToast: false } });
    expect(onlyTransactions).toEqual({ count: 1, transactions: defaultLabels.toast.region, errors: undefined });
  });
});
