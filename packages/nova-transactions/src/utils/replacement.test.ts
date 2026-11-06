import { OrbitAdapter } from '@tuwaio/orbit-core';
import { EvmTransaction, TransactionPool, TransactionStatus, TransactionTracker, TxAdapter } from '@tuwaio/pulsar-core';
import { describe, expect, it, vi } from 'vitest';

import {
  afterTrackedAction,
  canReplaceTx,
  explorerUrlOfHash,
  explorerUrlOfReplaced,
  isUserRejection,
  latestRecordOf,
  pendingOfWallet,
  runReplacement,
  STOP_TRACKING_AFTER_SECONDS,
  stopTrackingDueIn,
  successorOf,
  toastIdOf,
  toastsOfRemoved,
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

  it('another transaction in the same nonce is not the same operation', () => {
    const replaced = { ...spedUp, replacedReason: 'replaced' as const };
    expect(successorOf(replaced, pool(replaced, next))).toBeUndefined();
  });

  it('a Safe proposal is not continued by the other proposal that was executed', () => {
    const safe = tx({
      tracker: TransactionTracker.Safe,
      pending: false,
      status: TransactionStatus.Replaced,
      replacedTxHash: NEW,
    });
    expect(successorOf(safe, pool(safe, next))).toBeUndefined();
  });

  it('two records replaced by each other are not a chain: both stay shown after a reorganization', () => {
    const back = tx({
      txKey: NEW,
      hash: NEW,
      pending: false,
      status: TransactionStatus.Replaced,
      replacedTxHash: OLD,
      replacedReason: 'repriced',
    });
    expect(successorOf(spedUp, pool(spedUp, back))).toBeUndefined();
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
  const adapter = {
    getExplorerTxUrl: (t: EvmTransaction) =>
      t.tracker === TransactionTracker.Safe
        ? `https://safe/${t.txKey}`
        : t.tracker === TransactionTracker.EIP5792 && !t.hash
          ? ''
          : `https://scan/tx/${t.replacedTxHash || t.hash}`,
  } as unknown as TxAdapter<EvmTransaction>;

  it('links to the hash shown, not to the newest one', () => {
    expect(explorerUrlOfHash(adapter, spedUp, OLD)).toBe('https://scan/tx/0xold');
  });

  it('gives no link to a batch without a hash: its ID is no transaction an explorer knows', () => {
    const batch = tx({ tracker: TransactionTracker.EIP5792, hash: undefined });
    expect(explorerUrlOfHash(adapter, batch, undefined)).toBeUndefined();
  });

  it('links the replacing proposal of a Safe record to that proposal, not to the old one', () => {
    const safe = tx({ tracker: TransactionTracker.Safe, replacedTxHash: NEW });
    expect(explorerUrlOfHash(adapter, safe, NEW)).toBe('https://safe/0xnew');
    expect(explorerUrlOfHash(adapter, safe, OLD)).toBe('https://safe/0xold');
  });

  it('gives no link to a hash of zeros, which a Safe service gives when it knows none', () => {
    expect(explorerUrlOfHash(adapter, spedUp, `0x${'0'.repeat(64)}`)).toBeUndefined();
  });
});

describe('explorerUrlOfReplaced', () => {
  const adapter = {
    getExplorerTxUrl: (t: EvmTransaction) => `https://scan/tx/${t.hash}`,
  } as unknown as TxAdapter<EvmTransaction>;

  it('links a transaction hash', () => {
    const hash = `0x${'a'.repeat(64)}`;
    expect(explorerUrlOfReplaced(adapter, next, hash)).toBe(`https://scan/tx/${hash}`);
  });

  it('gives no link to a batch ID', () => {
    expect(explorerUrlOfReplaced(adapter, next, 'batch-id')).toBeUndefined();
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

// A toast closed with the cross came back at every page load, for a transaction still pending
describe('a toast a person closed', () => {
  const pending = (txKey: string, localTimestamp: number) =>
    ({ txKey, pending: true, from: '0xabc', localTimestamp: String(localTimestamp) }) as never;

  it('stays closed when the pool reads its transaction at load', () => {
    const tx = pending('0xa', 1);
    const pool = { '0xa': tx };
    expect(toastStepFor(tx, undefined, pool, () => false)).toEqual({ kind: 'show', toastId: '0xa' });
    expect(toastStepFor(tx, undefined, pool, () => false, undefined, new Set(['0xa']))).toEqual({ kind: 'skip' });
  });

  it('comes back when its transaction changes state', () => {
    const before = pending('0xa', 1) as { txKey: string; pending: boolean };
    const after = { ...before, pending: false, status: 'Success' } as never;
    expect(toastStepFor(after, before as never, { '0xa': after }, () => false, undefined, new Set(['0xa']))).toEqual({
      kind: 'show',
      toastId: '0xa',
    });
  });

  it('is left out of what a page opens with, and takes no place of the newest few', () => {
    const pool = {
      '0xa': pending('0xa', 4),
      '0xb': pending('0xb', 3),
      '0xc': pending('0xc', 2),
      '0xd': pending('0xd', 1),
    };
    expect(pendingOfWallet(pool as never, '0xabc').map(({ txKey }) => txKey)).toEqual(['0xa', '0xb', '0xc']);
    expect(pendingOfWallet(pool as never, '0xabc', new Set(['0xa'])).map(({ txKey }) => txKey)).toEqual([
      '0xb',
      '0xc',
      '0xd',
    ]);
  });
});

describe('toastStepFor', () => {
  const active =
    (...keys: string[]) =>
    (key: string) =>
      keys.includes(key);

  it('keeps one toast for one operation: the new record speaks through the toast of the first', () => {
    expect(toastStepFor(next, undefined, pool(spedUp, next), active(OLD))).toEqual({ kind: 'show', toastId: OLD });
  });

  it('does so even if the new record has already finished in the same render', () => {
    const done = { ...next, pending: false, status: TransactionStatus.Success };
    expect(toastStepFor(done, undefined, pool(spedUp, done), active(OLD))).toEqual({ kind: 'show', toastId: OLD });
  });

  it('shows nothing for a record that goes on in a new one', () => {
    expect(toastStepFor(spedUp, tx(), pool(spedUp, next), active(OLD))).toEqual({ kind: 'skip' });
  });

  it('shows the toast again when the person closed it', () => {
    expect(toastStepFor(next, undefined, pool(spedUp, next), active())).toEqual({ kind: 'show', toastId: OLD });
  });

  it('shows a cancel on its own toast', () => {
    const cancel = { ...spedUp, replacedReason: 'cancelled' as const };
    expect(toastStepFor(cancel, tx(), pool(cancel), active(OLD))).toEqual({ kind: 'show', toastId: OLD });
  });

  it('keeps the old rules for everything else', () => {
    const pending = tx();
    const done = tx({ pending: false, status: TransactionStatus.Success });
    expect(toastStepFor(pending, undefined, pool(pending), active())).toEqual({ kind: 'show', toastId: OLD });
    expect(toastStepFor(done, undefined, pool(done), active())).toEqual({ kind: 'skip' });
    expect(toastStepFor(pending, pending, pool(pending), active(OLD))).toEqual({ kind: 'skip' });
    expect(toastStepFor(done, pending, pool(done), active(OLD))).toEqual({ kind: 'show', toastId: OLD });
  });

  it('a toast a person closed comes back for a change of state, not for any write to the record', () => {
    const pending = tx();
    const ticked = tx({ confirmations: 1 });
    const done = tx({ pending: false, status: TransactionStatus.Success });

    expect(toastStepFor(ticked, pending, pool(ticked), active())).toEqual({ kind: 'skip' });
    expect(toastStepFor(ticked, pending, pool(ticked), active(OLD))).toEqual({ kind: 'show', toastId: OLD });
    expect(toastStepFor(done, pending, pool(done), active())).toEqual({ kind: 'show', toastId: OLD });
  });

  it('a reorganization that brings the first record back stays on the same toast', () => {
    const reopened = tx();
    const reorged = tx({
      txKey: NEW,
      hash: NEW,
      replaces: OLD,
      pending: false,
      status: TransactionStatus.Replaced,
      replacedTxHash: OLD,
      replacedReason: 'repriced',
    });
    const reorgPool = pool(reopened, reorged);

    expect(toastStepFor(reorged, next, reorgPool, active(OLD))).toEqual({ kind: 'skip' });
    expect(toastStepFor(reopened, spedUp, reorgPool, active(OLD))).toEqual({ kind: 'show', toastId: OLD });
  });
});

describe('toastIdOf', () => {
  it('is the key of the first record, through every speed-up', () => {
    const third = tx({ txKey: '0xthird', hash: '0xthird', replaces: NEW });
    expect(toastIdOf(third, pool(spedUp, next, third))).toBe(OLD);
  });

  it('is the key of the record itself when the first has left the pool and nothing remembers it', () => {
    expect(toastIdOf(next, pool(next))).toBe(NEW);
  });

  it('stays the id seen before when the first record has left the pool: a second toast would open, and the first stay stuck', () => {
    expect(toastIdOf(next, pool(next), new Map([[NEW, OLD]]))).toBe(OLD);
  });

  it('does not run forever on records that replace each other', () => {
    const a = tx({ replaces: NEW });
    const b = tx({ txKey: NEW, hash: NEW, replaces: OLD });
    expect([OLD, NEW]).toContain(toastIdOf(a, pool(a, b)));
  });
});

describe('toastsOfRemoved', () => {
  it('closes the toast of a transaction whose tracking was stopped: it would stay on Pending for good', () => {
    const pending = tx();
    expect(toastsOfRemoved(pool(pending), pool())).toEqual([OLD]);
  });

  it('closes the toast of the operation when its newest record is removed', () => {
    expect(toastsOfRemoved(pool(spedUp, next), pool(spedUp))).toEqual([OLD]);
  });

  it('leaves the toasts of what is still in the pool', () => {
    expect(toastsOfRemoved(pool(spedUp, next), pool(spedUp, next))).toEqual([]);
  });

  it('leaves the toast of an operation that goes on when its old record is dropped', () => {
    expect(toastsOfRemoved(pool(spedUp, next), pool(next))).toEqual([]);
  });
});

describe('pendingOfWallet', () => {
  it('keeps what is pending of that wallet: another wallet cannot act on it, and finished records are noise', () => {
    const mine = tx({ txKey: '0xmine' });
    const other = tx({ txKey: '0xother', from: '0x0000000000000000000000000000000000000001' });
    const done = tx({ txKey: '0xdone', pending: false, status: TransactionStatus.Success });

    expect(pendingOfWallet(pool(mine, other, done), WALLET.toLowerCase())).toEqual([mine]);
  });

  it('keeps only the newest few: nothing limits how many a pool can hold', () => {
    const many = [1, 2, 3, 4, 5].map((n) => tx({ txKey: `0x${n}`, localTimestamp: n }));

    expect(pendingOfWallet(pool(...many), WALLET.toLowerCase()).map((t) => t.localTimestamp)).toEqual([5, 4, 3]);
  });
});

describe('afterTrackedAction', () => {
  const click = { walletAtClick: WALLET, walletNow: WALLET, keyBefore: OLD };

  it('follows a new transaction', () => {
    expect(afterTrackedAction({ ...click, keyAfter: NEW })).toBe('track');
  });

  it('goes back to idle when the action added none: it must not wait for good or show an older result', () => {
    expect(afterTrackedAction({ ...click, keyAfter: OLD })).toBe('idle');
    expect(afterTrackedAction({ walletAtClick: WALLET, walletNow: WALLET })).toBe('idle');
  });

  it('follows a record sent again under the same key, as a Safe proposal', () => {
    expect(afterTrackedAction({ ...click, keyAfter: OLD, sentAfterClick: true })).toBe('track');
  });

  it('ignores the result when the wallet changed meanwhile: it belongs to the other wallet', () => {
    expect(afterTrackedAction({ ...click, walletNow: '0xother', keyAfter: NEW })).toBe('ignore');
  });
});

describe('latestRecordOf', () => {
  it('follows every speed-up to where the operation stands', () => {
    const second = tx({
      txKey: NEW,
      hash: NEW,
      pending: false,
      status: TransactionStatus.Replaced,
      replacedTxHash: '0xthird',
      replacedReason: 'repriced',
    });
    const third = tx({ txKey: '0xthird', hash: '0xthird', replaces: NEW });

    expect(latestRecordOf(spedUp, pool(spedUp, second, third))).toBe(third);
  });

  it('stays on a record that nothing follows', () => {
    const pending = tx();
    expect(latestRecordOf(pending, pool(pending))).toBe(pending);
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
