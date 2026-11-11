/**
 * @file Sets the icons and the look of the Nova components under it.
 */

import type { ReactNode } from 'react';

import { NovaIconsContext, type NovaIconSet } from '../hooks/useNovaIcons';

/** Props of {@link NovaIconsProvider}. */
export type NovaIconsProviderProps = {
  /**
   * The icon set: `heroicons` of `@tuwaio/nova-core/heroicons` for the look Nova had before, or a set of your own. Without
   * it the provider changes nothing, and the icons of an outer provider (else the pixel ones) stay.
   */
  icons?: NovaIconSet;
  /** The components that draw the icons. */
  children: ReactNode;
};

/**
 * Sets the icons and the look of the Nova components under it. Without a provider they are pixel (`pixelIcons`).
 * `NovaConnectProvider` of `@tuwaio/nova-connect` and `NovaTransactionsProvider` of `@tuwaio/nova-transactions` render it
 * with their `icons` prop.
 *
 * @param props - See {@link NovaIconsProviderProps}.
 * @returns The children, inside the provider of the context when it has icons.
 *
 * @example
 * ```tsx
 * import { NovaIconsProvider } from '@tuwaio/nova-core';
 * import { heroicons } from '@tuwaio/nova-core/heroicons';
 * import type { ReactNode } from 'react';
 *
 * export function ClassicNova({ children }: { children: ReactNode }) {
 *   return <NovaIconsProvider icons={heroicons}>{children}</NovaIconsProvider>;
 * }
 * ```
 */
export function NovaIconsProvider({ icons, children }: NovaIconsProviderProps) {
  if (!icons) return children;
  return <NovaIconsContext.Provider value={icons}>{children}</NovaIconsContext.Provider>;
}
