/**
 * @file This file contains a custom React hook for copying text to the clipboard.
 */

import { useCallback, useState } from 'react';

/**
 * A custom React hook that provides functionality to copy text to the clipboard.
 * It also manages a "copied" state with a timeout for user feedback.
 *
 * @param {number} [timeout=2000] - The duration in milliseconds to keep the `isCopied` state as true.
 * @returns {{
 * isCopied: boolean;
 * copy: (text: string) => Promise<void>;
 * error: Error | null;
 * }} An object containing the `isCopied` state, the `copy` function, and any potential error.
 *
 * @example
 * const MyComponent = () => {
 * const { isCopied, copy } = useCopyToClipboard();
 * const textToCopy = '0x123...';
 *
 * return (
 * <button onClick={() => copy(textToCopy)}>
 * {isCopied ? 'Copied!' : 'Copy Address'}
 * </button>
 * );
 * }
 */
export function useCopyToClipboard(timeout = 2000): {
  isCopied: boolean;
  copy: (text: string) => Promise<void>;
  error: Error | null;
} {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setError(null);

        setTimeout(() => setIsCopied(false), timeout);
      } catch (e) {
        const copyError = e instanceof Error ? e : new Error('Failed to copy text.');
        console.error(copyError);
        setError(copyError);

        // Reset error state after timeout as well
        setTimeout(() => setError(null), timeout);
      }
    },
    [timeout],
  );

  return { isCopied, copy, error };
}
