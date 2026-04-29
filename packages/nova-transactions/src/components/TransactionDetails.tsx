/**
 * @file This file contains the `TransactionDetails` component, which displays a universal,
 * highly-detailed view of a transaction including metadata and execution data.
 */

import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  KeyIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { cn, getChainName, NetworkIcon, useCopyToClipboard } from '@tuwaio/nova-core';
import { OrbitAdapter, selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  SolanaTransaction,
  StarknetTransaction,
  Transaction,
  TransactionStatus,
} from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { ComponentType, ReactNode, useMemo } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';

// --- Sub-components Prop Types ---

/** Props for a copyable field block */
export type CopyableFieldProps = {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
  children?: ReactNode;
  classNames?: {
    label?: string;
    container?: string;
    code?: string;
    copyButton?: string;
  };
};

/** Props for a single detail item (Label + Value) */
export type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  className?: string;
  classNames?: {
    label?: string;
    value?: string;
  };
};

/** Props for a row in the metadata section */
export type MetadataRowProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
  className?: string;
  classNames?: {
    icon?: string;
    label?: string;
    value?: string;
  };
};

/** Props for a JSON/Code block */
export type JsonBlockProps = {
  label: string;
  data: unknown;
  className?: string;
  classNames?: {
    header?: string;
    label?: string;
    copyButton?: string;
    container?: string;
    pre?: string;
  };
};

// --- Default Sub-components ---

const SectionCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      'novatx:overflow-hidden novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-secondary)]',
      className,
    )}
  >
    {children}
  </div>
);

const SectionHeading = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h4
    className={cn(
      'novatx:mb-2 novatx:border-b novatx:border-[var(--tuwa-border-primary)] novatx:pb-2 novatx:text-[10px] novatx:font-black novatx:uppercase novatx:tracking-widest novatx:text-[var(--tuwa-text-primary)] sm:novatx:mb-4 sm:novatx:pb-4',
      className,
    )}
  >
    {children}
  </h4>
);

const FieldLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      'novatx:block novatx:text-[10px] novatx:font-black novatx:uppercase novatx:tracking-widest novatx:text-[var(--tuwa-text-tertiary)]',
      className,
    )}
  >
    {children}
  </span>
);

const CopyButton = ({ value, className, size = 'md' }: { value: string; className?: string; size?: 'sm' | 'md' }) => {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  const iconSize = size === 'sm' ? 'novatx:h-3.5 novatx:w-3.5' : 'novatx:h-4 novatx:w-4';

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      className={cn(
        'novatx:cursor-pointer novatx:p-2 novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors novatx:hover:text-[var(--tuwa-text-accent)]',
        size === 'sm' && 'novatx:p-1',
        className,
      )}
      title={isCopied ? txError.copied : actions.copy}
      aria-label={isCopied ? txError.copied : actions.copy}
    >
      {isCopied ? (
        <CheckIcon className={cn(iconSize, 'novatx:text-[var(--tuwa-success-icon)]')} />
      ) : (
        <DocumentDuplicateIcon className={iconSize} />
      )}
    </button>
  );
};

const DefaultCopyableField = ({ label, value, mono = true, className, children, classNames }: CopyableFieldProps) => {
  return (
    <div className={cn('novatx:space-y-1.5', className)}>
      <FieldLabel className={classNames?.label}>{label}</FieldLabel>
      <div className={cn('novatx:flex novatx:items-center novatx:gap-2', classNames?.container)}>
        {children || (
          <code
            className={cn(
              'novatx:min-w-0 novatx:flex-1 novatx:truncate novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-muted)]/50 novatx:px-3 novatx:py-2 novatx:text-xs novatx:text-[var(--tuwa-text-primary)]',
              mono && 'novatx:font-mono',
              classNames?.code,
            )}
            title={value}
          >
            {value}
          </code>
        )}
        <CopyButton value={value} className={classNames?.copyButton} />
      </div>
    </div>
  );
};

const DefaultDetailItem = ({ label, value, mono = false, className, classNames }: DetailItemProps) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={cn('novatx:space-y-1', className)}>
      <FieldLabel className={classNames?.label}>{label}</FieldLabel>
      <span
        className={cn(
          'novatx:block novatx:break-all novatx:text-sm novatx:font-bold novatx:text-[var(--tuwa-text-primary)]',
          mono && 'novatx:font-mono novatx:text-xs',
          classNames?.value,
        )}
      >
        {value}
      </span>
    </div>
  );
};

const DefaultMetadataRow = ({ icon: Icon, label, children, className, classNames }: MetadataRowProps) => (
  <div className={cn('novatx:flex novatx:items-center novatx:justify-between novatx:py-2.5', className)}>
    <div className="novatx:flex novatx:min-w-0 novatx:items-center novatx:gap-2.5">
      <Icon
        className={cn(
          'novatx:h-4 novatx:w-4 novatx:shrink-0 novatx:text-[var(--tuwa-text-tertiary)]',
          classNames?.icon,
        )}
      />
      <span className={cn('novatx:truncate novatx:text-xs novatx:text-[var(--tuwa-text-tertiary)]', classNames?.label)}>
        {label}
      </span>
    </div>
    <div
      className={cn(
        'novatx:ml-4 novatx:max-w-[55%] novatx:shrink-0 novatx:truncate novatx:text-right novatx:text-xs novatx:font-bold novatx:text-[var(--tuwa-text-primary)]',
        classNames?.value,
      )}
    >
      {children}
    </div>
  </div>
);

const DefaultJsonBlock = ({ label, data, className, classNames }: JsonBlockProps) => {
  if (!data || (typeof data === 'object' && Object.keys(data as object).length === 0)) return null;
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div className={cn('novatx:space-y-2', className)}>
      <div className={cn('novatx:flex novatx:items-center novatx:justify-between', classNames?.header)}>
        <FieldLabel className={classNames?.label}>{label}</FieldLabel>
        <CopyButton value={jsonStr} size="sm" className={classNames?.copyButton} />
      </div>
      <div
        className={cn(
          'NovaCustomScroll novatx:max-h-[300px] novatx:overflow-auto novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-muted)]/50 novatx:p-3',
          classNames?.container,
        )}
      >
        <pre
          className={cn(
            'novatx:font-mono novatx:text-[10px] novatx:leading-relaxed novatx:text-[var(--tuwa-text-primary)] novatx:whitespace-pre-wrap',
            classNames?.pre,
          )}
        >
          {jsonStr}
        </pre>
      </div>
    </div>
  );
};

// --- Customization Types ---

export type TransactionDetailsCustomization = {
  /** Custom class names for all sub-elements */
  classNames?: {
    container?: string;
    header?: string;
    backButton?: string;
    statusIconContainer?: string;
    title?: string;
    subtitle?: string;
    coreInfoCard?: string;
    networkBadge?: string;
    metadataSection?: string;
    executionSection?: string;
  };
  /** Custom components to override default elements */
  components?: {
    SectionCard?: ComponentType<{ children: ReactNode; className?: string }>;
    SectionHeading?: ComponentType<{ children: ReactNode; className?: string }>;
    CopyableField?: ComponentType<CopyableFieldProps>;
    DetailItem?: ComponentType<DetailItemProps>;
    MetadataRow?: ComponentType<MetadataRowProps>;
    JsonBlock?: ComponentType<JsonBlockProps>;
  };
};

export type TransactionDetailsProps<T extends Transaction> = Pick<NovaTransactionsProviderProps<T>, 'adapter'> & {
  tx: T;
  onBack: () => void;
  className?: string;
  customization?: TransactionDetailsCustomization;
};

const EvmExecutionData = ({
  tx,
  labels,
  components: { DetailItem, CopyableField },
}: {
  tx: EvmTransaction;
  labels: ReturnType<typeof useLabels>['transactionDetails'];
  components: {
    DetailItem: ComponentType<DetailItemProps>;
    CopyableField: ComponentType<CopyableFieldProps>;
  };
}) => (
  <div className="novatx:grid novatx:grid-cols-1 novatx:gap-6 sm:novatx:grid-cols-2 lg:novatx:grid-cols-3">
    <DetailItem label={labels.nonce} value={tx.nonce} />
    <DetailItem label={labels.maxFee} value={tx.maxFeePerGas} />
    <DetailItem label={labels.maxPriorityFee} value={tx.maxPriorityFeePerGas} />
    <DetailItem label={labels.value} value={tx.value} />
    {tx.replacedTxHash && <CopyableField label={labels.replacedHash} value={tx.replacedTxHash} />}
  </div>
);

const SolanaExecutionData = ({
  tx,
  labels,
  components: { DetailItem, CopyableField },
}: {
  tx: SolanaTransaction;
  labels: ReturnType<typeof useLabels>['transactionDetails'];
  components: {
    DetailItem: ComponentType<DetailItemProps>;
    CopyableField: ComponentType<CopyableFieldProps>;
  };
}) => (
  <div className="novatx:grid novatx:grid-cols-1 novatx:gap-6 sm:novatx:grid-cols-2">
    <DetailItem label={labels.fee} value={tx.fee} />
    <DetailItem label={labels.slot} value={tx.slot} />
    {tx.recentBlockhash && <CopyableField label={labels.recentBlockhash} value={tx.recentBlockhash} />}
  </div>
);

const StarknetExecutionData = ({
  tx,
  labels,
  components: { DetailItem, CopyableField },
}: {
  tx: StarknetTransaction;
  labels: ReturnType<typeof useLabels>['transactionDetails'];
  components: {
    DetailItem: ComponentType<DetailItemProps>;
    CopyableField: ComponentType<CopyableFieldProps>;
  };
}) => (
  <div className="novatx:grid novatx:grid-cols-1 novatx:gap-6 sm:novatx:grid-cols-2">
    {tx.contractAddress && <CopyableField label={labels.contractAddress} value={tx.contractAddress} />}
    <DetailItem
      label={labels.actualFee}
      value={tx.actualFee ? `${tx.actualFee.amount} ${tx.actualFee.unit}` : undefined}
    />
  </div>
);

/**
 * TransactionDetails component provides a deep look into a specific transaction's metadata and execution state.
 */
export function TransactionDetails<T extends Transaction>({
  tx,
  onBack,
  adapter,
  className,
  customization,
}: TransactionDetailsProps<T>) {
  const { transactionDetails, statuses, actions, txError } = useLabels();
  const { isCopied, copy } = useCopyToClipboard();

  const foundAdapter = useMemo(() => selectAdapterByKey({ adapterKey: tx.adapter, adapter }), [tx.adapter, adapter]);

  const status = tx.pending ? 'pending' : tx.status === TransactionStatus.Success ? 'success' : 'error';

  const explorerUrl = foundAdapter?.getExplorerTxUrl?.(tx);

  // Components from customization or defaults
  const {
    SectionCard: CSectionCard = SectionCard,
    SectionHeading: CSectionHeading = SectionHeading,
    CopyableField: CCopyableField = DefaultCopyableField,
    DetailItem: CDetailItem = DefaultDetailItem,
    MetadataRow: CMetadataRow = DefaultMetadataRow,
    JsonBlock: CJsonBlock = DefaultJsonBlock,
  } = customization?.components ?? {};

  const classNames = customization?.classNames;

  const evmTx = tx.adapter === OrbitAdapter.EVM ? (tx as unknown as EvmTransaction) : null;
  const solanaTx = tx.adapter === OrbitAdapter.SOLANA ? (tx as unknown as SolanaTransaction) : null;
  const starknetTx = tx.adapter === OrbitAdapter.Starknet ? (tx as unknown as StarknetTransaction) : null;

  return (
    <div className={cn('novatx:flex novatx:flex-col novatx:gap-6 novatx:p-4', className, classNames?.container)}>
      {/* ── Header ── */}
      <div className={cn('novatx:flex novatx:items-center novatx:justify-between', classNames?.header)}>
        <div className="novatx:flex novatx:items-center novatx:gap-3">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'novatx:cursor-pointer novatx:rounded-full novatx:p-2 novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]',
              classNames?.backButton,
            )}
            title={actions.close}
          >
            <ArrowLeftIcon className="novatx:h-5 novatx:w-5" />
          </button>
          <div>
            <h3
              className={cn(
                'novatx:text-lg novatx:font-black novatx:uppercase novatx:tracking-tight novatx:text-[var(--tuwa-text-primary)]',
                classNames?.title,
              )}
            >
              {transactionDetails.title}
            </h3>
            <p
              className={cn(
                'novatx:text-[10px] novatx:font-bold novatx:uppercase novatx:tracking-widest novatx:text-[var(--tuwa-text-tertiary)]',
                classNames?.subtitle,
              )}
            >
              {transactionDetails.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Core Transaction Card ── */}
      <CSectionCard className={classNames?.coreInfoCard}>
        {/* Status Header */}
        <div className="novatx:flex novatx:items-center novatx:justify-between novatx:border-b novatx:border-[var(--tuwa-border-primary)] novatx:p-4">
          <div className="novatx:flex novatx:items-center novatx:gap-3">
            <div
              className={cn(
                'novatx:flex novatx:h-10 novatx:w-10 novatx:shrink-0 novatx:items-center novatx:justify-center novatx:rounded-[var(--tuwa-rounded-corners)]',
                status === 'success'
                  ? 'novatx:bg-emerald-500/10 novatx:text-emerald-500'
                  : status === 'pending'
                    ? 'novatx:bg-amber-500/10 novatx:text-amber-500'
                    : 'novatx:bg-rose-500/10 novatx:text-rose-500',
                classNames?.statusIconContainer,
              )}
            >
              {status === 'success' ? (
                <CheckCircleIcon className="novatx:h-6 novatx:w-6" />
              ) : status === 'pending' ? (
                <ClockIcon className="novatx:h-6 novatx:w-6" />
              ) : (
                <ExclamationTriangleIcon className="novatx:h-6 novatx:w-6" />
              )}
            </div>
            <div>
              <h3 className="novatx:text-lg novatx:font-black novatx:uppercase novatx:tracking-tight novatx:text-[var(--tuwa-text-primary)]">
                {tx.type}
              </h3>
              <p
                className={cn(
                  'novatx:text-[10px] novatx:font-black novatx:uppercase novatx:tracking-widest',
                  status === 'success'
                    ? 'novatx:text-emerald-500'
                    : status === 'pending'
                      ? 'novatx:text-amber-500'
                      : 'novatx:text-rose-500',
                )}
              >
                {tx.pending ? statuses.pending : (tx.status ?? statuses.failed)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="novatx:flex novatx:flex-col novatx:gap-4 novatx:p-4">
          <div className="novatx:grid novatx:grid-cols-1 novatx:gap-4 sm:novatx:grid-cols-2">
            <CCopyableField
              label={transactionDetails.hash}
              value={evmTx?.hash || tx.txKey}
              className="novatx:min-w-0"
              classNames={{
                code: explorerUrl ? 'novatx:p-0 novatx:border-none novatx:bg-transparent' : undefined,
              }}
            >
              {explorerUrl ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="novatx:block novatx:truncate novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-muted)]/50 novatx:px-3 novatx:py-2 novatx:text-xs novatx:font-mono novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80"
                >
                  {evmTx?.hash || tx.txKey}
                </a>
              ) : null}
            </CCopyableField>

            <div className="novatx:space-y-1.5">
              <FieldLabel>{transactionDetails.network}</FieldLabel>
              <div
                className={cn(
                  'novatx:flex novatx:h-[42px] novatx:items-center novatx:gap-3 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-muted)]/50 novatx:px-4',
                  classNames?.networkBadge,
                )}
              >
                <NetworkIcon chainId={setChainId(tx.chainId)} className="novatx:h-5 novatx:w-5 novatx:shrink-0" />
                <span className="novatx:truncate novatx:text-sm novatx:font-bold novatx:text-[var(--tuwa-text-primary)]">
                  {getChainName(setChainId(tx.chainId)).name}
                </span>
                <span className="novatx:ml-auto novatx:shrink-0 novatx:font-mono novatx:text-[10px] novatx:text-[var(--tuwa-text-tertiary)]">
                  ID: {tx.chainId}
                </span>
              </div>
            </div>
          </div>

          <div className="novatx:grid novatx:grid-cols-1 novatx:gap-8 sm:novatx:grid-cols-2">
            <CCopyableField label={transactionDetails.from} value={tx.from} />
            {evmTx?.to ? (
              <CCopyableField label={transactionDetails.to} value={evmTx.to} />
            ) : (
              <CDetailItem label={transactionDetails.to} value="—" />
            )}
          </div>
        </div>
      </CSectionCard>

      {/* ── Metadata Section ── */}
      <CSectionCard className={cn('novatx:p-4', classNames?.metadataSection)}>
        <CSectionHeading>{transactionDetails.metadata}</CSectionHeading>
        <div className="novatx:divide-y novatx:divide-[var(--tuwa-border-primary)]">
          <CMetadataRow icon={GlobeAltIcon} label={transactionDetails.adapter}>
            <span className="novatx:capitalize">{tx.adapter}</span>
          </CMetadataRow>
          <CMetadataRow icon={ClockIcon} label={transactionDetails.submittedAt}>
            {dayjs.unix(tx.localTimestamp).format('MMM D, YYYY HH:mm:ss')}
          </CMetadataRow>
          {tx.finishedTimestamp && (
            <CMetadataRow icon={CheckCircleIcon} label={transactionDetails.finishedAt}>
              {dayjs.unix(tx.finishedTimestamp).format('MMM D, YYYY HH:mm:ss')}
            </CMetadataRow>
          )}
          <CMetadataRow icon={CpuChipIcon} label={transactionDetails.tracker}>
            <span className="novatx:capitalize">{tx.tracker}</span>
          </CMetadataRow>
          <CMetadataRow icon={LinkIcon} label={transactionDetails.connector}>
            <span className="novatx:capitalize">{tx.connectorType}</span>
          </CMetadataRow>
          {tx.confirmations && Number(tx.confirmations) > 0 && (
            <CMetadataRow icon={CheckBadgeIcon} label={transactionDetails.confirmations}>
              {tx.confirmations}
              {tx.requiredConfirmations ? ` / ${tx.requiredConfirmations}` : ''}
            </CMetadataRow>
          )}
          {tx.rpcUrl && (
            <CMetadataRow icon={GlobeAltIcon} label={transactionDetails.rpcUrl}>
              <span className="novatx:block novatx:max-w-[200px] novatx:truncate" title={tx.rpcUrl}>
                {tx.rpcUrl}
              </span>
            </CMetadataRow>
          )}
          <CMetadataRow icon={KeyIcon} label={transactionDetails.txKey}>
            <div className="novatx:flex novatx:min-w-0 novatx:items-center novatx:gap-1.5">
              <span className="novatx:truncate font-mono">{tx.txKey}</span>
              <CopyButton value={tx.txKey} size="sm" className="novatx:p-0" />
            </div>
          </CMetadataRow>
        </div>
      </CSectionCard>

      {/* ── Execution Data Section (Unified) ── */}
      <CSectionCard className={cn('novatx:p-4', classNames?.executionSection)}>
        <CSectionHeading>{transactionDetails.executionData}</CSectionHeading>

        <div className="novatx:space-y-6">
          {/* Chain Specific Metrics */}
          {evmTx && (
            <EvmExecutionData
              tx={evmTx}
              labels={transactionDetails}
              components={{ DetailItem: CDetailItem, CopyableField: CCopyableField }}
            />
          )}

          {solanaTx && (
            <SolanaExecutionData
              tx={solanaTx}
              labels={transactionDetails}
              components={{ DetailItem: CDetailItem, CopyableField: CCopyableField }}
            />
          )}

          {starknetTx && (
            <StarknetExecutionData
              tx={starknetTx}
              labels={transactionDetails}
              components={{ DetailItem: CDetailItem, CopyableField: CCopyableField }}
            />
          )}

          {/* Context & Payload Blocks */}
          <div className="novatx:space-y-6 novatx:border-t novatx:border-[var(--tuwa-border-primary)] novatx:pt-6">
            {evmTx && evmTx.input && evmTx.input !== '0x' && (
              <CJsonBlock label={transactionDetails.inputData} data={evmTx.input} />
            )}
            {solanaTx && solanaTx.instructions && (
              <CJsonBlock label={transactionDetails.instructions} data={solanaTx.instructions} />
            )}

            <CJsonBlock label={transactionDetails.fullPayload} data={tx.payload} />

            <CJsonBlock label={transactionDetails.errorContext} data={tx.error} />
          </div>
        </div>
      </CSectionCard>
    </div>
  );
}
