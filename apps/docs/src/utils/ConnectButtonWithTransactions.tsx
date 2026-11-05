import { ConnectButton, type ConnectButtonProps } from '@tuwaio/nova-connect/components';
import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { Transaction, TransactionPool, TransactionStatus } from '@tuwaio/pulsar-core';
import { useEffect, useRef, useState } from 'react';

import { createMockTx } from './mockTransactions';

const OLD_HASH = '0x1111111111111111111111111111111111111111111111111111111111111111';
const NEW_HASH = '0x2222222222222222222222222222222222222222222222222222222222222222';

/** The records of one operation: what the store holds while it waits, and when it has its result. */
const SCENARIOS: Record<string, (from: string) => { waiting: unknown[]; result: unknown[] }> = {
  Success: (from) => {
    const base = { from, sender: from, txKey: OLD_HASH, hash: OLD_HASH };
    return {
      waiting: [{ ...base, pending: true }],
      result: [{ ...base, pending: false, status: TransactionStatus.Success }],
    };
  },
  Failed: (from) => {
    const base = { from, sender: from, txKey: OLD_HASH, hash: OLD_HASH };
    return {
      waiting: [{ ...base, pending: true }],
      result: [{ ...base, pending: false, status: TransactionStatus.Failed, isError: true }],
    };
  },
  Replaced: (from) => {
    const base = { from, sender: from, txKey: OLD_HASH, hash: OLD_HASH };
    return {
      waiting: [{ ...base, pending: true }],
      result: [
        {
          ...base,
          pending: false,
          status: TransactionStatus.Replaced,
          replacedTxHash: NEW_HASH,
          replacedReason: 'replaced',
        },
      ],
    };
  },
  Cancelled: (from) => {
    const base = { from, sender: from, txKey: OLD_HASH, hash: OLD_HASH };
    return {
      waiting: [{ ...base, pending: true }],
      result: [
        {
          ...base,
          pending: false,
          status: TransactionStatus.Replaced,
          replacedTxHash: NEW_HASH,
          replacedReason: 'cancelled',
        },
      ],
    };
  },
  'Sped up': (from) => {
    const old = {
      from,
      sender: from,
      txKey: OLD_HASH,
      hash: OLD_HASH,
      pending: false,
      status: TransactionStatus.Replaced,
      replacedTxHash: NEW_HASH,
      replacedReason: 'repriced',
    };
    const next = { from, sender: from, txKey: NEW_HASH, hash: NEW_HASH, replaces: OLD_HASH };
    return {
      waiting: [old, { ...next, pending: true }],
      result: [old, { ...next, pending: false, status: TransactionStatus.Success }],
    };
  },
};

const poolOf = (records: unknown[]) =>
  Object.fromEntries(
    records.map((record) => {
      const tx = createMockTx(OrbitAdapter.EVM, record as Record<string, unknown>);
      return [tx.txKey, tx];
    }),
  ) as TransactionPool<Transaction>;

/**
 * The connect button with a pool that changes on a press, for the states it shows about the transactions of the connected
 * wallet. The wallet needs to be connected first.
 *
 * @param props - The props of the button.
 * @returns The button and the row of states.
 */
export function ConnectButtonWithTransactions(props: ConnectButtonProps) {
  const address = useSatelliteConnectStore((state) => state.activeConnection?.address);
  const [pool, setPool] = useState<TransactionPool<Transaction>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const play = (name: string) => {
    if (!address) return;
    const { waiting, result } = SCENARIOS[name](address);
    clearTimeout(timer.current);
    setPool(poolOf(waiting));
    timer.current = setTimeout(() => setPool(poolOf(result)), 2500);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton {...props} transactionPool={pool} />
      {address ? (
        <div className="flex flex-wrap justify-center gap-2">
          {Object.keys(SCENARIOS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => play(name)}
              className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] px-2 py-1 text-xs text-[var(--tuwa-text-primary)]"
            >
              {name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--tuwa-text-secondary)]">
          Connect first: Connect Wallet, then Impersonate, with any address.
        </p>
      )}
    </div>
  );
}
