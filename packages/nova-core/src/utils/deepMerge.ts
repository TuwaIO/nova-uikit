import { isRecord } from '@tuwaio/orbit-core';

/**
 * @file This file contains a utility for performing a deep (recursive) merge of two objects.
 */

/**
 * Recursively merges the properties of a source object into a target object.
 * This function creates a new object and does not mutate the original target.
 *
 * @template T - The type of the objects being merged.
 * @param {T} target - The base object.
 * @param {Partial<T>} source - The object with properties to merge into the target.
 * @returns {T} A new object representing the merged result.
 *
 * @example
 * const defaults = { a: 1, b: { c: 2, d: 3 } };
 * const custom = { b: { c: 99 } };
 * const result = deepMerge(defaults, custom);
 * // result will be { a: 1, b: { c: 99, d: 3 } }
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  // Start with a shallow copy of the target to avoid mutation.
  const output = { ...target };

  if (isRecord(target) && isRecord(source)) {
    // Iterate over the keys in the source object.
    Object.keys(source).forEach((key) => {
      const targetValue = target[key as keyof T];
      const sourceValue = source[key as keyof T];

      // If the value is an object in both target and source, merge them recursively.
      if (isRecord(targetValue) && isRecord(sourceValue)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (output as Record<string, unknown>)[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise, the source value overwrites the target value.
        (output as Record<string, unknown>)[key] = sourceValue;
      }
    });
  }

  return output;
}
