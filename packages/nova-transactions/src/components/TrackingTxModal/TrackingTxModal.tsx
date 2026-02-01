/**
 * @file This file contains the `TrackingTxModal`, the main UI for displaying the detailed lifecycle of a single transaction.
 */
import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { selectAdapterByKey } from '@tuwaio/orbit-core';
import { InitialTransaction, InitialTransactionParams, Transaction, TransactionStatus } from '@tuwaio/pulsar-core';
import { MotionProps } from 'framer-motion';
import { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';

import { NovaTransactionsProviderProps, useLabels } from '../../providers';
import {
  TxErrorBlock,
  TxErrorBlockClassNames,
  TxErrorBlockProps,
  TxInfoBlock,
  TxInfoBlockCustomization,
  TxInfoBlockProps,
  TxProgressIndicator,
  TxProgressIndicatorProps,
  TxStatusVisual,
  TxStatusVisualClassNames,
  TxStatusVisualProps,
} from '../';
import { StatusAwareText } from '../StatusAwareText';

// --- Prop Types for Customization ---
type CustomHeaderProps = { onClose: () => void; title: ReactNode };
type CustomFooterProps = {
  onClose: () => void;
  onOpenAllTransactions: () => void;
  onRetry?: () => void;
  onSpeedUp?: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
  isFailed?: boolean;
  canReplace?: boolean;
  connectedWalletAddress?: string;
};

export type TrackingTxModalCustomization<T extends Transaction> = {
  modalProps?: Partial<ComponentPropsWithoutRef<typeof DialogContent>>;
  motionProps?: MotionProps;
  /** Custom components to override default elements */
  components?: {
    Header?: ComponentType<CustomHeaderProps>;
    Footer?: ComponentType<CustomFooterProps>;
    StatusVisual?: ComponentType<TxStatusVisualProps>;
    ProgressIndicator?: ComponentType<TxProgressIndicatorProps>;
    InfoBlock?: ComponentType<TxInfoBlockProps<T>>;
    ErrorBlock?: ComponentType<TxErrorBlockProps>;
  };
  /** Granular classNames for all sub-elements */
  classNames?: {
    /** Classes for the outer container */
    container?: string;
    /** Classes for the header section */
    header?: string;
    /** Classes for the header title */
    headerTitle?: string;
    /** Classes for the close button */
    closeButton?: string;
    /** Classes for the main content area */
    main?: string;
    /** Classes for the footer section */
    footer?: string;
    /** Classes for the actions container (left side of footer) */
    footerActions?: string;
    /** Classes for the buttons container (right side of footer) */
    footerButtons?: string;
    /** Classes for the SpeedUp button */
    speedUpButton?: string;
    /** Classes for the Cancel button */
    cancelButton?: string;
    /** Classes for the Retry button */
    retryButton?: string;
    /** Classes for the All Transactions button */
    allTransactionsButton?: string;
    /** Classes for the Close button */
    closeModalButton?: string;
  };
  /** Customization for TxInfoBlock */
  infoBlockCustomization?: TxInfoBlockCustomization<T>;
  /** Customization for TxProgressIndicator */
  progressIndicatorCustomization?: {
    /** Container className */
    className?: string;
    /** Step classNames */
    stepClassNames?: TxProgressIndicatorProps['stepClassNames'];
  };
  /** Customization for TxStatusVisual */
  statusVisualCustomization?: {
    /** Container className */
    className?: string;
    /** Icon classNames with status-specific overrides */
    iconClassNames?: TxStatusVisualClassNames;
  };
  /** Customization for TxErrorBlock */
  errorBlockCustomization?: {
    /** Container className */
    className?: string;
    /** Granular classNames */
    classNames?: TxErrorBlockClassNames;
  };
};

export type TrackingTxModalProps<T extends Transaction> = Pick<
  NovaTransactionsProviderProps<T>,
  'executeTxAction' | 'initialTx' | 'transactionsPool' | 'adapter' | 'connectedWalletAddress'
> & {
  onClose: (txKey?: string) => void;
  onOpenAllTransactions: () => void;
  className?: string;
  customization?: TrackingTxModalCustomization<T>;
};

export function TrackingTxModal<T extends Transaction>({
  adapter,
  onClose,
  onOpenAllTransactions,
  className,
  customization,
  transactionsPool,
  executeTxAction,
  initialTx,
  connectedWalletAddress,
}: TrackingTxModalProps<T>) {
  const activeTx = initialTx?.lastTxKey ? transactionsPool[initialTx.lastTxKey] : undefined;

  const txToDisplay = activeTx ?? initialTx;
  const isOpen = (initialTx?.withTrackedModal && !activeTx) || (activeTx?.isTrackedModalOpen ?? false);

  const txStatus = activeTx?.status;
  const isInitializing = initialTx?.isInitializing ?? false;
  const isPending = activeTx?.pending ?? false;

  const isProcessing = isInitializing || isPending;
  const isSucceed = txStatus === TransactionStatus.Success;
  const isFailed = activeTx?.isError || !!initialTx?.errorMessage;
  const isReplaced = txStatus === TransactionStatus.Replaced;

  const foundAdapter = txToDisplay ? selectAdapterByKey({ adapterKey: txToDisplay.adapter, adapter }) : undefined;

  const canRetry = !!(isFailed && txToDisplay && initialTx?.actionFunction && executeTxAction);
  const canReplace = !!(
    foundAdapter?.speedUpTxAction &&
    foundAdapter?.cancelTxAction &&
    activeTx?.pending &&
    activeTx.tracker === 'ethereum'
  );

  const handleRetry = () => {
    if (!canRetry || !foundAdapter?.retryTxAction) return;

    const retryParams: InitialTransactionParams = {
      adapter: txToDisplay.adapter,
      type: txToDisplay.type,
      desiredChainID: 'desiredChainID' in txToDisplay ? txToDisplay.desiredChainID : txToDisplay.chainId,
      actionFunction: initialTx?.actionFunction,
      title: txToDisplay.title,
      description: txToDisplay.description,
      payload: txToDisplay.payload,
      rpcUrl:
        'rpcUrl' in txToDisplay
          ? txToDisplay?.rpcUrl
          : 'desiredChainID' in txToDisplay
            ? (txToDisplay.desiredChainID as string)
            : (txToDisplay.chainId as string).split(':')[1],
      withTrackedModal: 'withTrackedModal' in txToDisplay ? txToDisplay.withTrackedModal : false,
    };
    foundAdapter.retryTxAction({ tx: retryParams, txKey: activeTx?.txKey ?? '', onClose, executeTxAction });
  };

  const isWithActions = canReplace && activeTx && ['metamask'].includes(activeTx?.connectorType.split(':')[1]);

  const handleCancel = () => {
    if (isWithActions) foundAdapter.cancelTxAction!(activeTx);
  };

  const handleSpeedUp = () => {
    if (isWithActions) foundAdapter.speedUpTxAction!(activeTx);
  };

  const CustomHeader = customization?.components?.Header;
  const CustomFooter = customization?.components?.Footer;
  const CustomStatusVisual = customization?.components?.StatusVisual;
  const CustomProgressIndicator = customization?.components?.ProgressIndicator;
  const CustomInfoBlock = customization?.components?.InfoBlock;
  const CustomErrorBlock = customization?.components?.ErrorBlock;

  if (!txToDisplay) return null;

  const classNames = customization?.classNames;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(activeTx?.txKey)}>
      <DialogContent
        className={cn('novatx:w-full novatx:sm:max-w-md', customization?.modalProps?.className)}
        {...customization?.modalProps}
      >
        <div
          className={cn('novatx:relative novatx:flex novatx:w-full novatx:flex-col', classNames?.container, className)}
        >
          {CustomHeader ? (
            <CustomHeader
              onClose={() => onClose(activeTx?.txKey)}
              title={<DefaultHeaderTitle tx={txToDisplay} className={classNames?.headerTitle} />}
            />
          ) : (
            <DefaultHeader
              onClose={() => onClose(activeTx?.txKey)}
              title={<DefaultHeaderTitle tx={txToDisplay} className={classNames?.headerTitle} />}
              classNames={classNames}
            />
          )}

          <main className={cn('novatx:flex novatx:flex-col novatx:gap-4 novatx:p-4', classNames?.main)}>
            {CustomStatusVisual ? (
              <CustomStatusVisual
                isProcessing={isProcessing}
                isSucceed={isSucceed}
                isFailed={isFailed}
                isReplaced={isReplaced}
              />
            ) : (
              <TxStatusVisual
                isProcessing={isProcessing}
                isSucceed={isSucceed}
                isFailed={isFailed}
                isReplaced={isReplaced}
                className={customization?.statusVisualCustomization?.className}
                iconClassNames={customization?.statusVisualCustomization?.iconClassNames}
              />
            )}
            {CustomProgressIndicator ? (
              <CustomProgressIndicator
                isProcessing={isProcessing}
                isSucceed={isSucceed}
                isFailed={isFailed}
                isReplaced={isReplaced}
              />
            ) : (
              <TxProgressIndicator
                isProcessing={isProcessing}
                isSucceed={isSucceed}
                isFailed={isFailed}
                isReplaced={isReplaced}
                className={customization?.progressIndicatorCustomization?.className}
                stepClassNames={customization?.progressIndicatorCustomization?.stepClassNames}
              />
            )}
            {CustomInfoBlock ? (
              <CustomInfoBlock tx={txToDisplay} adapter={adapter} />
            ) : (
              <TxInfoBlock tx={txToDisplay} adapter={adapter} customization={customization?.infoBlockCustomization} />
            )}
            {CustomErrorBlock ? (
              <CustomErrorBlock error={activeTx?.errorMessage || initialTx?.errorMessage} />
            ) : (
              <TxErrorBlock
                error={activeTx?.errorMessage || initialTx?.errorMessage}
                className={customization?.errorBlockCustomization?.className}
                classNames={customization?.errorBlockCustomization?.classNames}
              />
            )}
          </main>

          {CustomFooter ? (
            <CustomFooter
              onClose={() => onClose(activeTx?.txKey)}
              onOpenAllTransactions={onOpenAllTransactions}
              isProcessing={isProcessing}
              isFailed={isFailed}
              canReplace={canReplace}
              onRetry={canRetry ? handleRetry : undefined}
              onSpeedUp={isWithActions ? handleSpeedUp : undefined}
              onCancel={isWithActions ? handleCancel : undefined}
              connectedWalletAddress={connectedWalletAddress}
            />
          ) : (
            <DefaultFooter
              onClose={() => onClose(activeTx?.txKey)}
              onOpenAllTransactions={onOpenAllTransactions}
              isProcessing={isProcessing}
              isFailed={isFailed}
              canReplace={canReplace}
              onRetry={canRetry ? handleRetry : undefined}
              onSpeedUp={isWithActions ? handleSpeedUp : undefined}
              onCancel={isWithActions ? handleCancel : undefined}
              connectedWalletAddress={connectedWalletAddress}
              classNames={classNames}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type TrackingModalClassNames = TrackingTxModalCustomization<Transaction>['classNames'];

function DefaultHeaderTitle({ tx, className }: { tx: Transaction | InitialTransaction; className?: string }) {
  return (
    <StatusAwareText
      txStatus={'status' in tx ? tx.status : undefined}
      source={tx.title}
      fallback={tx.type}
      variant="title"
      className={cn('novatx:text-lg', className)}
    />
  );
}

const DefaultHeader = ({
  onClose,
  title,
  classNames,
}: CustomHeaderProps & { classNames?: TrackingModalClassNames }) => {
  const { actions } = useLabels();
  return (
    <DialogHeader className={classNames?.header}>
      <DialogTitle className={classNames?.headerTitle}>{title}</DialogTitle>
      <DialogClose asChild>
        <button
          type="button"
          onClick={() => onClose()}
          aria-label={actions.close}
          className={cn(
            'novatx:cursor-pointer novatx:rounded-full novatx:p-1 novatx:text-[var(--tuwa-text-tertiary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]',
            classNames?.closeButton,
          )}
        >
          <CloseIcon />
        </button>
      </DialogClose>
    </DialogHeader>
  );
};

const MainActionButton = ({
  isFailed,
  onRetry,
  isProcessing,
  canReplace,
  connectedWalletAddress,
  onOpenAllTransactions,
  classNames,
}: Pick<
  CustomFooterProps,
  'isFailed' | 'onRetry' | 'isProcessing' | 'canReplace' | 'connectedWalletAddress' | 'onOpenAllTransactions'
> & { classNames?: TrackingModalClassNames }) => {
  const { trackingModal } = useLabels();

  if (isFailed && onRetry) {
    return (
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'novatx:cursor-pointer novatx:rounded-t-[var(--tuwa-rounded-corners)] novatx:sm:rounded-[var(--tuwa-rounded-corners)] novatx:bg-gradient-to-r novatx:from-[var(--tuwa-button-gradient-from)] novatx:to-[var(--tuwa-button-gradient-to)] novatx:px-4 novatx:py-2 novatx:text-sm novatx:font-semibold novatx:text-[var(--tuwa-text-on-accent)] novatx:transition-opacity novatx:hover:from-[var(--tuwa-button-gradient-from-hover)] novatx:hover:to-[var(--tuwa-button-gradient-to-hover)]',
          classNames?.retryButton,
        )}
      >
        {trackingModal.retry}
      </button>
    );
  }
  if (!isProcessing && !canReplace && !!connectedWalletAddress) {
    return (
      <button
        type="button"
        onClick={onOpenAllTransactions}
        className={cn(
          'novatx:cursor-pointer novatx:rounded-[var(--tuwa-rounded-corners)] novatx:bg-[var(--tuwa-bg-muted)] novatx:px-4 novatx:py-2 novatx:text-sm novatx:font-semibold novatx:text-[var(--tuwa-text-primary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-border-primary)]',
          classNames?.allTransactionsButton,
        )}
      >
        {trackingModal.allTransactions}
      </button>
    );
  }
  return null;
};

const DefaultFooter = ({
  onClose,
  onOpenAllTransactions,
  isProcessing,
  onRetry,
  onSpeedUp,
  onCancel,
  canReplace,
  isFailed,
  connectedWalletAddress,
  classNames,
}: CustomFooterProps & { classNames?: TrackingModalClassNames }) => {
  const { trackingModal, actions } = useLabels();

  return (
    <footer
      className={cn(
        'novatx:flex novatx:w-full novatx:items-center novatx:justify-between novatx:border-t novatx:border-[var(--tuwa-border-primary)] novatx:p-4',
        classNames?.footer,
      )}
    >
      <div className={cn('novatx:flex novatx:items-center novatx:gap-4', classNames?.footerActions)}>
        {canReplace && onSpeedUp && onCancel && (
          <>
            <button
              type="button"
              onClick={onSpeedUp}
              className={cn(
                'novatx:cursor-pointer novatx:text-sm novatx:font-medium novatx:text-[var(--tuwa-text-accent)] novatx:transition-opacity novatx:hover:opacity-80',
                classNames?.speedUpButton,
              )}
            >
              {actions.speedUp}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                'novatx:cursor-pointer novatx:text-sm novatx:font-medium novatx:text-[var(--tuwa-text-secondary)] novatx:transition-opacity novatx:hover:opacity-80',
                classNames?.cancelButton,
              )}
            >
              {actions.cancel}
            </button>
          </>
        )}
      </div>
      <div className={cn('novatx:flex novatx:items-center novatx:gap-3', classNames?.footerButtons)}>
        <MainActionButton
          isFailed={isFailed}
          onRetry={onRetry}
          isProcessing={isProcessing}
          canReplace={canReplace}
          connectedWalletAddress={connectedWalletAddress}
          onOpenAllTransactions={onOpenAllTransactions}
          classNames={classNames}
        />
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing && !canReplace}
          className={cn(
            'novatx:cursor-pointer novatx:rounded-[var(--tuwa-rounded-corners)] novatx:bg-[var(--tuwa-bg-muted)] novatx:px-4 novatx:py-2 novatx:text-sm novatx:font-semibold novatx:text-[var(--tuwa-text-primary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-border-primary)] novatx:disabled:cursor-not-allowed novatx:disabled:opacity-50',
            classNames?.closeModalButton,
          )}
        >
          {isProcessing && !canReplace ? trackingModal.processing : trackingModal.close}
        </button>
      </div>
    </footer>
  );
};
