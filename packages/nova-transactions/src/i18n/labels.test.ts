import { describe, expect, it } from 'vitest';

import { germanLabels } from './de';
import { defaultLabels } from './en';
import { spanishLabels } from './es';
import { italianLabels } from './it';
import type { NovaTransactionsLabels } from './types';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

function getLeaves(obj: Record<string, unknown>, prefix = ''): [string, unknown][] {
  const leaves: [string, unknown][] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      leaves.push(...getLeaves(value as Record<string, unknown>, fullKey));
    } else {
      leaves.push([fullKey, value]);
    }
  }
  return leaves.sort(([a], [b]) => a.localeCompare(b));
}

const leavesOf = (labels: NovaTransactionsLabels) => getLeaves(labels as unknown as Record<string, unknown>);

const translations: [string, NovaTransactionsLabels][] = [
  ['Ukrainian', ukrainianLabels],
  ['Chinese', chineseLabels],
  // A German, Spanish or Italian checkout of Nova Payments showed its toasts half in English
  ['German', germanLabels],
  ['Spanish', spanishLabels],
  ['Italian', italianLabels],
];

describe('nova-transactions i18n labels', () => {
  it.each(translations)('%s has the nested keys of the English dictionary', (_, labels) => {
    expect(leavesOf(labels).map(([key]) => key)).toEqual(leavesOf(defaultLabels).map(([key]) => key));
  });

  it.each(translations)('%s has non-empty strings for all labels', (language, labels) => {
    for (const [key, value] of leavesOf(labels)) {
      expect(typeof value, `${language} ${key} should be a string`).toBe('string');
      expect((value as string).trim().length, `${language} ${key} should not be empty`).toBeGreaterThan(0);
    }
  });
});
