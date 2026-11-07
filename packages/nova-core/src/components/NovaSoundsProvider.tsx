/**
 * @file Sets the sounds of the Nova components under it.
 */

import { type ReactNode, useMemo } from 'react';

import { NovaSoundsContext } from '../hooks/useNovaSounds';
import type { NovaSoundsConfig } from '../utils/sounds';

/** Props of {@link NovaSoundsProvider}. */
export type NovaSoundsProviderProps = {
  /** Which sounds play. Without it, none. */
  sounds?: NovaSoundsConfig;
  /** The components that can play them. */
  children: ReactNode;
};

/**
 * Sets the sounds of the Nova components under it. `NovaConnectProvider` of `@tuwaio/nova-connect` and
 * `NovaTransactionsProvider` of `@tuwaio/nova-transactions` render it with their `sounds` prop.
 *
 * @param props - See {@link NovaSoundsProviderProps}.
 * @returns The children inside the provider of the context.
 */
export function NovaSoundsProvider({ sounds, children }: NovaSoundsProviderProps) {
  // By value: an object written in place of the prop is new on every render, and every copy button would follow it
  const key = JSON.stringify(sounds);
  const value = useMemo<NovaSoundsConfig | undefined>(() => (key === undefined ? undefined : JSON.parse(key)), [key]);

  return <NovaSoundsContext.Provider value={value}>{children}</NovaSoundsContext.Provider>;
}
