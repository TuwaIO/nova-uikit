/**
 * @file This file contains the `TxInfoBlock` component, which displays key details about a transaction.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { cn } from '@tuwaio/nova-core';
import { InitialTransaction, Transaction } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { ComponentType, ReactNode } from 'react';

import { NovaProviderProps, useLabels } from '../../providers';
import { TransactionKey, TransactionKeyProps } from '../TransactionKey';

// --- Types for Customization & Props ---
type CustomInfoRowProps = { label: ReactNode; value: ReactNode };

export type TxInfoBlockCustomization<TR, T extends Transaction<TR>, A> = {
  components?: {
    InfoRow?: ComponentType<CustomInfoRowProps>;
    transactionKey?: TransactionKeyProps<TR, T, A>['renderHashLink'];
  };
};

export type TxInfoBlockProps<TR, T extends Transaction<TR>, A> = {
  /** The transaction object to display, which can be a full transaction or an initial one. */
  tx: T | InitialTransaction;
  className?: string;
  customization?: TxInfoBlockCustomization<TR, T, A>;
} & Pick<NovaProviderProps<TR, T, A>, 'adapters' | 'transactionsPool'>;

// --- Default Sub-Component ---
function DefaultInfoRow({ label, value }: CustomInfoRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--tuwa-text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--tuwa-text-primary)]">{value}</span>
    </div>
  );
}

/**
 * A component that displays a block of essential transaction details,
 * such as network, start time, and relevant hashes/keys.
 */
export function TxInfoBlock<TR, T extends Transaction<TR>, A>({
  tx,
  adapters,
  transactionsPool,
  className,
  customization,
}: TxInfoBlockProps<TR, T, A>) {
  const { txInfo } = useLabels();

  // Use the custom InfoRow component if provided, otherwise fall back to the default.
  const { InfoRow = DefaultInfoRow } = customization?.components ?? {};

  // Determine the chain ID, falling back from the final chainId to the desiredChainID for initial transactions.
  const chainId = ('chainId' in tx ? tx.chainId : tx.desiredChainID) as number;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] p-3',
        className,
      )}
    >
      {/* --- Network and Timestamp Info --- */}
      <InfoRow
        label={txInfo.network}
        value={
          <div className="flex items-center justify-end gap-2">
            <div className="h-4 w-4">
              <Web3Icon chainId={chainId} />
            </div>
            <span>{getChainName(chainId)}</span>
          </div>
        }
      />
      {tx.localTimestamp && (
        <InfoRow label={txInfo.started} value={dayjs.unix(tx.localTimestamp).format('MMM D, HH:mm:ss')} />
      )}

      {/* --- Transaction Hashes/Keys --- */}
      {'txKey' in tx && tx.txKey && (
        <div className="border-t border-[var(--tuwa-border-primary)] pt-3">
          <TransactionKey
            tx={tx as T}
            adapters={adapters}
            transactionsPool={transactionsPool}
            variant="history" // 'history' variant provides suitable styling for this block
            renderHashLink={customization?.components?.transactionKey}
          />
        </div>
      )}
    </div>
  );
}
