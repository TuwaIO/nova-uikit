/**
 * @file Picks the title or description of a transaction for its status.
 */

import { TransactionStatus } from '@tuwaio/pulsar-core';

const STATUS_INDEX: Partial<Record<TransactionStatus, number>> = {
  [TransactionStatus.Success]: 1,
  [TransactionStatus.Failed]: 2,
  [TransactionStatus.Replaced]: 3,
};

/**
 * The text of a transaction `title` or `description` for its status: the string itself, or the entry of the
 * `[pending, success, error, replaced]` tuple (the pending one while the status is not set).
 *
 * @param source - The `title` or `description` of the transaction.
 * @param status - The status of the transaction.
 * @returns The text, or `undefined` without one.
 * @internal
 */
export function statusText(
  source: string | readonly string[] | undefined,
  status: TransactionStatus | undefined,
): string | undefined {
  if (typeof source === 'string') return source;
  if (!Array.isArray(source)) return undefined;
  return source[(status && STATUS_INDEX[status]) ?? 0];
}
