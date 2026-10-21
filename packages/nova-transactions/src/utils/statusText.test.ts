import { TransactionStatus } from '@tuwaio/pulsar-core';
import { describe, expect, it } from 'vitest';

import { statusText } from './statusText';

describe('statusText', () => {
  const tuple = ['Sending', 'Sent', 'Not sent', 'Replaced'] as const;

  it('returns a single string for every status', () => {
    expect(statusText('Pay order #1042', TransactionStatus.Failed)).toBe('Pay order #1042');
  });

  it('picks the text of the status from a [pending, success, error, replaced] tuple', () => {
    expect(statusText(tuple, undefined)).toBe('Sending');
    expect(statusText(tuple, TransactionStatus.Success)).toBe('Sent');
    expect(statusText(tuple, TransactionStatus.Failed)).toBe('Not sent');
    expect(statusText(tuple, TransactionStatus.Replaced)).toBe('Replaced');
  });

  it('returns undefined without a text', () => {
    expect(statusText(undefined, TransactionStatus.Success)).toBeUndefined();
  });
});
