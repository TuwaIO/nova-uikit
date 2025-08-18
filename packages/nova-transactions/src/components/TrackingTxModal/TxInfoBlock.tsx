/**
 * @file This file contains the `TxInfoBlock` component, which displays key details about a transaction.
 */

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { cn } from '@tuwaio/nova-core';
import { Transaction, TransactionPool } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { JSX, ReactNode } from 'react';
import { Chain } from 'viem';

import { useLabels } from '../../providers';
import { ToastTransactionKeyProps, TransactionKey } from '../TransactionKey';

// --- Prop Types for Customization ---
type CustomInfoRowProps = { label: ReactNode; value: ReactNode };

/**
 * Defines the customization options for the `TxInfoBlock` component.
 */
export type TxInfoBlockCustomization<TR, T extends Transaction<TR>> = {
  components?: {
    /** A render prop to replace the default label-value row component. */
    infoRow?: (props: CustomInfoRowProps) => ReactNode;
    /**
     * A render prop to customize the rendering of the transaction keys/hashes.
     * This is passed down to the underlying `TransactionKey` component.
     */
    transactionKey?: ToastTransactionKeyProps<TR, T>['renderHashLink'];
  };
};

// A local component for displaying a label-value pair.
function InfoRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--tuwa-text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--tuwa-text-primary)]">{value}</span>
    </div>
  );
}

export type TxInfoBlockProps<TR, T extends Transaction<TR>> = {
  tx: T & {
    desiredChainID?: number;
  };
  appChains: Chain[];
  transactionsPool: TransactionPool<TR, T>;
  className?: string;
  customization?: TxInfoBlockCustomization<TR, T>;
};

/**
 * A component that displays a block of essential transaction details,
 * such as network, start time, and relevant hashes/keys.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered info block.
 */
export function TxInfoBlock<TR, T extends Transaction<TR>>({
  tx,
  appChains,
  transactionsPool,
  className,
  customization,
}: TxInfoBlockProps<TR, T>): JSX.Element {
  const labels = useLabels();

  const renderInfoRow = (props: CustomInfoRowProps) => {
    return customization?.components?.infoRow ? customization.components.infoRow(props) : <InfoRow {...props} />;
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] p-3',
        className,
      )}
    >
      {/* --- Network and Timestamp Info --- */}
      {renderInfoRow({
        label: labels.txInfo.network,
        value: (
          <div className="flex items-center justify-end gap-2">
            <div className="h-4 w-4">
              <Web3Icon chainId={(tx.chainId ?? tx?.desiredChainID ?? 1) as number} />
            </div>
            <span>{getChainName((tx.chainId ?? tx?.desiredChainID ?? 1) as number)}</span>
          </div>
        ),
      })}
      {tx.localTimestamp &&
        renderInfoRow({
          label: labels.txInfo.started,
          value: dayjs.unix(tx.localTimestamp).format('MMM D, HH:mm:ss'),
        })}

      {/* --- Transaction Hashes/Keys --- */}
      {/* Reusing the TransactionKey component to avoid code duplication. */}
      <div className="border-t border-[var(--tuwa-border-primary)] pt-3">
        <TransactionKey
          tx={tx}
          appChains={appChains}
          transactionsPool={transactionsPool}
          variant="history" // 'history' variant has suitable styling for this block
          renderHashLink={customization?.components?.transactionKey}
        />
      </div>
    </div>
  );
}
