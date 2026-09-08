import { TransactionStatus } from '@tuwaio/pulsar-core';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { StatusAwareText } from './StatusAwareText';

describe('StatusAwareText component', () => {
  it('renders static string source', () => {
    const el = StatusAwareText({
      source: 'Transaction Pending',
      variant: 'title',
    }) as ReactElement<{ children: string; className: string }>;

    expect(el).not.toBeNull();
    expect(el.props.children).toBe('Transaction Pending');
    expect(el.props.className).toContain('novatx:font-mono');
  });

  it('selects correct array element based on transaction status', () => {
    const statusMessages = ['Submitting...', 'Success!', 'Failed!', 'Replaced!'] as const;

    const pendingEl = StatusAwareText({
      source: statusMessages,
      txStatus: undefined,
      variant: 'description',
    }) as ReactElement<{ children: string }>;
    expect(pendingEl.props.children).toBe('Submitting...');

    const successEl = StatusAwareText({
      source: statusMessages,
      txStatus: TransactionStatus.Success,
      variant: 'description',
    }) as ReactElement<{ children: string }>;
    expect(successEl.props.children).toBe('Success!');

    const failedEl = StatusAwareText({
      source: statusMessages,
      txStatus: TransactionStatus.Failed,
      variant: 'description',
    }) as ReactElement<{ children: string }>;
    expect(failedEl.props.children).toBe('Failed!');

    const replacedEl = StatusAwareText({
      source: statusMessages,
      txStatus: TransactionStatus.Replaced,
      variant: 'description',
    }) as ReactElement<{ children: string }>;
    expect(replacedEl.props.children).toBe('Replaced!');
  });

  it('applies status-specific color class when applyColor is true', () => {
    const statusMessages = ['Pending', 'Confirmed', 'Error', 'Replaced'] as const;

    const successEl = StatusAwareText({
      source: statusMessages,
      txStatus: TransactionStatus.Success,
      variant: 'title',
      applyColor: true,
    }) as ReactElement<{ className: string }>;

    expect(successEl.props.className).toContain('novatx:text-[var(--tuwa-success-text)]');
  });

  it('falls back to fallback string when source is missing', () => {
    const el = StatusAwareText({
      fallback: 'Fallback Message',
      variant: 'title',
    }) as ReactElement<{ children: string }>;

    expect(el.props.children).toBe('Fallback Message');
  });

  it('returns null when no text is resolved', () => {
    const el = StatusAwareText({
      variant: 'title',
    });

    expect(el).toBeNull();
  });
});
