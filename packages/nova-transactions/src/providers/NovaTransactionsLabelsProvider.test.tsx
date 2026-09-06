import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: () => defaultLabels,
  };
});

import { NovaTransactionsLabelsProvider, useLabels } from './NovaTransactionsLabelsProvider';

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
});
