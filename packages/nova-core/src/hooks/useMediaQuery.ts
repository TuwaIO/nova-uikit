import { useCallback, useSyncExternalStore } from 'react';

/**
 * A custom hook to detect if a media query matches. Returns `false` on the server and during hydration, so the first
 * render in the browser matches the markup of the server. In the browser it follows the `change` event of the query,
 * through a listener that is removed on unmount.
 *
 * @param query - The media query string (e.g., '(max-width: 767px)').
 * @returns Whether the query matches.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
