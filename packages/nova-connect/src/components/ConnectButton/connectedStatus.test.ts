import { EvmTransaction, Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { describe, expect, it } from 'vitest';

import { connectedStatusFor } from './connectedStatus';

const tx = (txKey: string, fields: Partial<EvmTransaction> = {}) =>
  ({ txKey, pending: true, from: '0x1', ...fields }) as unknown as Transaction;
const done = (txKey: string, status: TransactionStatus, fields: Partial<EvmTransaction> = {}) =>
  tx(txKey, { pending: false, status, ...fields });

describe('connectedStatusFor', () => {
  it('is busy while a transaction is pending', () => {
    expect(connectedStatusFor([tx('a')], [])).toBe('loading');
  });

  it('shows a result that has just arrived', () => {
    expect(connectedStatusFor([done('a', TransactionStatus.Success)], [tx('a')])).toBe('succeed');
    expect(connectedStatusFor([done('a', TransactionStatus.Failed)], [tx('a')])).toBe('failed');
  });

  it('shows it though another transaction never ends: one stuck transaction must not hide every result', () => {
    expect(connectedStatusFor([tx('stuck'), done('a', TransactionStatus.Success)], [tx('stuck'), tx('a')])).toBe(
      'succeed',
    );
  });

  it('a speed-up is not a result: the operation goes on in the new record', () => {
    const old = done('old', TransactionStatus.Replaced, { replacedTxHash: 'new' as never, replacedReason: 'repriced' });
    expect(connectedStatusFor([old, tx('new', { replaces: 'old' as never })], [tx('old')])).toBe('loading');
  });

  it('the new record of a speed-up reports its own result, even if it arrives finished', () => {
    const old = done('old', TransactionStatus.Replaced, { replacedTxHash: 'new' as never, replacedReason: 'repriced' });
    const next = done('new', TransactionStatus.Success, { replaces: 'old' as never });
    expect(connectedStatusFor([old, next], [tx('old')])).toBe('succeed');
  });

  it('a cancel is a result', () => {
    const old = done('old', TransactionStatus.Replaced, {
      replacedTxHash: 'new' as never,
      replacedReason: 'cancelled',
    });
    expect(connectedStatusFor([old], [tx('old')])).toBe('replaced');
  });

  it('nothing has happened when nothing changed', () => {
    const finished = done('a', TransactionStatus.Success);
    expect(connectedStatusFor([finished], [finished])).toBe('idle');
    expect(connectedStatusFor([], [])).toBe('idle');
  });
});
