/**
 * @file Which sound a change of a transaction in the pool makes.
 */

import type { NovaSoundName } from '@tuwaio/nova-core/utils';
import { type Transaction, TransactionStatus } from '@tuwaio/pulsar-core';

// A record new to the pool is a new transaction only if it is recent: a pool restored after a page load is new as well
const NEW_TRANSACTION_SECONDS = 60;

/**
 * Returns the sound of a transaction that has changed: `txPending` for one that has just reached the pool, and `txSuccess`,
 * `txError` or `txReplaced` for one that has just finished.
 *
 * @internal
 * @param tx - The record now.
 * @param previous - The record before, if there was one.
 * @param nowSeconds - The time now, in seconds.
 * @returns The sound, or `undefined` for none.
 */
export function txSoundOf(tx: Transaction, previous: Transaction | undefined, nowSeconds: number) {
  let sound: NovaSoundName | undefined;
  if (!previous) {
    if (tx.pending && nowSeconds - Number(tx.localTimestamp) < NEW_TRANSACTION_SECONDS) sound = 'txPending';
  } else if (previous.pending && !tx.pending) {
    if (tx.status === TransactionStatus.Success) sound = 'txSuccess';
    if (tx.status === TransactionStatus.Failed) sound = 'txError';
    if (tx.status === TransactionStatus.Replaced) sound = 'txReplaced';
  }
  return sound;
}

/**
 * Returns the sounds of a change of the pool, each once. A speed-up ends one record and adds the next at the same moment: that is
 * one event, and only `txReplaced` is heard.
 *
 * @internal
 * @param pool - The pool now.
 * @param previousPool - The pool before.
 * @param nowSeconds - The time now, in seconds.
 * @returns The sounds.
 */
export function txSoundsOf(
  pool: Record<string, Transaction>,
  previousPool: Record<string, Transaction>,
  nowSeconds: number,
) {
  const sounds = new Set<NovaSoundName>();
  for (const tx of Object.values(pool)) {
    const sound = txSoundOf(tx, previousPool[tx.txKey], nowSeconds);
    if (sound) sounds.add(sound);
  }
  if (sounds.has('txReplaced')) sounds.delete('txPending');
  return [...sounds];
}
