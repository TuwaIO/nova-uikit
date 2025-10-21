/**
 * @file This file contains the `TxInfoBlock` component, which displays key details about a transaction.
 * It also supports Solana-specific functionality to display slot, confirmations, and recentBlockhash details.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { cn } from '@tuwaio/nova-core';
import { OrbitAdapter, selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import { InitialTransaction, SolanaTransaction, Transaction } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { ComponentType, ReactNode } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../../providers';
import { HashLink } from '../HashLink';
import { TransactionKey, TransactionKeyProps } from '../TransactionKey';

// --- Types for Customization & Props ---
type CustomInfoRowProps = { label: ReactNode; value: ReactNode };

export type TxInfoBlockCustomization<T extends Transaction> = {
  components?: {
    InfoRow?: ComponentType<CustomInfoRowProps>;
    transactionKey?: TransactionKeyProps<T>['renderHashLink'];
  };
};

export type TxInfoBlockProps<T extends Transaction> = {
  /** The transaction object to display, which can be a full transaction or an initial one. */
  tx: T | InitialTransaction;
  className?: string;
  customization?: TxInfoBlockCustomization<T>;
} & Pick<NovaTransactionsProviderProps<T>, 'adapter'>;

// --- Default Sub-Component ---
function DefaultInfoRow({ label, value }: CustomInfoRowProps) {
  return (
    <div className="novatx:flex novatx:items-center novatx:justify-between novatx:text-sm">
      <span className="novatx:text-[var(--tuwa-text-secondary)]">{label}</span>
      <span className="novatx:font-medium novatx:text-[var(--tuwa-text-primary)]">{value}</span>
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
  const chainId = 'chainId' in tx ? tx.chainId : tx.desiredChainID;
  const isSolanaTransaction = tx.adapter === OrbitAdapter.SOLANA;
  const solanaTx = isSolanaTransaction ? (tx as SolanaTransaction) : undefined;

  return (
    <div
      className={cn(
        'novatx:flex novatx:flex-col novatx:gap-3 novatx:rounded-lg novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:p-3',
        className,
      )}
    >
      <InfoRow
        label={txInfo.network}
        value={
          <div className="novatx:flex novatx:items-center novatx:justify-end novatx:gap-2">
            <div className="novatx:h-4 novatx:w-4">
              <Web3Icon chainId={setChainId(chainId)} />
            </div>
            <span>{getChainName(setChainId(chainId))}</span>
          </div>
        }
      />
      {tx.localTimestamp && (
        <InfoRow label={txInfo.started} value={dayjs.unix(tx.localTimestamp).format('MMM D, HH:mm:ss')} />
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
            />
          )}
          {(typeof solanaTx?.confirmations === 'number' || typeof solanaTx?.confirmations === 'string') && (
            <InfoRow label={statuses.confirmationsLabel} value={solanaTx.confirmations} />
          )}
          {solanaTx?.recentBlockhash && (
            <InfoRow label={hashLabels.recentBlockhash} value={<HashLink hash={solanaTx.recentBlockhash} />} />
          )}
        </>
      )}

      {'txKey' in tx && tx.txKey && (
        <div className="novatx:border-t novatx:border-[var(--tuwa-border-primary)] novatx:pt-3">
          <TransactionKey
            tx={tx as T}
            adapter={adapter}
            variant="history"
            renderHashLink={customization?.components?.transactionKey}
          />
        </div>
      )}
    </div>
  );
}
