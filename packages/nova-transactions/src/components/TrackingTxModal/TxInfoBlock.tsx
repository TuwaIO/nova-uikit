/**
 * @file This file contains the `TxInfoBlock` component, which displays key details about a transaction.
 * It also supports Solana-specific functionality to display slot, confirmations, and recentBlockhash details.
 */

import { cn, getChainName, NetworkIcon } from '@tuwaio/nova-core';
import { OrbitAdapter, selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import { InitialTransaction, SolanaTransaction, Transaction } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { ComponentType, ReactNode } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../../providers';
import { HashLink, HashLinkProps } from '../HashLink';
import { TransactionKey, TransactionKeyProps } from '../TransactionKey';

// --- Types for Customization & Props ---
type CustomInfoRowProps = { label: ReactNode; value: ReactNode; classNames?: InfoRowClassNames };
type InfoRowClassNames = { row?: string; label?: string; value?: string };

export type TxInfoBlockCustomization<T extends Transaction> = {
  /** Custom components */
  components?: {
    InfoRow?: ComponentType<CustomInfoRowProps>;
    transactionKey?: TransactionKeyProps<T>['renderHashLink'];
  };
  /** Granular classNames for sub-elements */
  classNames?: {
    /** Classes for the container */
    container?: string;
    /** Classes for info row */
    row?: string;
    /** Classes for row label */
    rowLabel?: string;
    /** Classes for row value */
    rowValue?: string;
    /** Classes for the transaction key section separator */
    separator?: string;
    /** ClassNames for the hash link (Tx Hash row) */
    hashLink?: HashLinkProps['classNames'];
    /** ClassNames for original hash link in replaced transactions (falls back to hashLink) */
    originalHashLink?: HashLinkProps['classNames'];
  };
};

export type TxInfoBlockProps<T extends Transaction> = {
  /** The transaction object to display, which can be a full transaction or an initial one. */
  tx: T | InitialTransaction;
  className?: string;
  customization?: TxInfoBlockCustomization<T>;
} & Pick<NovaTransactionsProviderProps<T>, 'adapter'>;

// --- Default Sub-Component ---
function DefaultInfoRow({ label, value, classNames }: CustomInfoRowProps) {
  return (
    <div
      className={cn(
        'novatx:flex novatx:items-center novatx:justify-between novatx:text-sm novatx:gap-2',
        classNames?.row,
      )}
    >
      <span className={cn('novatx:text-[var(--tuwa-text-secondary)]', classNames?.label)}>{label}</span>
      <span className={cn('novatx:font-medium novatx:text-[var(--tuwa-text-primary)]', classNames?.value)}>
        {value}
      </span>
    </div>
  );
}

/**
 * A component that displays a block of essential transaction details,
 * such as network, timestamps, Solana-specific details, and relevant hashes/keys.
 */
export function TxInfoBlock<T extends Transaction>({ tx, adapter, className, customization }: TxInfoBlockProps<T>) {
  const { txInfo, statuses, hashLabels } = useLabels();

  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter });

  if (!foundAdapter) return null;

  const { InfoRow = DefaultInfoRow } = customization?.components ?? {};
  const classNames = customization?.classNames;
  const rowClassNames = { row: classNames?.row, label: classNames?.rowLabel, value: classNames?.rowValue };
  const chainId = 'chainId' in tx ? tx.chainId : tx.desiredChainID;
  const isSolanaTransaction = tx.adapter === OrbitAdapter.SOLANA;
  const solanaTx = isSolanaTransaction ? (tx as SolanaTransaction) : undefined;

  return (
    <div
      className={cn(
        'novatx:flex novatx:flex-col novatx:gap-3 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:p-3',
        classNames?.container,
        className,
      )}
    >
      <InfoRow
        label={txInfo.network}
        value={
          <div className="novatx:flex novatx:items-center novatx:justify-end novatx:gap-2">
            <div className="novatx:h-4 novatx:w-4">
              <NetworkIcon chainId={setChainId(chainId)} />
            </div>
            <span>{getChainName(setChainId(chainId))}</span>
          </div>
        }
        classNames={rowClassNames}
      />
      {tx.localTimestamp && (
        <InfoRow
          label={txInfo.started}
          value={dayjs.unix(tx.localTimestamp).format('MMM D, HH:mm:ss')}
          classNames={rowClassNames}
        />
      )}

      {isSolanaTransaction && (
        <>
          {solanaTx?.slot && (
            <InfoRow
              label={txInfo.slot}
              value={
                <HashLink
                  hash={solanaTx.slot.toString()}
                  explorerUrl={
                    foundAdapter?.getExplorerUrl
                      ? `${foundAdapter?.getExplorerUrl(`/block/${solanaTx.slot}`)}`
                      : undefined
                  }
                />
              }
              classNames={rowClassNames}
            />
          )}
          {(typeof solanaTx?.confirmations === 'number' || typeof solanaTx?.confirmations === 'string') && (
            <InfoRow label={statuses.confirmationsLabel} value={solanaTx.confirmations} classNames={rowClassNames} />
          )}
          {solanaTx?.recentBlockhash && (
            <InfoRow
              label={hashLabels.recentBlockhash}
              value={<HashLink hash={solanaTx.recentBlockhash} />}
              classNames={rowClassNames}
            />
          )}
        </>
      )}

      {'txKey' in tx && tx.txKey && (
        <div
          className={cn(
            'novatx:border-t novatx:border-[var(--tuwa-border-primary)] novatx:pt-3',
            classNames?.separator,
          )}
        >
          <TransactionKey
            tx={tx as T}
            adapter={adapter}
            variant="history"
            renderHashLink={customization?.components?.transactionKey}
            hashLinkClassNames={classNames?.hashLink}
            originalHashLinkClassNames={classNames?.originalHashLink}
          />
        </div>
      )}
    </div>
  );
}
