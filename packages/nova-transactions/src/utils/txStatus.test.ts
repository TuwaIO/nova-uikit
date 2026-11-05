import { Transaction, TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { describe, expect, it } from 'vitest';

import { defaultLabels } from '../i18n/en';
import { hasConfirmations, progressOf, statusLabelOf, toneOf, trackerGaveUp, walletPartOf } from './txStatus';

const tx = (fields: Record<string, unknown>) => fields as unknown as Transaction;

describe('toneOf', () => {
  it('is pending while tracked, whatever the status says', () => {
    expect(toneOf(tx({ pending: true, status: TransactionStatus.Success }))).toBe('pending');
  });

  it('tells a result by its status', () => {
    expect(toneOf(tx({ pending: false, status: TransactionStatus.Success }))).toBe('success');
    expect(toneOf(tx({ pending: false, status: TransactionStatus.Failed }))).toBe('error');
  });

  it('does not paint a replaced transaction red: its money may have moved under the new hash', () => {
    expect(toneOf(tx({ pending: false, status: TransactionStatus.Replaced }))).toBe('neutral');
  });
});

describe('progressOf', () => {
  it('counts confirmations out of those required', () => {
    expect(progressOf(tx({ confirmations: 1, requiredConfirmations: 3 }))).toBeCloseTo(1 / 3);
    expect(progressOf(tx({ confirmations: '2', requiredConfirmations: 4 }))).toBe(0.5);
  });

  it('says nothing when there is nothing to count: no fake progress by the clock', () => {
    expect(progressOf(tx({}))).toBeUndefined();
    expect(progressOf(tx({ confirmations: 1, requiredConfirmations: 1 }))).toBeUndefined();
    expect(progressOf(tx({ confirmations: 0, requiredConfirmations: 3 }))).toBeUndefined();
  });

  it('follows the commitment stages on Solana', () => {
    expect(progressOf(tx({ confirmationStatus: 'confirmed' }))).toBeCloseTo(2 / 3);
    expect(progressOf(tx({ confirmationStatus: 'finalized' }))).toBe(1);
  });
});

describe('statusLabelOf', () => {
  const { statuses } = defaultLabels;

  it('translates a result instead of showing the raw status', () => {
    expect(statusLabelOf(tx({ pending: false, status: TransactionStatus.Success }), statuses)).toBe(statuses.success);
    expect(statusLabelOf(tx({ pending: false, status: TransactionStatus.Failed }), statuses)).toBe(statuses.failed);
  });

  it('says what a replacement was', () => {
    const replaced = (replacedReason?: string) =>
      tx({ pending: false, status: TransactionStatus.Replaced, replacedReason });

    expect(statusLabelOf(replaced('repriced'), statuses)).toBe(statuses.spedUp);
    expect(statusLabelOf(replaced('cancelled'), statuses)).toBe(statuses.cancelled);
    expect(statusLabelOf(replaced(), statuses)).toBe(statuses.replaced);
  });

  it('shows the confirmed stage of Solana while it is still pending', () => {
    expect(statusLabelOf(tx({ pending: true, confirmationStatus: 'confirmed' }), statuses)).toBe(statuses.confirmed);
    expect(statusLabelOf(tx({ pending: true, confirmationStatus: 'finalized' }), statuses)).toBe(statuses.confirmed);
    expect(statusLabelOf(tx({ pending: true, confirmationStatus: 'processed' }), statuses)).toBe(statuses.pending);
  });
});

describe('trackerGaveUp', () => {
  const failed = (fields: Record<string, unknown>) =>
    tx({ status: TransactionStatus.Failed, error: 'gave up', ...fields });

  it('a revert on the standard tracker has no error: Retry stays', () => {
    expect(trackerGaveUp(tx({ status: TransactionStatus.Failed, tracker: TransactionTracker.Ethereum }))).toBe(false);
  });

  it.each([TransactionTracker.Ethereum, TransactionTracker.Safe, TransactionTracker.Gelato])(
    'an error of the %s tracker says nothing about the chain: no Retry, it could send a second time',
    (tracker) => {
      expect(trackerGaveUp(failed({ tracker }))).toBe(true);
    },
  );

  it('on Solana what had a commitment has landed', () => {
    expect(trackerGaveUp(failed({ tracker: TransactionTracker.Solana, confirmationStatus: 'confirmed' }))).toBe(true);
    expect(trackerGaveUp(failed({ tracker: TransactionTracker.Solana }))).toBe(false);
  });

  it('nothing else counts', () => {
    expect(trackerGaveUp(undefined)).toBe(false);
    expect(trackerGaveUp(tx({ status: TransactionStatus.Success, error: 'x' }))).toBe(false);
  });
});

describe('hasConfirmations', () => {
  it('shows a count, and the MAX of a finalized Solana transaction', () => {
    expect(hasConfirmations(3)).toBe(true);
    expect(hasConfirmations('2')).toBe(true);
    expect(hasConfirmations('MAX')).toBe(true);
  });

  it('hides nothing to show: a 0 would be rendered next to the status', () => {
    expect(hasConfirmations(0)).toBe(false);
    expect(hasConfirmations(null)).toBe(false);
    expect(hasConfirmations(undefined)).toBe(false);
  });
});

describe('walletPartOf', () => {
  it('takes the wallet out of a connector type: a record holds evm:metamask, and the row would read Evm:metamask', () => {
    expect(walletPartOf('evm:metamask')).toBe('metamask');
    expect(walletPartOf('solana:phantom')).toBe('phantom');
  });

  it('keeps a value without an adapter, and nothing stays nothing', () => {
    expect(walletPartOf('injected')).toBe('injected');
    expect(walletPartOf(undefined)).toBeUndefined();
  });
});
