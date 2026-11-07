/**
 * @file Sets the sounds of the Nova components under it.
 */

import { type ReactNode, useEffect, useMemo } from 'react';

import { NovaSoundsContext } from '../hooks/useNovaSounds';
import { type NovaSoundsConfig, playNovaSound } from '../utils/sounds';

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
 * Side effect: with sounds on, a click listener on `document`, for the links of Nova that open a new tab
 * (`data-nova-external-link`).
 *
 * @param props - See {@link NovaSoundsProviderProps}.
 * @returns The children inside the provider of the context.
 */
export function NovaSoundsProvider({ sounds, children }: NovaSoundsProviderProps) {
  // By value: an object written in place of the prop is new on every render, and every copy button would follow it
  const key = JSON.stringify(sounds);
  const value = useMemo<NovaSoundsConfig | undefined>(() => (key === undefined ? undefined : JSON.parse(key)), [key]);

  // The links of Nova that open a new tab, and only those: the links of the app under the provider stay as they are. One listener
  // for all, as they sit in dialogs and toasts and several of them have an `onClick` that a host can replace
  useEffect(() => {
    if (!value) return;
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.('a[data-nova-external-link]'))
        playNovaSound('externalLink', value);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [value]);

  return <NovaSoundsContext.Provider value={value}>{children}</NovaSoundsContext.Provider>;
}
