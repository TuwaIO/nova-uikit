/**
 * @file This file contains the `TransactionDetails` component, which displays a universal,
 * highly-detailed view of a transaction including metadata and execution data.
 */

import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CloudIcon,
  CommandLineIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { CloseIcon, cn, getChainName, NetworkIcon, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import { OrbitAdapter, selectAdapterByKey, setChainId } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  SolanaTransaction,
  StarknetTransaction,
  Transaction,
  TransactionStatus,
  TransactionTracker,
} from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { ComponentType, ReactNode, useMemo } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../providers';
import { canReplaceTx } from '../utils/canReplaceTx';
import { formatUnits } from '../utils/formatUnits';
import { statusText } from '../utils/statusText';
import { headerCloseButtonClassName, HeaderContent, headerTitleClassName } from './HeaderContent';

// --- Sub-components Prop Types ---

/** Props of a row with a copy button in {@link TransactionDetails} (hash, sender, recipient, TX key, blockhash). */
export type CopyableFieldProps = {
  /** Label shown on the left. */
  label: string;
  /** Value copied to the clipboard by the copy button; the default row shows it shortened, in full on hover. */
  value: string;
  /** Whether the value uses a monospace font. Defaults to `true`. */
  mono?: boolean;
  /** Classes of the row. */
  className?: string;
  /** Content shown instead of the value (the copy button still copies `value`); used for the explorer link. */
  children?: ReactNode;
  /** Classes of the parts of the row. */
  classNames?: {
    /** The label. */
    label?: string;
    /** The value with the copy button. */
    container?: string;
    /** The value. */
    code?: string;
    /** The copy button. */
    copyButton?: string;
  };
};

/** Props of a label and value row in {@link TransactionDetails} (execution data, context). */
export type DetailItemProps = {
  /** Label shown on the left. */
  label: string;
  /** The value. The default row renders nothing when it is `null`, `undefined` or an empty string. */
  value: string | number | null | undefined;
  /** Whether the value uses a smaller monospace font. Defaults to `false`. */
  mono?: boolean;
  /** Classes of the row. */
  className?: string;
  /** Classes of the parts of the row. */
  classNames?: {
    /** The label. */
    label?: string;
    /** The value. */
    value?: string;
  };
};

/** Props of a row of the metadata section of {@link TransactionDetails} (network, adapter, times, tracker…). */
export type MetadataRowProps = {
  /**
   * Icon component (a Heroicons icon by default), rendered with a `className`. The default row does not show it; it is
   * passed for custom rows.
   */
  icon: ComponentType<{ className?: string }>;
  /** Label shown on the left. */
  label: string;
  /** Value shown on the right. */
  children: ReactNode;
  /** Classes of the row. */
  className?: string;
  /** Classes of the parts of the row. */
  classNames?: {
    /** The icon (of custom rows). */
    icon?: string;
    /** The label. */
    label?: string;
    /** The value. */
    value?: string;
  };
};

/**
 * Props of a code block with a copy button in {@link TransactionDetails} (input data, instructions, payload, error).
 */
export type JsonBlockProps = {
  /** Label shown above the code. */
  label: string;
  /**
   * Data to show: strings as they are, other values as formatted JSON. The default block renders nothing for empty
   * values and empty objects.
   */
  data: unknown;
  /** Classes of the block. */
  className?: string;
  /** Classes of the parts of the block. */
  classNames?: {
    /** The row with the label and the copy button. */
    header?: string;
    /** The label. */
    label?: string;
    /** The copy button. */
    copyButton?: string;
    /** The scrollable container of the code. */
    container?: string;
    /** The `<pre>` element with the code. */
    pre?: string;
  };
};

/** Props of a section heading of {@link TransactionDetails}. */
export type SectionHeadingProps = {
  /** The heading text. */
  children: ReactNode;
  /** Classes of the heading. */
  className?: string;
  /** Icon component of the section (a Heroicons icon by default), rendered with a `className`. */
  icon?: ComponentType<{ className?: string }>;
};

// --- Default Sub-components ---

const SectionCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section
    className={cn(
      'novatx:flex novatx:min-w-0 novatx:flex-col novatx:gap-1.5 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:p-4 novatx:shadow-xs novatx:sm:p-5',
      className,
    )}
  >
    {children}
  </section>
);

const SectionHeading = ({ children, className, icon: Icon }: SectionHeadingProps) => (
  <div className="novatx:mb-1 novatx:flex novatx:min-w-0 novatx:items-center novatx:gap-3.5">
    {Icon && (
      <span className="novatx:flex novatx:h-10 novatx:w-10 novatx:shrink-0 novatx:items-center novatx:justify-center novatx:rounded-full novatx:bg-[var(--tuwa-text-accent)]/10 novatx:text-[var(--tuwa-text-accent)]">
        <Icon className="novatx:h-5 novatx:w-5" />
      </span>
    )}
    <h4
      className={cn(
        'novatx:m-0 novatx:min-w-0 novatx:truncate novatx:font-mono novatx:text-lg novatx:font-bold novatx:tracking-tight novatx:text-[var(--tuwa-text-primary)] novatx:sm:text-xl',
        className,
      )}
    >
      {children}
    </h4>
  </div>
);

const rowClassName =
  'novatx:flex novatx:min-w-0 novatx:items-baseline novatx:justify-between novatx:gap-4 novatx:border-b novatx:border-[var(--tuwa-border-primary)] novatx:py-2.5 novatx:text-[13px] novatx:last:border-b-0';
const rowLabelClassName = 'novatx:shrink-0 novatx:text-[var(--tuwa-text-secondary)]';
const rowValueClassName =
  'novatx:m-0 novatx:min-w-0 novatx:text-right novatx:text-[var(--tuwa-text-primary)] novatx:[overflow-wrap:anywhere]';

const CopyButton = ({ value, className, dark = false }: { value: string; className?: string; dark?: boolean }) => {
  const { isCopied, copy } = useCopyToClipboard();
  const { actions, txError } = useLabels();

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      className={cn(
        'novatx:inline-flex novatx:h-[26px] novatx:w-[26px] novatx:shrink-0 novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:self-center novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:transition-colors',
        dark
          ? 'novatx:border-slate-700 novatx:text-slate-400 novatx:hover:text-slate-100'
          : 'novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:text-[var(--tuwa-text-secondary)] novatx:hover:text-[var(--tuwa-text-accent)]',
        className,
      )}
      title={isCopied ? txError.copied : actions.copy}
      aria-label={isCopied ? txError.copied : actions.copy}
    >
      {isCopied ? (
        <CheckIcon className="novatx:h-3.5 novatx:w-3.5 novatx:text-[var(--tuwa-success-icon)]" />
      ) : (
        <DocumentDuplicateIcon className="novatx:h-3.5 novatx:w-3.5" />
      )}
    </button>
  );
};

const DefaultCopyableField = ({ label, value, mono = true, className, children, classNames }: CopyableFieldProps) => (
  <div className={cn(rowClassName, className)}>
    <dt className={cn(rowLabelClassName, classNames?.label)}>{label}</dt>
    <dd
      className={cn(rowValueClassName, 'novatx:inline-flex novatx:items-center novatx:gap-1.5', classNames?.container)}
    >
      {children || (
        <span
          className={cn('novatx:truncate', mono && 'novatx:font-mono novatx:text-[13px]', classNames?.code)}
          title={value}
        >
          {textCenterEllipsis(value, 8, 8)}
        </span>
      )}
      <CopyButton value={value} className={classNames?.copyButton} />
    </dd>
  </div>
);

const DefaultDetailItem = ({ label, value, mono = false, className, classNames }: DetailItemProps) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={cn(rowClassName, className)}>
      <dt className={cn(rowLabelClassName, classNames?.label)}>{label}</dt>
      <dd className={cn(rowValueClassName, mono && 'novatx:font-mono novatx:text-xs', classNames?.value)}>{value}</dd>
    </div>
  );
};

const DefaultMetadataRow = ({ label, children, className, classNames }: MetadataRowProps) => (
  <div className={cn(rowClassName, className)}>
    <dt className={cn(rowLabelClassName, classNames?.label)}>{label}</dt>
    <dd className={cn(rowValueClassName, classNames?.value)}>{children}</dd>
  </div>
);

const DefaultJsonBlock = ({ label, data, className, classNames }: JsonBlockProps) => {
  if (!data || (typeof data === 'object' && Object.keys(data as object).length === 0)) return null;
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div
      className={cn(
        'novatx:mt-2 novatx:overflow-hidden novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-slate-800 novatx:bg-slate-900',
        className,
      )}
    >
      <div
        className={cn(
          'novatx:flex novatx:items-center novatx:justify-between novatx:gap-2 novatx:border-b novatx:border-slate-800 novatx:py-1 novatx:pr-1.5 novatx:pl-4',
          classNames?.header,
        )}
      >
        <span className={cn('novatx:font-mono novatx:text-[11px] novatx:text-slate-400', classNames?.label)}>
          {label}
        </span>
        <CopyButton value={jsonStr} dark className={classNames?.copyButton} />
      </div>
      <div className={cn('NovaCustomScroll novatx:max-h-[300px] novatx:overflow-auto', classNames?.container)}>
        <pre
          className={cn(
            'novatx:m-0 novatx:px-5 novatx:py-4 novatx:font-mono novatx:text-[13px] novatx:leading-relaxed novatx:whitespace-pre-wrap novatx:text-slate-200 novatx:[overflow-wrap:anywhere]',
            classNames?.pre,
          )}
        >
          {jsonStr}
        </pre>
      </div>
    </div>
  );
};

type BadgeTone = 'success' | 'pending' | 'error' | 'info' | 'muted';

const BADGE_TONES: Record<BadgeTone, string> = {
  success:
    'novatx:border-[var(--tuwa-success-icon)]/25 novatx:bg-[var(--tuwa-success-bg)] novatx:text-[var(--tuwa-success-text)]',
  pending:
    'novatx:border-[var(--tuwa-pending-icon)]/25 novatx:bg-[var(--tuwa-pending-bg)] novatx:text-[var(--tuwa-pending-text)]',
  error:
    'novatx:border-[var(--tuwa-error-icon)]/25 novatx:bg-[var(--tuwa-error-bg)] novatx:text-[var(--tuwa-error-text)]',
  info: 'novatx:border-[var(--tuwa-info-icon)]/25 novatx:bg-[var(--tuwa-info-bg)] novatx:text-[var(--tuwa-info-text)]',
  muted: 'novatx:border-transparent novatx:bg-[var(--tuwa-bg-muted)] novatx:text-[var(--tuwa-text-secondary)]',
};

const Badge = ({
  tone,
  icon: Icon,
  children,
  title,
  className,
}: {
  tone: BadgeTone;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  title?: string;
  className?: string;
}) => (
  <span
    title={title}
    className={cn(
      'novatx:inline-flex novatx:items-center novatx:gap-1.5 novatx:whitespace-nowrap novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:px-2 novatx:py-0.5 novatx:text-[10px] novatx:font-black novatx:uppercase novatx:tracking-widest',
      BADGE_TONES[tone],
      className,
    )}
  >
    {Icon && <Icon className="novatx:h-3.5 novatx:w-3.5" aria-hidden="true" />}
    {children}
  </span>
);

const actionButtonClassName =
  'novatx:inline-flex novatx:h-9 novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:gap-2 novatx:whitespace-nowrap novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:px-4 novatx:font-mono novatx:text-sm novatx:font-bold novatx:tracking-tight novatx:text-[var(--tuwa-text-primary)] novatx:no-underline novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)]';

// --- Customization Types ---

/** Class names and replacement components for the parts of {@link TransactionDetails}. */
export type TransactionDetailsCustomization = {
  /** Classes added to the parts of the view. */
  classNames?: {
    /** The whole view. */
    container?: string;
    /** The header row with the back button, the title and the close button. */
    header?: string;
    /** The back button. */
    backButton?: string;
    /** The close button (shown with `onClose`). */
    closeButton?: string;
    /** The status badge in the status row. */
    statusIconContainer?: string;
    /** The title (the `transactionDetails.title` label). */
    title?: string;
    /** The subtitle under the title (the `transactionDetails.subtitle` label). */
    subtitle?: string;
    /** The part under the header: the status row and the sections. */
    body?: string;
    /** The status row: status, type, sync status and the explorer link or the speed-up and cancel buttons. */
    coreInfoCard?: string;
    /** The explorer link and the speed-up and cancel buttons. */
    actionButton?: string;
    /** The headings of the sections. */
    sectionHeader?: string;
    /** The network in the metadata section. */
    networkBadge?: string;
    /** The metadata section. */
    metadataSection?: string;
    /** The execution data section of the chain. */
    executionSection?: string;
    /** The context and payload section. */
    contextSection?: string;
  };
  /** Components that replace the default parts. */
  components?: {
    /** A card around a section (props: `children`, `className`). */
    SectionCard?: ComponentType<{ children: ReactNode; className?: string }>;
    /** A section heading with the icon of the section. */
    SectionHeading?: ComponentType<SectionHeadingProps>;
    /** A row with a copy button. */
    CopyableField?: ComponentType<CopyableFieldProps>;
    /** A label and value row. */
    DetailItem?: ComponentType<DetailItemProps>;
    /** A row of the metadata section. */
    MetadataRow?: ComponentType<MetadataRowProps>;
    /** A code block with a copy button. */
    JsonBlock?: ComponentType<JsonBlockProps>;
  };
};

/**
 * Props of {@link TransactionDetails}.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 */
export type TransactionDetailsProps<T extends Transaction> = Pick<NovaTransactionsProviderProps<T>, 'adapter'> & {
  /** The transaction to show. */
  tx: T;
  /** Called by the back button. */
  onBack: () => void;
  /** Called by the close button of the header; without it the header has no close button. */
  onClose?: () => void;
  /**
   * Leaves out the header (back button, title and close button), for a container that shows its own, as
   * {@link TransactionsInfoModal} does. Defaults to `false`.
   */
  hideHeader?: boolean;
  /** Classes of the view. */
  className?: string;
  /** Class names and replacement components for the parts of the view. */
  customization?: TransactionDetailsCustomization;
};

const formatTime = (timestamp: number) => dayjs.unix(timestamp).format('MMM D, YYYY, HH:mm:ss');

/**
 * A detailed view of one transaction, shown by {@link TransactionsHistory} and {@link TransactionsInfoModal} when a
 * transaction is selected, laid out as the transaction page of the Quasar dashboard:
 *
 * - a header with the back button, the title and, with `onClose`, the close button (left out with `hideHeader`);
 * - a status row with the status, the type and whether the transaction is saved on the server of the Pulsar store
 *   (`syncStatus`); on the right, the explorer link of the adapter's `getExplorerTxUrl`, or, for a pending,
 *   unconfirmed `ethereum`-tracker transaction sent with MetaMask whose adapter has `speedUpTxAction` and
 *   `cancelTxAction`, the speed-up and cancel buttons (the rule of {@link TrackingTxModal});
 * - Metadata: the hash (linked to the explorer), network, sender, recipient, adapter, submission and finish times,
 *   tracker, connector, confirmations while pending, the transaction key when it differs from the hash (Gelato, Safe,
 *   ERC-4337);
 * - the execution data of the chain (EVM: nonce, fees in gwei, value in wei, replaced hash, input data; Solana: fee in
 *   SOL, slot, recent blockhash, instructions; Starknet: contract address, actual fee);
 * - Context & Payload: the title and description of the current status, the error and the payload.
 *
 * Sections without data are left out. The RPC URL of the transaction is not shown, since it may contain an API key.
 * Values can be copied to the clipboard.
 *
 * @typeParam T - The transaction type of the Pulsar store.
 * @param props - See {@link TransactionDetailsProps}.
 * @returns The view.
 */
export function TransactionDetails<T extends Transaction>({
  tx,
  onBack,
  onClose,
  hideHeader = false,
  adapter,
  className,
  customization,
}: TransactionDetailsProps<T>) {
  const { transactionDetails, statuses, actions } = useLabels();

  const foundAdapter = useMemo(() => selectAdapterByKey({ adapterKey: tx.adapter, adapter }), [tx.adapter, adapter]);

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

  // The on-chain hash: the hash of an EVM transaction (the TX key for the ethereum tracker), the TX key otherwise
  const hash = evmTx ? (evmTx.hash ?? (tx.tracker === TransactionTracker.Ethereum ? tx.txKey : undefined)) : tx.txKey;
  const explorerUrl = foundAdapter?.getExplorerTxUrl?.(tx);
  const canReplace = canReplaceTx(tx, foundAdapter);
  const chainId = setChainId(tx.chainId);

  const isConfirmed = tx.pending && 'confirmationStatus' in tx && tx.confirmationStatus === 'confirmed';
  const status: { tone: BadgeTone; icon: ComponentType<{ className?: string }>; label: string } = tx.pending
    ? isConfirmed
      ? { tone: 'success', icon: CheckCircleIcon, label: statuses.confirmed }
      : { tone: 'pending', icon: ClockIcon, label: statuses.pending }
    : tx.status === TransactionStatus.Success
      ? { tone: 'success', icon: CheckCircleIcon, label: statuses.success }
      : tx.status === TransactionStatus.Failed
        ? { tone: 'error', icon: ExclamationTriangleIcon, label: statuses.failed }
        : tx.status === TransactionStatus.Replaced
          ? { tone: 'info', icon: ArrowPathIcon, label: statuses.replaced }
          : { tone: 'info', icon: ExclamationTriangleIcon, label: tx.status ?? statuses.unknown };

  const syncBadge =
    tx.syncStatus === 'pending-sync' ? (
      <Badge tone="pending" icon={CloudArrowUpIcon} title={transactionDetails.syncStatus.pendingTooltip}>
        {transactionDetails.syncStatus.pending}
      </Badge>
    ) : tx.syncStatus === 'synced' ? (
      <Badge tone="muted" icon={CloudIcon} title={transactionDetails.syncStatus.syncedTooltip}>
        {transactionDetails.syncStatus.synced}
      </Badge>
    ) : null;

  const showConfirmations = tx.pending && tx.confirmations !== null && tx.confirmations !== undefined;
  const showTxKey = tx.txKey !== hash;

  // Execution data of the chain
  const evmFees = evmTx && {
    maxFee: formatUnits(evmTx.maxFeePerGas, 9),
    maxPriorityFee: formatUnits(evmTx.maxPriorityFeePerGas, 9),
  };
  const evmInput = evmTx?.input && evmTx.input !== '0x' ? evmTx.input : undefined;
  const hasEvmData = !!(
    evmTx &&
    (evmTx.nonce !== undefined ||
      evmFees?.maxFee ||
      evmFees?.maxPriorityFee ||
      evmTx.value !== undefined ||
      evmTx.replacedTxHash ||
      evmInput)
  );
  const solanaFee = solanaTx ? formatUnits(solanaTx.fee, 9) : undefined;
  const solanaInstructions = solanaTx?.instructions?.length ? solanaTx.instructions : undefined;
  const hasSolanaData = !!(
    solanaTx &&
    (solanaFee || solanaTx.slot !== undefined || solanaTx.recentBlockhash || solanaInstructions)
  );
  const hasStarknetData = !!(starknetTx && (starknetTx.contractAddress || starknetTx.actualFee));

  // Context and payload
  const titleContext = statusText(tx.title, tx.status);
  const descriptionContext = statusText(tx.description, tx.status);
  const hasPayload = !!tx.payload && Object.keys(tx.payload).length > 0;
  const hasError = !!tx.error && Object.keys(tx.error).length > 0;
  const hasContext = !!(titleContext || descriptionContext || hasPayload || hasError);

  return (
    <div className={cn('novatx:flex novatx:min-w-0 novatx:flex-col', className, classNames?.container)}>
      {!hideHeader && (
        <header
          className={cn(
            'novatx:sticky novatx:top-0 novatx:z-10 novatx:flex novatx:items-center novatx:gap-3 novatx:border-b novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:px-4 novatx:py-3.5 novatx:sm:px-5 novatx:sm:py-4',
            classNames?.header,
          )}
        >
          <HeaderContent
            title={<h3 className={cn(headerTitleClassName, classNames?.title)}>{transactionDetails.title}</h3>}
            subtitle={transactionDetails.subtitle}
            onBack={onBack}
            backLabel={transactionDetails.back}
            classNames={{ backButton: classNames?.backButton, subtitle: classNames?.subtitle }}
            closeButton={
              onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={actions.close}
                  title={actions.close}
                  className={cn(headerCloseButtonClassName, classNames?.closeButton)}
                >
                  <CloseIcon />
                </button>
              )
            }
          />
        </header>
      )}

      <div
        className={cn(
          'novatx:flex novatx:min-w-0 novatx:flex-col novatx:gap-4 novatx:bg-[var(--tuwa-bg-secondary)] novatx:p-4 novatx:sm:p-5',
          classNames?.body,
        )}
      >
        {/* ── Status row ── */}
        <div
          className={cn(
            'novatx:flex novatx:flex-wrap novatx:items-center novatx:justify-between novatx:gap-3',
            classNames?.coreInfoCard,
          )}
        >
          <div className="novatx:flex novatx:min-w-0 novatx:flex-wrap novatx:items-center novatx:gap-2">
            <Badge tone={status.tone} icon={status.icon} className={classNames?.statusIconContainer}>
              {status.label}
            </Badge>
            <code className="novatx:font-mono novatx:text-xs novatx:text-[var(--tuwa-text-secondary)] novatx:[overflow-wrap:anywhere]">
              {tx.type}
            </code>
            {syncBadge}
          </div>
          {canReplace ? (
            <div className="novatx:flex novatx:flex-wrap novatx:gap-2">
              <button
                type="button"
                onClick={() => foundAdapter?.speedUpTxAction?.(tx)}
                className={cn(actionButtonClassName, classNames?.actionButton)}
              >
                <BoltIcon className="novatx:h-4 novatx:w-4" aria-hidden="true" />
                {actions.speedUp}
              </button>
              <button
                type="button"
                onClick={() => foundAdapter?.cancelTxAction?.(tx)}
                className={cn(actionButtonClassName, classNames?.actionButton)}
              >
                <XCircleIcon className="novatx:h-4 novatx:w-4" aria-hidden="true" />
                {actions.cancel}
              </button>
            </div>
          ) : (
            explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(actionButtonClassName, classNames?.actionButton)}
              >
                <ArrowTopRightOnSquareIcon className="novatx:h-4 novatx:w-4" aria-hidden="true" />
                {actions.viewOnExplorer}
              </a>
            )
          )}
        </div>

        {/* ── Metadata ── */}
        <CSectionCard className={classNames?.metadataSection}>
          <CSectionHeading icon={DocumentTextIcon} className={classNames?.sectionHeader}>
            {transactionDetails.metadata}
          </CSectionHeading>
          <dl className="novatx:m-0">
            {hash ? (
              <CCopyableField label={transactionDetails.hash} value={hash}>
                {explorerUrl ? (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={hash}
                    className="novatx:truncate novatx:font-mono novatx:text-[13px] novatx:text-[var(--tuwa-text-accent)] novatx:no-underline novatx:hover:underline"
                  >
                    {textCenterEllipsis(hash, 8, 8)}
                  </a>
                ) : null}
              </CCopyableField>
            ) : (
              <CDetailItem label={transactionDetails.hash} value="—" />
            )}
            <CMetadataRow icon={CpuChipIcon} label={transactionDetails.network}>
              <span
                className={cn(
                  'novatx:inline-flex novatx:max-w-full novatx:items-center novatx:gap-2 novatx:align-middle',
                  classNames?.networkBadge,
                )}
              >
                <span className="novatx:h-[18px] novatx:w-[18px] novatx:shrink-0">
                  <NetworkIcon chainId={chainId} />
                </span>
                <span className="novatx:truncate">{getChainName(chainId).name}</span>
                {typeof tx.chainId === 'number' && (
                  <span className="novatx:shrink-0 novatx:text-[var(--tuwa-text-tertiary)]">· {tx.chainId}</span>
                )}
              </span>
            </CMetadataRow>
            <CCopyableField label={transactionDetails.from} value={tx.from} />
            {evmTx?.to ? (
              <CCopyableField label={transactionDetails.to} value={evmTx.to} />
            ) : (
              <CDetailItem label={transactionDetails.to} value="—" />
            )}
            <CMetadataRow icon={CpuChipIcon} label={transactionDetails.adapter}>
              {tx.adapter}
            </CMetadataRow>
            <CMetadataRow icon={ClockIcon} label={transactionDetails.submittedAt}>
              {formatTime(tx.localTimestamp)}
            </CMetadataRow>
            {tx.finishedTimestamp && (
              <CMetadataRow icon={CheckCircleIcon} label={transactionDetails.finishedAt}>
                {formatTime(tx.finishedTimestamp)}
              </CMetadataRow>
            )}
            <CMetadataRow icon={CpuChipIcon} label={transactionDetails.tracker}>
              {tx.tracker}
            </CMetadataRow>
            <CMetadataRow icon={CpuChipIcon} label={transactionDetails.connector}>
              {tx.connectorType}
            </CMetadataRow>
            {showConfirmations && (
              <CMetadataRow icon={CheckCircleIcon} label={transactionDetails.confirmations}>
                {`${tx.confirmations}${tx.requiredConfirmations ? ` / ${tx.requiredConfirmations}` : ''}`}
              </CMetadataRow>
            )}
            {showTxKey && <CCopyableField label={transactionDetails.txKey} value={tx.txKey} />}
          </dl>
        </CSectionCard>

        {/* ── Execution data of the chain ── */}
        {hasEvmData && evmTx && (
          <CSectionCard className={classNames?.executionSection}>
            <CSectionHeading icon={CpuChipIcon} className={classNames?.sectionHeader}>
              {transactionDetails.evmTitle}
            </CSectionHeading>
            <dl className="novatx:m-0">
              {evmTx.nonce !== undefined && <CDetailItem label={transactionDetails.nonce} value={evmTx.nonce} />}
              {evmFees?.maxFee && <CDetailItem label={transactionDetails.maxFee} value={`${evmFees.maxFee} gwei`} />}
              {evmFees?.maxPriorityFee && (
                <CDetailItem label={transactionDetails.maxPriorityFee} value={`${evmFees.maxPriorityFee} gwei`} />
              )}
              {evmTx.value !== undefined && <CDetailItem label={transactionDetails.value} value={evmTx.value} />}
              {evmTx.replacedTxHash && (
                <CCopyableField label={transactionDetails.replacedHash} value={evmTx.replacedTxHash} />
              )}
            </dl>
            {evmInput && <CJsonBlock label={transactionDetails.inputData} data={evmInput} />}
          </CSectionCard>
        )}

        {hasSolanaData && solanaTx && (
          <CSectionCard className={classNames?.executionSection}>
            <CSectionHeading icon={CpuChipIcon} className={classNames?.sectionHeader}>
              {transactionDetails.solanaTitle}
            </CSectionHeading>
            <dl className="novatx:m-0">
              {solanaFee && <CDetailItem label={transactionDetails.fee} value={`${solanaFee} SOL`} />}
              {solanaTx.slot !== undefined && <CDetailItem label={transactionDetails.slot} value={solanaTx.slot} />}
              {solanaTx.recentBlockhash && (
                <CCopyableField label={transactionDetails.recentBlockhash} value={solanaTx.recentBlockhash} />
              )}
            </dl>
            {solanaInstructions && <CJsonBlock label={transactionDetails.instructions} data={solanaInstructions} />}
          </CSectionCard>
        )}

        {hasStarknetData && starknetTx && (
          <CSectionCard className={classNames?.executionSection}>
            <CSectionHeading icon={CpuChipIcon} className={classNames?.sectionHeader}>
              {transactionDetails.starknetTitle}
            </CSectionHeading>
            <dl className="novatx:m-0">
              {starknetTx.contractAddress && (
                <CCopyableField label={transactionDetails.contractAddress} value={starknetTx.contractAddress} />
              )}
              {starknetTx.actualFee && (
                <CDetailItem
                  label={transactionDetails.actualFee}
                  value={`${starknetTx.actualFee.amount} ${starknetTx.actualFee.unit}`}
                />
              )}
            </dl>
          </CSectionCard>
        )}

        {/* ── Context & Payload ── */}
        {hasContext && (
          <CSectionCard className={classNames?.contextSection}>
            <CSectionHeading icon={CommandLineIcon} className={classNames?.sectionHeader}>
              {transactionDetails.contextTitle}
            </CSectionHeading>
            {(titleContext || descriptionContext) && (
              <dl className="novatx:m-0">
                {titleContext && <CDetailItem label={transactionDetails.titleContext} value={titleContext} />}
                {descriptionContext && (
                  <CDetailItem label={transactionDetails.descriptionContext} value={descriptionContext} />
                )}
              </dl>
            )}
            {hasError && <CJsonBlock label={transactionDetails.errorContext} data={tx.error} />}
            {hasPayload && <CJsonBlock label={transactionDetails.fullPayload} data={tx.payload} />}
          </CSectionCard>
        )}
      </div>
    </div>
  );
}
