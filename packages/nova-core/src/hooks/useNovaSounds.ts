/**
 * @file The sounds set by a provider of Nova, for the components under it.
 */

import { globalSingleton } from '@tuwaio/orbit-core';
import { createContext, useCallback, useContext } from 'react';

import { type NovaSoundName, type NovaSoundsConfig, playNovaSound } from '../utils/sounds';

/**
 * The `sounds` of the closest `NovaSoundsProvider`, shared on `globalThis` so that two copies of this package agree.
 * Without a provider it is `undefined`: no sounds.
 */
export const NovaSoundsContext = globalSingleton('tuwaio.nova-core.sounds', () =>
  createContext<NovaSoundsConfig | undefined>(undefined),
);

/**
 * Returns a function that plays a sound with the `sounds` of the closest `NovaSoundsProvider`. See `playNovaSound` of
 * `@tuwaio/nova-core/utils` for when it stays silent. Without a provider nothing plays.
 *
 * @returns The function; it takes the name of the sound.
 *
 * @example
 * ```tsx
 * import { useNovaSounds } from '@tuwaio/nova-core';
 *
 * export function SaveButton() {
 *   const play = useNovaSounds();
 *   return (
 *     <button type="button" onClick={() => play('txSuccess')}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 */
export function useNovaSounds(): (name: NovaSoundName) => void {
  const sounds = useContext(NovaSoundsContext);
  return useCallback((name: NovaSoundName) => playNovaSound(name, sounds), [sounds]);
}
