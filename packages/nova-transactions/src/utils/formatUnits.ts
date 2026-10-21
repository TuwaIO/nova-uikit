/**
 * @file Formats an integer amount in the smallest unit (wei, lamports) as a decimal string.
 */

/**
 * Formats an integer amount in the smallest unit of a currency as a decimal number, for example wei as gwei
 * (`decimals` 9) or lamports as SOL (`decimals` 9), without trailing zeros and without rounding.
 *
 * @param value - The integer amount, as a number, a decimal string or a bigint.
 * @param decimals - The number of decimals of the displayed unit.
 * @returns The decimal string, or `undefined` when `value` is missing or not an integer.
 * @internal
 */
export function formatUnits(value: string | number | bigint | null | undefined, decimals: number): string | undefined {
  if (value === null || value === undefined) return undefined;
  const digits = String(value);
  if (!/^\d+$/.test(digits)) return undefined;

  const padded = digits.padStart(decimals + 1, '0');
  const whole = padded.slice(0, padded.length - decimals).replace(/^0+(?=\d)/, '');
  const fraction = padded.slice(padded.length - decimals).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}
