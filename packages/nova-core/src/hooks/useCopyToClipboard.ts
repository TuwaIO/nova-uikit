/**
 * @file This file contains a custom React hook for copying text to the clipboard.
 */

import { useCallback, useState } from 'react';

/**
 * Result of `copy` of {@link useCopyToClipboard}: `copied: true`, or `copied: false` with the error (also without
 * text to copy).
 */
export type CopyToClipboardResult = { copied: true } | { copied: false; error: Error };

/**
 * Value returned by {@link useCopyToClipboard}.
 */
export interface UseCopyToClipboardResult {
  /** `true` for `timeout` milliseconds after a successful copy */
  isCopied: boolean;
  /**
   * Writes the text to the clipboard (`navigator.clipboard.writeText`). A failed write is logged with
   * `console.error` and kept in `error` for `timeout` milliseconds.
   *
   * @param text - The text to copy.
   * @returns Whether the text was copied, with the error when it was not.
   */
  copy: (text: string) => Promise<CopyToClipboardResult>;
  /** The error of the last failed write, for `timeout` milliseconds */
  error: Error | null;
}

/**
 * Copies text to the clipboard and keeps a "copied" state for user feedback.
 *
 * @param timeout - How long `isCopied` (and `error` after a failure) stays set, in milliseconds (default: `2000`).
 * @returns See {@link UseCopyToClipboardResult}.
 *
 * @example
 * ```tsx
 * import { useCopyToClipboard } from '@tuwaio/nova-core';
 *
 * export function CopyAddress({ address }: { address: string }) {
 *   const { isCopied, copy } = useCopyToClipboard();
 *
 *   const handleClick = async () => {
 *     const result = await copy(address);
 *     if (!result.copied) console.warn(result.error.message);
 *   };
 *
 *   return (
 *     <button type="button" onClick={handleClick}>
 *       {isCopied ? 'Copied!' : 'Copy address'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCopyToClipboard(timeout = 2000): UseCopyToClipboardResult {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<CopyToClipboardResult> => {
      if (!text) return { copied: false, error: new Error('There is no text to copy.') };

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setError(null);

        setTimeout(() => setIsCopied(false), timeout);
        return { copied: true };
      } catch (e) {
        const copyError = e instanceof Error ? e : new Error('Failed to copy text.');
        console.error(copyError);
        setError(copyError);

        // Reset error state after timeout as well
        setTimeout(() => setError(null), timeout);
        return { copied: false, error: copyError };
      }
    },
    [timeout],
  );

  return { isCopied, copy, error };
}
