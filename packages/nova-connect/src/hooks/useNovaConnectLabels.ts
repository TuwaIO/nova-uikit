import { createContext, useContext } from 'react';

import { defaultLabels, NovaConnectLabels } from '../i18n';

/**
 * React context of the Nova Connect labels. Its default value is the English `defaultLabels`, so components work
 * without a labels provider. `NovaConnectProvider` provides the merged labels.
 */
export const NovaConnectLabelsContext = createContext<NovaConnectLabels>(defaultLabels);

/**
 * Returns the Nova Connect labels: the ones of the nearest labels provider (`NovaConnectProvider` provides the
 * `labels` prop merged into the defaults), or the English defaults.
 *
 * @returns All labels.
 *
 * @example
 * ```tsx
 * import { useNovaConnectLabels } from '@tuwaio/nova-connect/hooks';
 *
 * export function Title() {
 *   const labels = useNovaConnectLabels();
 *
 *   return <h2>{labels.connectWallet}</h2>;
 * }
 * ```
 */
export const useNovaConnectLabels = (): NovaConnectLabels => {
  return useContext(NovaConnectLabelsContext);
};

/**
 * Returns one label.
 *
 * @param key - The label key.
 * @returns The label text.
 *
 * @example
 * ```tsx
 * import { useNovaConnectLabel } from '@tuwaio/nova-connect/hooks';
 *
 * export function ConnectText() {
 *   return <span>{useNovaConnectLabel('connectWallet')}</span>;
 * }
 * ```
 */
export const useNovaConnectLabel = <K extends keyof NovaConnectLabels>(key: K): NovaConnectLabels[K] => {
  const labels = useNovaConnectLabels();
  return labels[key];
};

/**
 * Returns the given labels. It reads all labels, so it re-renders like {@link useNovaConnectLabels}.
 *
 * @param keys - The label keys.
 * @returns An object with the requested labels.
 *
 * @example
 * ```tsx
 * import { useNovaConnectLabelsSubset } from '@tuwaio/nova-connect/hooks';
 *
 * export function Actions() {
 *   const { connect, disconnect } = useNovaConnectLabelsSubset(['connect', 'disconnect']);
 *
 *   return (
 *     <p>
 *       {connect} / {disconnect}
 *     </p>
 *   );
 * }
 * ```
 */
export const useNovaConnectLabelsSubset = <K extends keyof NovaConnectLabels>(
  keys: K[],
): Pick<NovaConnectLabels, K> => {
  const allLabels = useNovaConnectLabels();

  const subset = {} as Pick<NovaConnectLabels, K>;
  for (const key of keys) {
    subset[key] = allLabels[key];
  }

  return subset;
};

/**
 * Checks whether a label is set and not blank.
 *
 * @param labels - The labels.
 * @param key - The label key.
 * @returns `true` when the trimmed label is not empty.
 */
export const hasLabel = (labels: NovaConnectLabels, key: keyof NovaConnectLabels): boolean => {
  return Boolean(labels[key]?.trim());
};

/**
 * Label keys by category, used by {@link useLabelsByCategory}.
 */
export type LabelCategory = {
  /** Action texts such as `connectWallet` and `disconnect` */
  actions: Extract<
    keyof NovaConnectLabels,
    'connectWallet' | 'disconnect' | 'connecting' | 'connected' | 'tryAgain' | 'back' | 'connect'
  >;
  /** State texts such as `success` and `loading` */
  states: Extract<keyof NovaConnectLabels, 'success' | 'error' | 'replaced' | 'loading'>;
  /** ARIA labels such as `closeModal` */
  accessibility: Extract<
    keyof NovaConnectLabels,
    'chainSelector' | 'closeModal' | 'selectChain' | 'walletControls' | 'openWalletModal'
  >;
  /** Transaction status texts */
  transactions: Extract<
    keyof NovaConnectLabels,
    'transactionLoading' | 'transactionSuccess' | 'transactionError' | 'transactionReplaced' | 'recent'
  >;
};

/**
 * Returns the labels of a category of {@link LabelCategory}.
 *
 * @param category - The category.
 * @returns An object with the labels of the category.
 *
 * @example
 * ```tsx
 * import { useLabelsByCategory } from '@tuwaio/nova-connect/hooks';
 *
 * export function StateText() {
 *   const { loading } = useLabelsByCategory('states');
 *
 *   return <span>{loading}</span>;
 * }
 * ```
 */
export const useLabelsByCategory = <T extends keyof LabelCategory>(
  category: T,
): Pick<NovaConnectLabels, LabelCategory[T]> => {
  const allLabels = useNovaConnectLabels();

  const categoryKeys: Record<keyof LabelCategory, (keyof NovaConnectLabels)[]> = {
    actions: ['connectWallet', 'disconnect', 'connecting', 'connected', 'tryAgain', 'back', 'connect'],
    states: ['success', 'error', 'replaced', 'loading'],
    accessibility: ['chainSelector', 'closeModal', 'selectChain', 'walletControls', 'openWalletModal'],
    transactions: ['transactionLoading', 'transactionSuccess', 'transactionError', 'transactionReplaced', 'recent'],
  };

  const keys = categoryKeys[category] as LabelCategory[T][];
  const categoryLabels = {} as Pick<NovaConnectLabels, LabelCategory[T]>;

  for (const key of keys) {
    // eslint-disable-next-line
    (categoryLabels as any)[key] = allLabels[key as keyof NovaConnectLabels];
  }

  return categoryLabels;
};

/**
 * Checks whether an object is the `defaultLabels` object itself (a copy with the same texts returns `false`).
 *
 * @param labels - The labels.
 * @returns `true` for the `defaultLabels` object.
 */
export const isDefaultLabels = (labels: NovaConnectLabels): boolean => {
  return labels === defaultLabels;
};

/**
 * Returns a label, or a fallback when it is blank: the `fallback` argument, the English default, then the key.
 *
 * @param labels - The labels.
 * @param key - The label key.
 * @param fallback - Text used when the label is blank.
 * @returns The text.
 *
 * @example
 * ```ts
 * import { defaultLabels } from '@tuwaio/nova-connect/i18n';
 * import { getLabelWithFallback } from '@tuwaio/nova-connect/hooks';
 *
 * getLabelWithFallback({ ...defaultLabels, connectWallet: '' }, 'connectWallet', 'Connect'); // 'Connect'
 * ```
 */
export const getLabelWithFallback = (
  labels: NovaConnectLabels,
  key: keyof NovaConnectLabels,
  fallback?: string,
): string => {
  const value = labels[key];
  if (value && value.trim()) {
    return value;
  }
  return fallback || defaultLabels[key] || key.toString();
};

/**
 * Returns the given labels of a labels object (usable outside React components).
 *
 * @param labels - The labels.
 * @param keys - The label keys.
 * @returns An object with the requested labels.
 *
 * @example
 * ```ts
 * import { defaultLabels } from '@tuwaio/nova-connect/i18n';
 * import { createLabelsSubset } from '@tuwaio/nova-connect/hooks';
 *
 * const actionLabels = createLabelsSubset(defaultLabels, ['connect', 'disconnect', 'tryAgain']);
 * ```
 */
export const createLabelsSubset = <K extends keyof NovaConnectLabels>(
  labels: NovaConnectLabels,
  keys: K[],
): Pick<NovaConnectLabels, K> => {
  const subset = {} as Pick<NovaConnectLabels, K>;
  for (const key of keys) {
    subset[key] = labels[key];
  }
  return subset;
};
