/**
 * @file This file contains a utility function for conditionally merging Tailwind CSS classes.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function to conditionally join class names together and resolve
 * conflicting Tailwind CSS classes.
 *
 * It combines the functionality of `clsx` and `tailwind-merge`.
 *
 * @param {...ClassValue[]} inputs - A list of class values to be combined.
 * This can include strings, numbers, objects, arrays, and booleans.
 * @returns {string} The final, merged class name string.
 *
 * @example
 * cn('p-4', 'bg-red-500', { 'font-bold': true }); // => 'p-4 bg-red-500 font-bold'
 * cn('p-2', 'p-4'); // => 'p-4' (tailwind-merge resolves the conflict)
 *
 * @see https://github.com/dcastil/tailwind-merge
 * @see https://github.com/lukeed/clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
