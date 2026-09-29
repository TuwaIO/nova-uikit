/**
 * @file This file sets up the React Context for providing i18n labels throughout the UI components.
 * It allows for deep customization of all text displayed by the library.
 */

import { ReactNode, useMemo } from 'react';

import { NovaConnectLabelsContext } from '../hooks/useNovaConnectLabels';
import { NovaConnectLabels } from '../i18n';

/**
 * Props for the {@link NovaConnectLabelsProvider} component.
 */
export interface NovaConnectLabelsProviderProps {
  /** All labels (spread `defaultLabels` of `@tuwaio/nova-connect/i18n` to change only some) */
  labels: NovaConnectLabels;
  /** The child components to render */
  children: ReactNode;
}

/**
 * Provides labels to the Nova Connect components below it. `NovaConnectProvider` already renders it with the `labels`
 * prop merged into the defaults, so use it directly only to give a part of the tree other texts. In development it
 * warns about missing basic labels.
 *
 * @param props - See {@link NovaConnectLabelsProviderProps}.
 * @returns The labels context provider.
 *
 * @example
 * ```tsx
 * import { NovaConnectLabelsProvider } from '@tuwaio/nova-connect';
 * import { defaultLabels } from '@tuwaio/nova-connect/i18n';
 * import type { ReactNode } from 'react';
 *
 * export function CustomTexts({ children }: { children: ReactNode }) {
 *   return (
 *     <NovaConnectLabelsProvider labels={{ ...defaultLabels, connectWallet: 'Link wallet' }}>
 *       {children}
 *     </NovaConnectLabelsProvider>
 *   );
 * }
 * ```
 */
export function NovaConnectLabelsProvider({ labels, children }: NovaConnectLabelsProviderProps) {
  // Memoize labels to prevent unnecessary re-renders
  const memoizedLabels = useMemo(() => labels, [labels]);

  // Development-only validation
  if (process.env.NODE_ENV === 'development') {
    // Validate that labels object is provided
    if (!labels || typeof labels !== 'object') {
      console.warn('NovaConnectLabelsProvider: labels prop should be an object');
    }

    // Check for missing required labels (basic validation)
    const requiredLabels = ['connectWallet', 'disconnect', 'connecting', 'connected', 'error', 'success'] as const;

    const missingLabels = requiredLabels.filter((key) => !(key in labels));
    if (missingLabels.length > 0) {
      console.warn(`NovaConnectLabelsProvider: Missing required labels: ${missingLabels.join(', ')}`);
    }
  }

  return <NovaConnectLabelsContext.Provider value={memoizedLabels}>{children}</NovaConnectLabelsContext.Provider>;
}

// Add display name for better debugging
NovaConnectLabelsProvider.displayName = 'NovaConnectLabelsProvider';
