/**
 * @file This file sets up the React Context for providing i18n labels throughout the UI components.
 * It allows for deep customization of all text displayed by the library.
 */

import { globalSingleton } from '@tuwaio/orbit-core';
import { createContext, ReactNode, useContext, useEffect, useSyncExternalStore } from 'react';

import { defaultLabels } from '../i18n/en';
import { NovaTransactionsLabels } from '../i18n/types';

/**
 * React Context for storing and providing the UI labels, for what renders inside a provider.
 */
const LabelsContext = createContext<NovaTransactionsLabels | null>(null);

// What the mounted `NovaTransactionsProvider` was given. It has no children: the wallet window of Nova Connect and other
// parts of this package render outside it and got English. On `globalThis`, as a bundler can load this package twice
const hostedLabels = globalSingleton<{ labels: NovaTransactionsLabels | null; listeners: Set<() => void> }>(
  'tuwaio.nova-transactions.labels',
  () => ({ labels: null, listeners: new Set() }),
);

const subscribeToHostedLabels = (listener: () => void) => {
  hostedLabels.listeners.add(listener);
  return () => {
    hostedLabels.listeners.delete(listener);
  };
};
const readHostedLabels = () => hostedLabels.labels;
const noHostedLabels = () => null;

const setHostedLabels = (labels: NovaTransactionsLabels | null) => {
  hostedLabels.labels = labels;
  hostedLabels.listeners.forEach((listener) => listener());
};

/**
 * Offers the labels of `NovaTransactionsProvider` to the parts of this package that render outside it, until it unmounts.
 *
 * Side effect: keeps them on `globalThis` (`Symbol.for('tuwaio.nova-transactions.labels')`) while mounted.
 *
 * @param labels - The merged labels of the provider.
 * @internal
 */
export const useOfferLabels = (labels: NovaTransactionsLabels): void => {
  useEffect(() => {
    setHostedLabels(labels);
    return () => {
      if (hostedLabels.labels === labels) setHostedLabels(null);
    };
  }, [labels]);
};

/**
 * A React component that provides a custom set of labels to all child components.
 * Wrap your application or component tree with this provider to apply custom translations.
 *
 * @param {object} props - The component props.
 * @param {NovaTransactionsLabels} props.labels - An object containing the custom labels.
 * @param {ReactNode} props.children - The child components to render.
 */
export const NovaTransactionsLabelsProvider = ({
  labels,
  children,
}: {
  labels: NovaTransactionsLabels;
  children: ReactNode;
}) => {
  return <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>;
};

/**
 * A custom hook to easily access the i18n labels from any component: those of the `NovaTransactionsLabelsProvider`
 * above it, otherwise those of the `NovaTransactionsProvider` mounted in the app, otherwise the English defaults.
 *
 * @returns {NovaTransactionsLabels} The complete object of UI labels.
 *
 * @example
 * const MyComponent = () => {
 * const labels = useLabels();
 * return <h1>{labels.walletModal.title}</h1>;
 * }
 */
export const useLabels = (): NovaTransactionsLabels => {
  const inTree = useContext(LabelsContext);
  const hosted = useSyncExternalStore(subscribeToHostedLabels, readHostedLabels, noHostedLabels);
  return inTree ?? hosted ?? defaultLabels;
};
