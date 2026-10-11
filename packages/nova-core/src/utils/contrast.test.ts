import { describe, expect, it } from 'vitest';

import { contrastRatio, parseHexColor, readableTextColor } from './contrast';

describe('contrast', () => {
  it('reads six- and three-digit hex colors, and nothing else', () => {
    expect(parseHexColor('#2563eb')).toEqual([37, 99, 235]);
    expect(parseHexColor('#FFF')).toEqual([255, 255, 255]);
    expect(parseHexColor('2563eb')).toBeNull();
    expect(parseHexColor('#2563eg')).toBeNull();
    expect(parseHexColor('blue')).toBeNull();
  });

  it('computes the WCAG 2 contrast ratio, the same in both orders', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // White on blue-600 passes AA for text, white on blue-500 does not
    expect(contrastRatio('#ffffff', '#2563eb')).toBeCloseTo(5.17, 2);
    expect(contrastRatio('#3b82f6', '#ffffff')).toBeCloseTo(3.68, 2);
    expect(contrastRatio('#6b7280', '#ffffff')).toBeGreaterThan(4.5);
    expect(contrastRatio('#9ca3af', '#ffffff')).toBeLessThan(3);
    expect(contrastRatio('red', '#ffffff')).toBeNaN();
  });

  it('picks the text color that reads on a background, white unless the dark one reads better', () => {
    expect(readableTextColor('#2563eb')).toBe('#ffffff');
    expect(readableTextColor('#111827')).toBe('#ffffff');
    expect(readableTextColor('#facc15')).toBe('#111827');
    expect(readableTextColor('#16a34a')).toBe('#111827');
    expect(readableTextColor('#facc15', { light: '#fafafa', dark: '#000000' })).toBe('#000000');
    // A background that is not a hex color keeps the light text
    expect(readableTextColor('var(--brand)')).toBe('#ffffff');
  });
});
