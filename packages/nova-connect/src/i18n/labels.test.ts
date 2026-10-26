import { describe, expect, it } from 'vitest';

import { defaultLabels } from './en';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

describe('nova-connect i18n labels', () => {
  it('has identical keys across English, Ukrainian, and Chinese dictionaries', () => {
    const enKeys = Object.keys(defaultLabels).sort();
    const uaKeys = Object.keys(ukrainianLabels).sort();
    const zhKeys = Object.keys(chineseLabels).sort();

    expect(uaKeys).toEqual(enKeys);
    expect(zhKeys).toEqual(enKeys);
  });

  it('contains non-empty strings for all labels in Chinese', () => {
    for (const [key, value] of Object.entries(chineseLabels)) {
      expect(typeof value, `chineseLabels.${key} should be a string`).toBe('string');
      expect(value.trim().length, `chineseLabels.${key} should not be empty`).toBeGreaterThan(0);
    }
  });

  it('contains non-empty strings for all labels in Ukrainian', () => {
    for (const [key, value] of Object.entries(ukrainianLabels)) {
      expect(typeof value, `ukrainianLabels.${key} should be a string`).toBe('string');
      expect(value.trim().length, `ukrainianLabels.${key} should not be empty`).toBeGreaterThan(0);
    }
  });
});
