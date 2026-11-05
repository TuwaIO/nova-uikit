import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionPool, TransactionStatus, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { describe, expect, it, vi } from 'vitest';

import {
  canReplaceTx,
  explorerUrlOfHash,
  isUserRejection,
  runReplacement,
  STOP_TRACKING_AFTER_SECONDS,
  stopTrackingDueIn,
  successorOf,
  toastStepFor,
  trackedButtonStep,
} from './replacement';

const WALLET = '0x1234567890123456789012345678901234567890';
const OLD = '0xold';
const NEW = '0xnew';

const tx = (fields: Partial<EvmTransaction> = {}) =>
  ({
    txKey: OLD,
    adapter: OrbitAdapter.EVM,
    tracker: TransactionTracker.Ethereum,
    chainId: 1,
    from: WALLET,
    pending: true,
    type: 'SWAP',
    connectorType: 'evm:metamask',
    localTimestamp: 1,
    nonce: 7,
    maxFeePerGas: '1000',
    maxPriorityFeePerGas: '100',
    ...fields,
  }) as unknown as EvmTransaction;

const spedUp = tx({
  pending: false,
  status: TransactionStatus.Replaced,
  replacedTxHash: NEW,
  replacedReason: 'repriced',
});
const next = tx({ txKey: NEW, hash: NEW, replaces: OLD, confirmations: 1 });
const pool = (...txs: EvmTransaction[]) =>
  Object.fromEntries(txs.map((t) => [t.txKey, t])) as TransactionPool<EvmTransaction>;

describe('successorOf', () => {
  it('finds the record that goes on after a speed-up', () => {
    expect(successorOf(spedUp, pool(spedUp, next))).toBe(next);
  });

  it('works from a server row, which keeps the hash but not the reason', () => {
    const row = tx({ pending: false, status: TransactionStatus.Replaced, replacedTxHash: NEW });
    expect(successorOf(row, pool(row, next))).toBe(next);
  });

  it('a cancel is not continued, whatever the pool holds under its hash', () => {
    const cancel = { ...spedUp, replacedReason: 'cancelled' as const };
    expect(successorOf(cancel, pool(cancel, next))).toBeUndefined();
  });

  it('nothing goes on from a transaction that was not replaced', () => {
    expect(successorOf(tx(), pool(next))).toBeUndefined();
    expect(successorOf(spedUp, pool(spedUp))).toBeUndefined();
  });
});

describe('canReplaceTx', () => {
  const adapter = {
    speedUpTxAction: vi.fn(),
    cancelTxAction: vi.fn(),
  } as unknown as TxAdapter<EvmTransaction>;

  it('offers both on a pending MetaMask transaction of the connected account', () => {
    expect(canReplaceTx(tx(), adapter, WALLET)).toBe(true);
  });

  it.each([
    ['before the tracker has read the nonce: the action could not build it', { nonce: undefined }],
    ['before the tracker has read the fees', { maxFeePerGas: undefined }],
    ['on a transaction already in a block: its nonce is spent', { confirmations: 1 }],
    ['on a finished transaction', { pending: false }],
    ['on another tracker', { tracker: TransactionTracker.Safe }],
    ['with another wallet', { connectorType: 'evm:rabby' }],
    ['on a relayed transaction: the nonce is the relayer', { sender: '0x9999999999999999999999999999999999999999' }],
  ])('does not offer them %s', (_name, fields) => {
    expect(canReplaceTx(tx(fields as Partial<EvmTransaction>), adapter, WALLET)).toBe(false);
  });

  it('does not offer them to another account: the same transfer would be sent again', () => {
    expect(canReplaceTx(tx(), adapter, '0x9999999999999999999999999999999999999999')).toBe(false);
    expect(canReplaceTx(tx(), adapter, undefined)).toBe(false);
  });

  it('does not offer them without the actions of the adapter', () => {
    expect(canReplaceTx(tx(), {} as TxAdapter<EvmTransaction>, WALLET)).toBe(false);
  });
});

describe('runReplacement', () => {
  it('shows the error of a refused replacement: otherwise it is a button that does nothing', async () => {
    const report = vi.fn();
    const error = new Error('replacement transaction underpriced');

    await runReplacement(() => Promise.reject(error), tx(), report);

    expect(report).toHaveBeenCalledWith(error);
  });

  it('says nothing when the person rejected it in the wallet', async () => {
    const report = vi.fn();
    const inner = Object.assign(new Error('rejected'), { code: 4001 });
    const outer = new Error('Failed to speed up transaction', { cause: inner });

    await runReplacement(() => Promise.reject(outer), tx(), report);

    expect(report).not.toHaveBeenCalled();
  });
});

describe('isUserRejection', () => {
  it.each([
    [Object.assign(new Error('x'), { name: 'UserRejectedRequestError' }), true],
    [new Error('User rejected the request.'), true],
    [new Error('replacement transaction underpriced'), false],
    ['not an error', false],
  ])('%s', (error, expected) => {
    expect(isUserRejection(error)).toBe(expected);
  });
});

describe('explorerUrlOfHash', () => {
  it('links to the hash shown, not to the newest one', () => {
    const adapter = {
      getExplorerTxUrl: (t: EvmTransaction) => `https://scan/tx/${t.replacedTxHash || t.hash}`,
    } as unknown as TxAdapter<EvmTransaction>;

    expect(explorerUrlOfHash(adapter, spedUp, OLD)).toBe('https://scan/tx/0xold');
  });
});

describe('trackedButtonStep', () => {
  it('goes on with the new record after a speed-up, and does not say Replaced', () => {
    expect(trackedButtonStep(spedUp, pool(spedUp, next))).toEqual({ kind: 'follow', txKey: NEW });
  });

  it('says Replaced when nothing goes on', () => {
    const cancel = { ...spedUp, replacedReason: 'cancelled' as const };
    expect(trackedButtonStep(cancel, pool(cancel))).toEqual({ kind: 'show', status: 'replaced' });
  });

  it('reports the result of the record it follows', () => {
    const ok = tx({ pending: false, status: TransactionStatus.Success });
    const bad = tx({ pending: false, status: TransactionStatus.Failed });
    expect(trackedButtonStep(ok, pool(ok))).toEqual({ kind: 'show', status: 'succeed' });
    expect(trackedButtonStep(bad, pool(bad))).toEqual({ kind: 'show', status: 'failed' });
    expect(trackedButtonStep(tx(), pool(tx()))).toEqual({ kind: 'wait' });
  });
});

describe('toastStepFor', () => {
  const active =
    (...keys: string[]) =>
    (key: string) =>
      keys.includes(key);

  it('moves the toast of the old record to the new one: one toast for one operation', () => {
    expect(toastStepFor(next, undefined, pool(spedUp, next), active(OLD))).toEqual({ kind: 'move', from: OLD });
  });

  it('moves it even if the new record has already finished in the same render', () => {
    const done = { ...next, pending: false, status: TransactionStatus.Success };
    expect(toastStepFor(done, undefined, pool(spedUp, done), active(OLD))).toEqual({ kind: 'move', from: OLD });
  });

  it('shows no toast of its own for a record that goes on in a new one', () => {
    expect(toastStepFor(spedUp, tx(), pool(spedUp, next), active(OLD))).toEqual({ kind: 'skip' });
  });

  it('shows a new toast when the person closed the old one', () => {
    expect(toastStepFor(next, undefined, pool(spedUp, next), active())).toEqual({ kind: 'show' });
  });

  it('shows a cancel on its own toast', () => {
    const cancel = { ...spedUp, replacedReason: 'cancelled' as const };
    expect(toastStepFor(cancel, tx(), pool(cancel), active(OLD))).toEqual({ kind: 'show' });
  });

  it('keeps the old rules for everything else', () => {
    const pending = tx();
    const done = tx({ pending: false, status: TransactionStatus.Success });
    expect(toastStepFor(pending, undefined, pool(pending), active())).toEqual({ kind: 'show' });
    expect(toastStepFor(done, undefined, pool(done), active())).toEqual({ kind: 'skip' });
    expect(toastStepFor(done, pending, pool(done), active())).toEqual({ kind: 'show' });
    expect(toastStepFor(done, done, pool(done), active())).toEqual({ kind: 'skip' });
  });
});

describe('stopTrackingDueIn', () => {
  const tx = (localTimestamp: unknown) => ({ localTimestamp }) as never;

  it('counts down from the time of sending', () => {
    expect(stopTrackingDueIn(tx(1000), 1000)).toBe(STOP_TRACKING_AFTER_SECONDS);
    expect(stopTrackingDueIn(tx(1000), 1000 + STOP_TRACKING_AFTER_SECONDS)).toBe(0);
    expect(stopTrackingDueIn(tx(1000), 1000 + STOP_TRACKING_AFTER_SECONDS + 5)).toBe(-5);
  });

  it('reads a time saved as a string', () => {
    expect(stopTrackingDueIn(tx('1000'), 1100)).toBe(STOP_TRACKING_AFTER_SECONDS - 100);
  });

  it('is never due for a record without a time of sending', () => {
    expect(stopTrackingDueIn(tx(undefined), 1000) <= 0).toBe(false);
  });
});
