import { type Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { describe, expect, it } from 'vitest';

import { txSoundOf } from './txSounds';

const NOW = 2_000_000_000;
const tx = (fields: Partial<Transaction>) =>
  ({ txKey: '0x1', pending: true, localTimestamp: NOW - 2, ...fields }) as unknown as Transaction;

describe('txSoundOf', () => {
  it('sounds for a transaction that has just reached the pool', () => {
    expect(txSoundOf(tx({}), undefined, NOW)).toBe('txPending');
  });

  // A pool restored after a page load is new to the provider, and nobody has just sent all of it
  it('stays silent for an old record that appears in the pool', () => {
    expect(txSoundOf(tx({ localTimestamp: NOW - 3600 }), undefined, NOW)).toBeUndefined();
    expect(txSoundOf(tx({ pending: false, status: TransactionStatus.Success }), undefined, NOW)).toBeUndefined();
  });

  it.each([
    [TransactionStatus.Success, 'txSuccess'],
    [TransactionStatus.Failed, 'txError'],
    [TransactionStatus.Replaced, undefined],
  ])('sounds once for a transaction that ends as %s', (status, sound) => {
    const finished = tx({ pending: false, status });

    expect(txSoundOf(finished, tx({}), NOW)).toBe(sound);
    expect(txSoundOf(finished, finished, NOW)).toBeUndefined();
  });

  it('stays silent while it goes on waiting', () => {
    expect(txSoundOf(tx({}), tx({}), NOW)).toBeUndefined();
  });
});
