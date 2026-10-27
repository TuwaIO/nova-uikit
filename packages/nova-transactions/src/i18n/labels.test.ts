import { describe, expect, it } from 'vitest';

import { defaultLabels } from './en';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

function getLeafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getLeafKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('nova-transactions i18n labels', () => {
  it('has identical nested key structure across English, Ukrainian, and Chinese dictionaries', () => {
    const enKeys = getLeafKeys(defaultLabels as unknown as Record<string, unknown>);
    const uaKeys = getLeafKeys(ukrainianLabels as unknown as Record<string, unknown>);
    const zhKeys = getLeafKeys(chineseLabels as unknown as Record<string, unknown>);

    expect(uaKeys).toEqual(enKeys);
    expect(zhKeys).toEqual(enKeys);
  });

  it('contains non-empty strings for all Ukrainian labels', () => {
    function validateValues(obj: Record<string, unknown>, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          validateValues(value as Record<string, unknown>, fullPath);
        } else {
          expect(typeof value, `${fullPath} should be a string`).toBe('string');
          expect((value as string).trim().length, `${fullPath} should not be empty`).toBeGreaterThan(0);
        }
      }
    }
    validateValues(ukrainianLabels as unknown as Record<string, unknown>);
  });

  it('contains non-empty strings for all Chinese labels', () => {
    function validateValues(obj: Record<string, unknown>, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          validateValues(value as Record<string, unknown>, fullPath);
        } else {
          expect(typeof value, `${fullPath} should be a string`).toBe('string');
          expect((value as string).trim().length, `${fullPath} should not be empty`).toBeGreaterThan(0);
        }
      }
    }
    validateValues(chineseLabels as unknown as Record<string, unknown>);
  });
});
