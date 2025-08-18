/**
 * @file This file contains the default English labels for all UI components.
 * It serves as the default language pack for the library.
 */

import { TuwaLabels } from './types';

/**
 * An object containing the default English text for all labels used in the UI.
 * This object implements the `TuwaLabels` type and can be used as a template
 * for creating other language translations.
 */
export const defaultLabels: TuwaLabels = {
  walletModal: {
    title: 'Wallet & Transactions',
    header: {
      notConnected: 'Wallet not connected',
      avatarAlt: 'Avatar for',
    },
    history: {
      title: 'Transactions History',
      connectWalletTitle: 'Connect Wallet',
      connectWalletMessage: 'Please connect your wallet to see your past activity.',
      noTransactionsTitle: 'No Transactions Yet',
      noTransactionsMessage: 'Once you interact with the app, your transaction history will appear here.',
    },
  },
  toast: {
    openWalletInfo: 'Open wallet info',
  },
  statuses: {
    pending: 'Pending',
    success: 'Success',
    failed: 'Failed',
    reverted: 'Reverted',
    replaced: 'Replaced',
    unknown: 'Unknown',
  },
  hashLabels: {
    gelato: 'Gelato Task ID',
    safe: 'Safe Tx Hash',
    original: 'Original Tx Hash',
    replaced: 'Replaced Tx Hash',
    default: 'Tx Hash',
  },
  txInfo: {
    started: 'Started',
    network: 'Network',
  },
  txError: {
    title: 'Error',
    copied: 'Copied!',
  },
  trackingModal: {
    title: 'Transaction Overview',
    processing: 'Processing...',
    close: 'Close',
    walletInfo: 'Wallet Info',
    retry: 'Retry',
    progressIndicator: {
      created: 'Created',
      processing: 'Processing',
      succeed: 'Succeed',
    },
  },
  trackedTxButton: {
    loading: 'Processing...',
    succeed: 'Success',
    failed: 'Failed',
    replaced: 'Replaced',
  },
  actions: {
    copy: 'Copy address',
    viewOnExplorer: 'View on explorer',
    close: 'Close',
    cancel: 'Cancel',
    speedUp: 'Speed up',
  },
};
