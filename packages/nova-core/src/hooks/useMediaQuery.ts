import { useEffect, useState } from 'react';

/**
 * A custom hook to detect if a media query matches the current screen dimensions.
 * Handles SSR gracefully.
 * @param {string} query - The media query string (e.g., '(max-width: 767px)').
 * @returns {boolean} Whether the query matches or not.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    // Re-check on mount and subscribe to changes
    listener();
    window.addEventListener('resize', listener);

    return () => window.removeEventListener('resize', listener);
  }, [query]);

  return matches;
}
