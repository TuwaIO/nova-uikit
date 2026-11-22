import { describe, expect, it } from 'vitest';

import { germanLabels } from './de';
import { defaultLabels } from './en';
import { spanishLabels } from './es';
import { italianLabels } from './it';
import type { NovaConnectLabels } from './types';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

const translations: [string, NovaConnectLabels][] = [
  ['Ukrainian', ukrainianLabels],
  ['Chinese', chineseLabels],
  // A German, Spanish or Italian checkout of Nova Payments opened Nova's connect modal in English
  ['German', germanLabels],
  ['Spanish', spanishLabels],
  ['Italian', italianLabels],
];

/** The placeholders of a label, in braces: the components replace them, so a translation keeps every one. */
const placeholdersOf = (label: string) => [...label.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('nova-connect i18n labels', () => {
  it.each(translations)('%s has the keys of the English dictionary', (_, labels) => {
    expect(Object.keys(labels).sort()).toEqual(Object.keys(defaultLabels).sort());
  });

  it.each(translations)('%s has non-empty strings for all labels', (language, labels) => {
    for (const [key, value] of Object.entries(labels)) {
      expect(typeof value, `${language} ${key} should be a string`).toBe('string');
      expect(value.trim().length, `${language} ${key} should not be empty`).toBeGreaterThan(0);
    }
  });

  it.each(translations)('%s keeps the placeholders of every English label', (language, labels) => {
    for (const [key, english] of Object.entries(defaultLabels)) {
      const translated = labels[key as keyof NovaConnectLabels];
      expect(placeholdersOf(translated), `${language} ${key}`).toEqual(placeholdersOf(english));
    }
  });
});
