/**
 * @file This file contains a utility function for truncating a string with a center ellipsis.
 */

/**
 * Truncates a string by showing a specified number of characters from the start and end,
 * with an ellipsis in the middle. If the string is too short to be truncated, it's returned as is.
 *
 * @param {string} str - The string to truncate.
 * @param {number} from - The number of characters to show from the beginning of the string.
 * @param {number} to - The number of characters to show from the end of the string.
 * @returns {string} The truncated string, or the original string if it's too short.
 *
 * @example
 * const hash = '0x1234567890abcdef1234567890abcdef';
 * textCenterEllipsis(hash, 6, 4); // => "0x1234...cdef"
 *
 * textCenterEllipsis('short', 6, 4); // => "short"
 */
export function textCenterEllipsis(str: string | undefined | null, from: number, to: number): string {
  if (!str) {
    return '';
  }

  // If the string is short enough, don't truncate it.
  if (str.length <= from + to) {
    return str;
  }

  const start = str.slice(0, from);
  const end = str.slice(str.length - to);

  return `${start}...${end}`;
}
