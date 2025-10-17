/**
 * @file This file defines the TypeScript type for the library's internationalization (i18n) labels.
 * It provides a strict structure for all text used in the UI components, ensuring type safety for different languages.
 */

/**
 * Represents the set of labels used for various UI elements and features in a Tuwa-based application.
 * This type defines structured labels for wallet modals, transaction statuses, toast notifications, and more.
 */
export type NovaTransactionsLabels = {
  /** Labels for the main wallet information modal. */
  transactionsModal: {
    history: {
      /** The title for the transaction history section. */
      title: string;
      /** The title displayed when the user needs to connect a wallet to see history. */
      connectWalletTitle: string;
      /** The message displayed when the user needs to connect a wallet. */
      connectWalletMessage: string;
      /** The title displayed when the connected wallet has no transaction history. */
      noTransactionsTitle: string;
      /** The message displayed when there are no transactions to show. */
      noTransactionsMessage: string;
    };
  };
  /** Labels related to toast notifications. */
  toast: {
    /** Text for the button/link within a toast to open the wallet modal. */
    openTransactionsInfo: string;
  };
  /** Standard labels for transaction statuses. */
  statuses: {
    /** Text for a pending transaction. */
    pending: string;
    /** Text for a successful transaction. */
    success: string;
    /** Text for a failed transaction. */
    failed: string;
    /** Text for a reverted transaction. */
    reverted: string;
    /** Text for a replaced transaction (e.g., sped up). */
    replaced: string;
    /** Text for an unknown or indeterminate status. */
    unknown: string;
    /** Text for a confirmation count label, e.g., "1 confirmation" or "10 confirmations" */
    confirmationsLabel: string;
  };
  /** Labels for different types of transaction hashes/keys. */
  hashLabels: {
    /** Label for a Gelato Task ID. */
    gelato: string;
    /** Label for a Safe Transaction Hash. */
    safe: string;
    /** Label for the original transaction hash (before replacement). */
    original: string;
    /** Label for the new transaction hash that replaced the original. */
    replaced: string;
    /** Default label for a standard transaction hash. */
    default: string;
    /** Special label for the most recent blockhash. This is used for the "Recent Blockhash" field in the transaction details modal. */
    recentBlockhash: string;
    /** Special label for the Solana signature. This is used for the "Signature" field in the transaction details modal. */
    solana: string;
  };
  /** Labels for the transaction information block. */
  txInfo: {
    /** Label indicating when the transaction was started. */
    started: string;
    /** Label for the network name. */
    network: string;
    /** Slot number for the transaction. This is used for the "Slot" field in the transaction details modal. */
    slot: string;
  };
  /** Labels for the transaction error block. */
  txError: {
    /** The title for the error details section. */
    title: string;
    /** Confirmation text shown after copying an error message. */
    copied: string;
  };
  /** Labels for the detailed transaction tracking modal. */
  trackingModal: {
    /** The main title of the tracking modal. */
    title: string;
    /** Text indicating that the transaction is being processed. */
    processing: string;
    /** Label for the close button. */
    close: string;
    /** Label for the button to open the main wallet info modal. */
    allTransactions: string;
    /** Label for a button to retry a transaction. */
    retry: string;
    /** Labels for the step-by-step progress indicator. */
    progressIndicator: {
      /** Label for the "transaction created" step. */
      created: string;
      /** Label for the "processing" step. */
      processing: string;
      /** Label for the "succeed" or final step. */
      succeed: string;
    };
  };
  /** Labels for the main transaction action button. */
  trackedTxButton: {
    /** Text shown on the button while the transaction is initializing. */
    loading: string;
    /** Text shown on the button after the transaction succeeds. */
    succeed: string;
    /** Text shown on the button if the transaction fails to initialize. */
    failed: string;
    /** Text shown on the button if the transaction replaced to initialize. */
    replaced: string;
  };
  /** Labels for common action buttons/links. */
  actions: {
    /** Text for a "Copy" action (e.g., copy address or hash). */
    copy: string;
    /** Text for a link to view the transaction on a block explorer. */
    viewOnExplorer: string;
    /** Text for a generic "Close" action. */
    close: string;
    /** Text for a generic "Cancel" action. */
    cancel: string;
    /** Text for a generic "Speed up" action. */
    speedUp: string;
  };
};
