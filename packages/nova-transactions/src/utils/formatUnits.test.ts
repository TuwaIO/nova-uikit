import { describe, expect, it } from 'vitest';

import { formatUnits } from './formatUnits';

describe('formatUnits', () => {
  it('formats wei as gwei and lamports as SOL without trailing zeros', () => {
    expect(formatUnits('1200000000', 9)).toBe('1.2');
    expect(formatUnits('100000000', 9)).toBe('0.1');
    expect(formatUnits(5000, 9)).toBe('0.000005');
    expect(formatUnits('30000000000', 9)).toBe('30');
    expect(formatUnits(0, 9)).toBe('0');
  });

  it('keeps every digit of large values', () => {
    expect(formatUnits('123456789012345678901', 9)).toBe('123456789012.345678901');
  });

  it('returns undefined for missing or non-integer values', () => {
    expect(formatUnits(undefined, 9)).toBeUndefined();
    expect(formatUnits(null, 9)).toBeUndefined();
    expect(formatUnits('', 9)).toBeUndefined();
    expect(formatUnits('1.5', 9)).toBeUndefined();
    expect(formatUnits('abc', 9)).toBeUndefined();
  });
});
