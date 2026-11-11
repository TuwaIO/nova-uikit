/**
 * @file This file contains the `TransactionDetails` component, which displays a universal,
 * highly-detailed view of a transaction including metadata and execution data.
 */

import {
  CloseIcon,
  cn,
  CopyIcon,
  DrawnCheck,
  DrawnCross,
  ExternalLinkIcon,
  getChainName,
  MorphIcon,
  MorphText,
  NetworkIcon,
  NovaSetIcon,
  QuasarLoader,
  StatusEdge,
  StatusTone,
  useCopyToClipboard,
} from '@tuwaio/nova-core';
import { formatBaseUnits, OrbitAdapter, selectAdapterByKey, setChainId, shortAddress } from '@tuwaio/orbit-core';
import {
  EvmTransaction,
  SolanaTransaction,
  StarknetTransaction,
  Transaction,
  TransactionTracker,
} from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { ComponentType, ReactNode, useEffect, useMemo, useState } from 'react';

import { useNovaTransactionsError } from '../providers/NovaTransactionsErrorContext';
import { useLabels } from '../providers/NovaTransactionsLabelsProvider';
import type { NovaTransactionsProviderProps } from '../providers/NovaTransactionsProvider';
import {
  canReplaceTx,
  canSpeedUpTx,
  explorerUrlOfHash,
  explorerUrlOfReplaced,
  runReplacement,
  stopTrackingDueIn,
} from '../utils/replacement';
import { statusText } from '../utils/statusText';
import { hasConfirmations, progressOf, statusLabelOf, toneOf, walletPartOf } from '../utils/txStatus';
import { headerCloseButtonClassName, HeaderContent, headerTitleClassName } from './HeaderContent';

/** The icons of the sections and rows, from the icon set of `NovaIconsProvider` (the pixel ones by default). */
const SectionIcons = {
  CheckCircleIcon: ({ className }: { className?: string }) => (
    <NovaSetIcon outline="CheckCircleIcon" className={className} />
  ),
  ClockIcon: ({ className }: { className?: string }) => <NovaSetIcon outline="ClockIcon" className={className} />,
  CommandLineIcon: ({ className }: { className?: string }) => (
    <NovaSetIcon outline="CommandLineIcon" className={className} />
  ),
  CpuChipIcon: ({ className }: { className?: string }) => <NovaSetIcon outline="CpuChipIcon" className={className} />,
  DocumentTextIcon: ({ className }: { className?: string }) => (
    <NovaSetIcon outline="DocumentTextIcon" className={className} />
  ),
};

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
   * Icon component (an icon of the Nova icon set by default), rendered with a `className`. The default row does not show it; it is
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
  /** Icon component of the section (an icon of the Nova icon set by default), rendered with a `className`. */
  icon?: ComponentType<{ className?: string }>;
};

// --- Default Sub-components ---

const SectionCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section
    className={cn(
      'novatx:flex novatx:min-w-0 novatx:flex-col novatx:gap-1.5 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:p-4 novatx:sm:p-5',
      className,
    )}
  >
    {children}
  </section>
);

const SectionHeading = ({ children, className, icon: Icon }: SectionHeadingProps) => (
  <div className="novatx:mb-1 novatx:flex novatx:min-w-0 novatx:items-center novatx:gap-3.5">
    {Icon && (
      <span className="novatx:flex novatx:h-10 novatx:w-10 novatx:shrink-0 novatx:items-center novatx:justify-center novatx:rounded-[var(--tuwa-rounded-full)] novatx:bg-[var(--tuwa-text-accent)]/10 novatx:text-[var(--tuwa-text-accent)]">
        <Icon className="novatx:h-5 novatx:w-5" />
      </span>
    )}
    <h4
      className={cn(
        'novatx:m-0 novatx:min-w-0 novatx:truncate novatx:font-mono novatx:text-[11px] novatx:font-bold novatx:uppercase novatx:tracking-[0.12em] novatx:text-[var(--tuwa-text-secondary)]',
        className,
      )}
    >
      {children}
    </h4>
  </div>
);

const rowClassName =
  'novatx:flex novatx:min-w-0 novatx:items-baseline novatx:justify-between novatx:gap-4 novatx:border-b novatx:border-[var(--tuwa-border-primary)] novatx:py-2.5 novatx:text-[13px] novatx:last:border-b-0';
const rowLabelClassName =
  'novatx:shrink-0 novatx:font-mono novatx:text-[11px] novatx:font-bold novatx:uppercase novatx:tracking-[0.12em] novatx:text-[var(--tuwa-text-secondary)]';
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
          ? 'novatx:border-[#2b2c30] novatx:text-[#9d9c9a] novatx:hover:text-[#f2f1ee]'
          : 'novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:text-[var(--tuwa-text-secondary)] novatx:hover:text-[var(--tuwa-text-accent)]',
        className,
      )}
      title={isCopied ? txError.copied : actions.copy}
      aria-label={isCopied ? txError.copied : actions.copy}
    >
      <CopyIcon copied={isCopied} className="novatx:h-3.5 novatx:w-3.5" />
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
          {shortAddress(value, 8, 8)}
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
        'novatx:mt-2 novatx:overflow-hidden novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[#2b2c30] novatx:bg-[#0b0b0e]',
        className,
      )}
    >
      <div
        className={cn(
          'novatx:flex novatx:items-center novatx:justify-between novatx:gap-2 novatx:border-b novatx:border-[#2b2c30] novatx:py-1 novatx:pr-1.5 novatx:pl-4',
          classNames?.header,
        )}
      >
        <span
          className={cn(
            'novatx:font-mono novatx:text-[11px] novatx:font-bold novatx:uppercase novatx:tracking-[0.12em] novatx:text-[#9d9c9a]',
            classNames?.label,
          )}
        >
          {label}
        </span>
        <CopyButton value={jsonStr} dark className={classNames?.copyButton} />
      </div>
      <div
        className={cn(
          'NovaCustomScroll novatx:relative novatx:max-h-[300px] novatx:overflow-auto',
          classNames?.container,
        )}
      >
        <pre
          className={cn(
            'novatx:m-0 novatx:px-5 novatx:py-4 novatx:font-mono novatx:text-[13px] novatx:leading-relaxed novatx:whitespace-pre-wrap novatx:text-[#e9e8e4] novatx:[overflow-wrap:anywhere]',
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
  // The info colors: the secondary text on the muted background reads at 4.4:1 only
  muted: 'novatx:border-[var(--tuwa-info-icon)]/25 novatx:bg-[var(--tuwa-info-bg)] novatx:text-[var(--tuwa-info-text)]',
};

const Badge = ({
  tone,
  icon,
  children,
  title,
  className,
}: {
  tone: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  title?: string;
  className?: string;
}) => (
  <span
    title={title}
    className={cn(
      'novatx:inline-flex novatx:items-center novatx:gap-1.5 novatx:whitespace-nowrap novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:px-1.5 novatx:py-0.5 novatx:font-mono novatx:text-[10px] novatx:font-bold novatx:uppercase novatx:tracking-[0.12em]',
      BADGE_TONES[tone],
      className,
    )}
  >
    {icon}
    {children}
  </span>
);

const BADGE_TONE_OF_STATUS: Record<StatusTone, BadgeTone> = {
  pending: 'pending',
  warning: 'pending',
  success: 'success',
  error: 'error',
  neutral: 'info',
};

/** The mark of a status: the wait in the pending color, and a result that draws itself. */
const StatusMark = ({ tone }: { tone: StatusTone }) => (
  <MorphIcon iconKey={tone} animateFirst>
    {tone === 'pending' ? (
      <QuasarLoader size={14} accent="var(--tuwa-pending-icon)" />
    ) : tone === 'success' ? (
      <DrawnCheck className="novatx:h-3.5 novatx:w-3.5" />
    ) : tone === 'neutral' ? (
      <NovaSetIcon outline="ArrowPathIcon" className="novatx:h-3.5 novatx:w-3.5" aria-hidden="true" />
    ) : (
      <DrawnCross className="novatx:h-3.5 novatx:w-3.5" />
    )}
  </MorphIcon>
);

/** A hash in a row, shortened and linked to the explorer when there is a link. Without one the hash is still shown. */
const LinkedHash = ({ hash, href }: { hash: string; href?: string }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      data-nova-external-link=""
      rel="noopener noreferrer"
      title={hash}
      className="novatx:truncate novatx:font-mono novatx:text-[13px] novatx:text-[var(--tuwa-text-accent)] novatx:no-underline novatx:hover:underline"
    >
      {shortAddress(hash, 8, 8)}
    </a>
  ) : (
    <span
      title={hash}
      className="novatx:truncate novatx:font-mono novatx:text-[13px] novatx:text-[var(--tuwa-text-primary)]"
    >
      {shortAddress(hash, 8, 8)}
    </span>
  );

const actionButtonClassName =
  'novatx:inline-flex novatx:h-9 novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:gap-2 novatx:whitespace-nowrap novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-strong)] novatx:bg-transparent novatx:px-4 novatx:font-mono novatx:text-xs novatx:font-bold novatx:uppercase novatx:tracking-[0.12em] novatx:text-[var(--tuwa-text-primary)] novatx:no-underline novatx:transition-colors novatx:hover:bg-[var(--tuwa-standart-button-hover)]';

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
    /** The block that offers to stop tracking a transaction that may never end. */
    stopTrackingContainer?: string;
    /** The text of that block. */
    stopTrackingHint?: string;
    /** The button of that block. */
    stopTrackingButton?: string;
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
  /**
   * The connected wallet: speed-up and cancel are offered only to the account that sent the transaction, as from another one
   * the same transfer would go out a second time.
   */
  connectedWalletAddress?: string;
  /**
   * Stops tracking this transaction and removes it from the pool. With it, a transaction pending for over 10 minutes offers
   * to do so: a dropped transaction stays pending until its nonce is spent, which can be never.
   *
   * @param txKey - The key of the transaction.
   */
  onStopTracking?: (txKey: string) => void;
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
 * - the strip of the status color along the top of the body, with a running glint while pending;
 * - a status row with the status, the type and whether the transaction is saved on the server of the Pulsar store
 *   (`syncStatus`); on the right, the explorer link of the adapter's `getExplorerTxUrl`, or, for a pending,
 *   unconfirmed `ethereum`-tracker transaction sent with MetaMask by `connectedWalletAddress`, once the tracker has read
 *   its nonce and fees, whose adapter has `speedUpTxAction` and `cancelTxAction`, the speed-up and cancel buttons (the rule
 *   of {@link TrackingTxModal}); with `onStopTracking`, the offer to stop tracking a transaction pending for over 10 minutes;
 * - Metadata: the hash (linked to the explorer), network, sender, recipient, adapter, submission and finish times,
 *   tracker, connector, confirmations, the transaction key when it differs from the hash (Safe, ERC-4337);
 * - Context & Payload: the title and description of the current status, the error and the payload;
 * - the execution data of the chain (EVM: nonce, fees in gwei, value in wei, the hash that replaced it, the hash it
 *   replaced, input data; Solana: fee in
 *   SOL, slot, recent blockhash, instructions; Starknet: contract address, actual fee).
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
  connectedWalletAddress,
  onStopTracking,
  adapter,
  className,
  customization,
}: TransactionDetailsProps<T>) {
  const { transactionDetails, statuses, actions } = useLabels();
  const { showPreSubmitErrorToast } = useNovaTransactionsError();

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
  // The link of the hash shown here. The adapter's own link of a replaced record goes to the replacing hash.
  const explorerUrl = explorerUrlOfHash(foundAdapter, tx, hash);
  // Only what can really be replaced: from another account the same transfer would be sent a second time
  const canReplace = canReplaceTx(tx, foundAdapter, connectedWalletAddress);
  const reportRefusal = (error: unknown) => showPreSubmitErrorToast(error, { title: actions.replacementFailed });
  const chainId = setChainId(tx.chainId);
  const tone = toneOf(tx);

  // The clock is read into state, so the offer comes up by itself when it is due while this screen stays open
  const [nowSeconds, setNowSeconds] = useState(() => Date.now() / 1000);
  const offersStopTracking = !!onStopTracking && tx.pending;
  const stopTrackingDue = stopTrackingDueIn(tx, nowSeconds);
  const canStopTracking = offersStopTracking && stopTrackingDue <= 0;
  useEffect(() => {
    if (!offersStopTracking || !(stopTrackingDue > 0)) return;
    const timer = setTimeout(() => setNowSeconds(Date.now() / 1000), stopTrackingDue * 1000);
    return () => clearTimeout(timer);
  }, [offersStopTracking, stopTrackingDue]);

  const syncBadge =
    tx.syncStatus === 'pending-sync' ? (
      <Badge
        tone="pending"
        icon={
          <NovaSetIcon
            outline="CloudArrowUpIcon"
            className="novatx:h-3.5 novatx:w-3.5 novatx:animate-pulse novatx:motion-reduce:animate-none"
            aria-hidden="true"
          />
        }
        title={transactionDetails.syncStatus.pendingTooltip}
      >
        {transactionDetails.syncStatus.pending}
      </Badge>
    ) : tx.syncStatus === 'synced' ? (
      <Badge
        tone="muted"
        icon={<NovaSetIcon outline="CloudIcon" className="novatx:h-3.5 novatx:w-3.5" aria-hidden="true" />}
        title={transactionDetails.syncStatus.syncedTooltip}
      >
        {transactionDetails.syncStatus.synced}
      </Badge>
    ) : null;

  const showConfirmations = hasConfirmations(tx.confirmations);
  const showTxKey = tx.txKey !== hash;

  // Execution data of the chain
  const evmFees = evmTx && {
    maxFee: formatBaseUnits(evmTx.maxFeePerGas, 9),
    maxPriorityFee: formatBaseUnits(evmTx.maxPriorityFeePerGas, 9),
  };
  const evmInput = evmTx?.input && evmTx.input !== '0x' ? evmTx.input : undefined;
  const hasEvmData = !!(
    evmTx &&
    (evmTx.nonce !== undefined ||
      evmFees?.maxFee ||
      evmFees?.maxPriorityFee ||
      evmTx.value !== undefined ||
      evmTx.replacedTxHash ||
      evmTx.replaces ||
      evmInput)
  );
  const solanaFee = solanaTx ? formatBaseUnits(solanaTx.fee, 9) : undefined;
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
            'tuwa-scanlines novatx:sticky novatx:top-0 novatx:z-10 novatx:flex novatx:items-center novatx:gap-3 novatx:border-b novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:px-4 novatx:py-3.5 novatx:sm:px-5 novatx:sm:py-4',
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
          'tuwa-scanlines novatx:relative novatx:flex novatx:min-w-0 novatx:flex-col novatx:gap-4 novatx:bg-[var(--tuwa-bg-secondary)] novatx:p-4 novatx:sm:p-5',
          classNames?.body,
        )}
      >
        <StatusEdge tone={tone} progress={progressOf(tx)} />

        {canStopTracking && (
          <div
            className={cn(
              'novatx:relative novatx:flex novatx:flex-col novatx:gap-2 novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:p-3',
              classNames?.stopTrackingContainer,
            )}
          >
            <p
              className={cn(
                'novatx:m-0 novatx:text-xs novatx:text-[var(--tuwa-text-secondary)]',
                classNames?.stopTrackingHint,
              )}
            >
              {transactionDetails.stopTrackingHint}
            </p>
            <button
              type="button"
              onClick={() => onStopTracking(tx.txKey)}
              className={cn(
                'novatx:cursor-pointer novatx:self-start novatx:text-xs novatx:font-mono novatx:font-bold novatx:uppercase novatx:tracking-[0.12em] novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80',
                classNames?.stopTrackingButton,
              )}
            >
              {actions.stopTracking}
            </button>
          </div>
        )}

        {/* ── Status row ── */}
        <div
          className={cn(
            'novatx:relative novatx:flex novatx:flex-wrap novatx:items-center novatx:justify-between novatx:gap-3',
            classNames?.coreInfoCard,
          )}
        >
          <div className="novatx:flex novatx:min-w-0 novatx:flex-wrap novatx:items-center novatx:gap-2">
            <Badge
              tone={BADGE_TONE_OF_STATUS[tone]}
              icon={<StatusMark tone={tone} />}
              className={classNames?.statusIconContainer}
            >
              <MorphText>{statusLabelOf(tx, statuses)}</MorphText>
            </Badge>
            <code className="novatx:font-mono novatx:text-xs novatx:text-[var(--tuwa-text-secondary)] novatx:[overflow-wrap:anywhere]">
              {tx.type}
            </code>
            {syncBadge}
          </div>
          {canReplace ? (
            <div className="novatx:flex novatx:flex-wrap novatx:gap-2">
              {canSpeedUpTx(tx) && (
                <button
                  type="button"
                  onClick={() => void runReplacement(foundAdapter!.speedUpTxAction!, tx, reportRefusal)}
                  className={cn(actionButtonClassName, classNames?.actionButton)}
                >
                  <NovaSetIcon outline="BoltIcon" className="novatx:h-4 novatx:w-4" aria-hidden="true" />
                  {actions.speedUp}
                </button>
              )}
              <button
                type="button"
                onClick={() => void runReplacement(foundAdapter!.cancelTxAction!, tx, reportRefusal)}
                className={cn(actionButtonClassName, classNames?.actionButton)}
              >
                <NovaSetIcon outline="XCircleIcon" className="novatx:h-4 novatx:w-4" aria-hidden="true" />
                {actions.cancel}
              </button>
            </div>
          ) : (
            explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                data-nova-external-link=""
                rel="noopener noreferrer"
                className={cn(actionButtonClassName, classNames?.actionButton)}
              >
                <ExternalLinkIcon className="novatx:h-4 novatx:w-4" />
                {actions.viewOnExplorer}
              </a>
            )
          )}
        </div>

        {/* ── Metadata ── */}
        <CSectionCard className={classNames?.metadataSection}>
          <CSectionHeading icon={SectionIcons.DocumentTextIcon} className={classNames?.sectionHeader}>
            {transactionDetails.metadata}
          </CSectionHeading>
          <dl className="novatx:m-0">
            {hash ? (
              <CCopyableField label={transactionDetails.hash} value={hash}>
                <LinkedHash hash={hash} href={explorerUrl} />
              </CCopyableField>
            ) : (
              <CDetailItem label={transactionDetails.hash} value="—" />
            )}
            <CMetadataRow icon={SectionIcons.CpuChipIcon} label={transactionDetails.network}>
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
                  <span className="novatx:shrink-0 novatx:text-[var(--tuwa-text-secondary)]">· {tx.chainId}</span>
                )}
              </span>
            </CMetadataRow>
            <CCopyableField label={transactionDetails.from} value={tx.from} />
            {evmTx?.to ? (
              <CCopyableField label={transactionDetails.to} value={evmTx.to} />
            ) : (
              <CDetailItem label={transactionDetails.to} value="—" />
            )}
            <CMetadataRow icon={SectionIcons.CpuChipIcon} label={transactionDetails.adapter}>
              {tx.adapter}
            </CMetadataRow>
            <CMetadataRow icon={SectionIcons.ClockIcon} label={transactionDetails.submittedAt}>
              {formatTime(tx.localTimestamp)}
            </CMetadataRow>
            {tx.finishedTimestamp && (
              <CMetadataRow icon={SectionIcons.CheckCircleIcon} label={transactionDetails.finishedAt}>
                {formatTime(tx.finishedTimestamp)}
              </CMetadataRow>
            )}
            <CMetadataRow icon={SectionIcons.CpuChipIcon} label={transactionDetails.tracker}>
              {tx.tracker}
            </CMetadataRow>
            <CMetadataRow icon={SectionIcons.CpuChipIcon} label={transactionDetails.connector}>
              <span className="novatx:capitalize">{walletPartOf(tx.connectorType)}</span>
            </CMetadataRow>
            {showConfirmations && (
              <CMetadataRow icon={SectionIcons.CheckCircleIcon} label={transactionDetails.confirmations}>
                {`${tx.confirmations}${tx.requiredConfirmations ? ` / ${tx.requiredConfirmations}` : ''}`}
              </CMetadataRow>
            )}
            {showTxKey && <CCopyableField label={transactionDetails.txKey} value={tx.txKey} />}
          </dl>
        </CSectionCard>

        {/* ── Context & Payload ── */}
        {hasContext && (
          <CSectionCard className={classNames?.contextSection}>
            <CSectionHeading icon={SectionIcons.CommandLineIcon} className={classNames?.sectionHeader}>
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
        {/* ── Execution data of the chain ── */}
        {hasEvmData && evmTx && (
          <CSectionCard className={classNames?.executionSection}>
            <CSectionHeading icon={SectionIcons.CpuChipIcon} className={classNames?.sectionHeader}>
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
                <CCopyableField label={transactionDetails.replacedHash} value={evmTx.replacedTxHash}>
                  <LinkedHash
                    hash={evmTx.replacedTxHash}
                    href={explorerUrlOfHash(foundAdapter, tx, evmTx.replacedTxHash)}
                  />
                </CCopyableField>
              )}
              {evmTx.replaces && (
                <CCopyableField label={transactionDetails.replaces} value={evmTx.replaces}>
                  <LinkedHash hash={evmTx.replaces} href={explorerUrlOfReplaced(foundAdapter, tx, evmTx.replaces)} />
                </CCopyableField>
              )}
            </dl>
            {evmInput && <CJsonBlock label={transactionDetails.inputData} data={evmInput} />}
          </CSectionCard>
        )}

        {hasSolanaData && solanaTx && (
          <CSectionCard className={classNames?.executionSection}>
            <CSectionHeading icon={SectionIcons.CpuChipIcon} className={classNames?.sectionHeader}>
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
            <CSectionHeading icon={SectionIcons.CpuChipIcon} className={classNames?.sectionHeader}>
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
      </div>
    </div>
  );
}
