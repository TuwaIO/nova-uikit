import { type Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { describe, expect, it } from 'vitest';

import { txSoundOf, txSoundsOf } from './txSounds';

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
    [TransactionStatus.Replaced, 'txReplaced'],
  ])('sounds once for a transaction that ends as %s', (status, sound) => {
    const finished = tx({ pending: false, status });

    expect(txSoundOf(finished, tx({}), NOW)).toBe(sound);
    expect(txSoundOf(finished, finished, NOW)).toBeUndefined();
  });

  it('stays silent while it goes on waiting', () => {
    expect(txSoundOf(tx({}), tx({}), NOW)).toBeUndefined();
  });

  describe('a change of the pool', () => {
    const pending = tx({ txKey: '0x1' });
    const replaced = tx({ txKey: '0x1', pending: false, status: TransactionStatus.Replaced });
    const successor = tx({ txKey: '0x2' });

    // A speed-up ends one record and adds the next at the same moment, in either order of the pool
    it('hears a speed-up as one event', () => {
      expect(txSoundsOf({ '0x1': replaced, '0x2': successor }, { '0x1': pending }, NOW)).toEqual(['txReplaced']);
      expect(txSoundsOf({ '0x2': successor, '0x1': replaced }, { '0x1': pending }, NOW)).toEqual(['txReplaced']);
    });

    it('plays each sound once, however many records have it', () => {
      const third = tx({ txKey: '0x3' });
      expect(txSoundsOf({ '0x2': successor, '0x3': third }, {}, NOW)).toEqual(['txPending']);
    });

    it('plays what differs', () => {
      const failed = tx({ txKey: '0x1', pending: false, status: TransactionStatus.Failed });
      expect(txSoundsOf({ '0x1': failed, '0x2': successor }, { '0x1': pending }, NOW)).toEqual([
        'txError',
        'txPending',
      ]);
    });
  });
});
