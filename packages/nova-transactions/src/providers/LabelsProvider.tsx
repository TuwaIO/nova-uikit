/**
 * @file This file sets up the React Context for providing i18n labels throughout the UI components.
 * It allows for deep customization of all text displayed by the library.
 */

import { createContext, ReactNode, useContext } from 'react';

import { defaultLabels } from '../i18n/en';
import { TuwaLabels } from '../i18n/types';

/**
 * React Context for storing and providing the UI labels.
 * It is initialized with the default English labels, ensuring that components
 * work even without an explicit provider.
 */
const LabelsContext = createContext<TuwaLabels>(defaultLabels);

/**
 * A React component that provides a custom set of labels to all child components.
 * Wrap your application or component tree with this provider to apply custom translations.
 *
 * @param {object} props - The component props.
 * @param {TuwaLabels} props.labels - An object containing the custom labels.
 * @param {ReactNode} props.children - The child components to render.
 */
export const LabelsProvider = ({ labels, children }: { labels: TuwaLabels; children: ReactNode }) => {
  return <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>;
};

/**
 * A custom hook to easily access the i18n labels from any component
 * within the `LabelsProvider` tree.
 *
 * @returns {TuwaLabels} The complete object of UI labels.
 *
 * @example
 * const MyComponent = () => {
 * const labels = useLabels();
 * return <h1>{labels.walletModal.title}</h1>;
 * }
 */
export const useLabels = (): TuwaLabels => {
  return useContext(LabelsContext);
};
