import { describe, expect, it } from 'vitest';

import { textCenterEllipsis } from './textCenterEllipsis';

describe('textCenterEllipsis utility', () => {
  it('truncates middle of long string with ellipsis', () => {
    const hash = '0x1234567890abcdef1234567890abcdef';
    const result = textCenterEllipsis(hash, 6, 4);
    expect(result).toBe('0x1234...cdef');
  });

  it('returns original string if length is less than or equal to from + to', () => {
    expect(textCenterEllipsis('short', 4, 4)).toBe('short');
    expect(textCenterEllipsis('123456', 3, 3)).toBe('123456');
  });

  it('returns empty string for null or undefined or empty input', () => {
    expect(textCenterEllipsis(null, 4, 4)).toBe('');
    expect(textCenterEllipsis(undefined, 4, 4)).toBe('');
    expect(textCenterEllipsis('', 4, 4)).toBe('');
  });
});
