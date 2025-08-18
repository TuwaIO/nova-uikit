/**
 * @file This file contains a utility for performing a deep (recursive) merge of two objects.
 */

/**
 * Checks if the provided item is a plain object (i.e., not null and not an array).
 *
 * @param {any} item - The item to check.
 * @returns {item is Record<string, any>} True if the item is a plain object, otherwise false.
 */
const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

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

  if (isObject(target) && isObject(source)) {
    // Iterate over the keys in the source object.
    Object.keys(source).forEach((key) => {
      const targetValue = target[key as keyof T];
      const sourceValue = source[key as keyof T];

      // If the value is an object in both target and source, merge them recursively.
      if (isObject(targetValue) && isObject(sourceValue)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (output as Record<string, any>)[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise, the source value overwrites the target value.
        (output as Record<string, any>)[key] = sourceValue;
      }
    });
  }

  return output;
}
