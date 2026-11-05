import { EvmTransaction, Transaction, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { describe, expect, it } from 'vitest';

import { connectedStatusFor, goesOnInNewRecord, nextConnectedStatus } from './connectedStatus';

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
    expect(connectedStatusFor([old], [tx('old')])).toBe('cancelled');
  });

  it('another transaction in the same nonce is a replacement, not a speed-up', () => {
    const old = done('old', TransactionStatus.Replaced, { replacedTxHash: 'new' as never, replacedReason: 'replaced' });
    expect(connectedStatusFor([old, tx('new')], [tx('old')])).toBe('replaced');
  });

  it('a switch of wallet is no result: an old sped-up record of the new wallet has nothing to do with the list before', () => {
    const old = done('old', TransactionStatus.Replaced, { replacedTxHash: 'new' as never, replacedReason: 'repriced' });
    const next = done('new', TransactionStatus.Success, { replaces: 'old' as never });
    expect(connectedStatusFor([old, next], [tx('of-the-other-wallet')])).toBe('idle');
  });

  it('nothing has happened when nothing changed', () => {
    const finished = done('a', TransactionStatus.Success);
    expect(connectedStatusFor([finished], [finished])).toBe('idle');
    expect(connectedStatusFor([], [])).toBe('idle');
  });
});

describe('nextConnectedStatus', () => {
  it('a shown result stays until its timer: a write to the pool must not cut it to a moment', () => {
    for (const shown of ['succeed', 'failed', 'replaced', 'cancelled'] as const) {
      expect(nextConnectedStatus(shown, 'loading')).toBe(shown);
      expect(nextConnectedStatus(shown, 'idle')).toBe(shown);
    }
  });

  it('a new result replaces a shown one', () => {
    expect(nextConnectedStatus('succeed', 'failed')).toBe('failed');
  });

  it('goes to idle when nothing is pending any more', () => {
    expect(nextConnectedStatus('loading', 'idle')).toBe('idle');
  });

  it('goes busy from idle', () => {
    expect(nextConnectedStatus('idle', 'loading')).toBe('loading');
  });
});

describe('goesOnInNewRecord', () => {
  const next = tx('new');

  it('holds for a speed-up and for a server row without a reason', () => {
    const row = done('old', TransactionStatus.Replaced, { replacedTxHash: 'new' as never });
    expect(goesOnInNewRecord(row, [row, next])).toBe(true);
    expect(goesOnInNewRecord({ ...row, replacedReason: 'repriced' } as Transaction, [row, next])).toBe(true);
  });

  it('does not hold for a cancel, another transaction in the nonce or a Safe proposal', () => {
    const fields = { replacedTxHash: 'new' as never };
    const cancel = done('old', TransactionStatus.Replaced, { ...fields, replacedReason: 'cancelled' });
    const other = done('old', TransactionStatus.Replaced, { ...fields, replacedReason: 'replaced' });
    const safe = {
      ...done('old', TransactionStatus.Replaced, fields),
      tracker: TransactionTracker.Safe,
    } as Transaction;
    for (const record of [cancel, other, safe]) expect(goesOnInNewRecord(record, [record, next])).toBe(false);
  });
});
