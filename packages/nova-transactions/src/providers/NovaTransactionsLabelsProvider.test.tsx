import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

const cleanups: (() => void)[] = [];

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: () => null,
    // Effects run at once and stores read at once: these tests call the hooks with no renderer
    useEffect: (effect: () => void | (() => void)) => {
      cleanups.push(effect() ?? (() => undefined));
    },
    useSyncExternalStore: (_subscribe: unknown, read: () => unknown) => read(),
  };
});

import { NovaTransactionsLabelsProvider, useLabels, useOfferLabels } from './NovaTransactionsLabelsProvider';

describe('NovaTransactionsLabelsProvider & useLabels', () => {
  it('creates provider element with specified labels value', () => {
    const customLabels = {
      ...defaultLabels,
      trackingModal: {
        ...defaultLabels.trackingModal,
        title: 'Custom Transaction Modal',
      },
    };

    const el = NovaTransactionsLabelsProvider({
      labels: customLabels,
      children: 'Content',
    }) as ReactElement<{ value: typeof customLabels; children: unknown }>;

    expect(el).toBeDefined();
    expect(el.props.value.trackingModal.title).toBe('Custom Transaction Modal');
    expect(el.props.children).toBe('Content');
  });

  it('useLabels returns default labels context fallback', () => {
    const labels = useLabels();
    expect(labels).toBeDefined();
    expect(labels.hashLabels.default).toBe(defaultLabels.hashLabels.default);
  });

  // The provider has no children, and the wallet window of Nova Connect renders outside it: the history and the details
  // there read English in a Ukrainian app
  it('what renders outside a provider takes the labels of the mounted provider, until it leaves', () => {
    const ukrainian = { ...defaultLabels, trackingModal: { ...defaultLabels.trackingModal, title: 'Транзакція' } };

    expect(useLabels()).toBe(defaultLabels);
    useOfferLabels(ukrainian);
    expect(useLabels()).toBe(ukrainian);

    cleanups.pop()?.();
    expect(useLabels()).toBe(defaultLabels);
  });

  it('a provider that left does not take away the labels of the one mounted after it', () => {
    const first = { ...defaultLabels };
    const second = { ...defaultLabels };

    useOfferLabels(first);
    const firstLeaves = cleanups.pop();
    useOfferLabels(second);
    firstLeaves?.();
    expect(useLabels()).toBe(second);

    cleanups.pop()?.();
  });
});
