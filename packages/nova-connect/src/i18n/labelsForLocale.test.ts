import { describe, expect, it } from 'vitest';

import { germanLabels } from './de';
import { defaultLabels } from './en';
import { spanishLabels } from './es';
import { italianLabels } from './it';
import { labelsForLocale } from './labelsForLocale';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

describe('labelsForLocale', () => {
  it.each([
    ['en', defaultLabels],
    ['fr', defaultLabels],
    ['', defaultLabels],
    ['uk', ukrainianLabels],
    ['uk-UA', ukrainianLabels],
    ['ua', ukrainianLabels],
    ['zh', chineseLabels],
    ['zh-CN', chineseLabels],
    // The languages of a Nova Payments checkout: its connect modal spoke English in them
    ['de', germanLabels],
    ['de-AT', germanLabels],
    ['es', spanishLabels],
    ['es-MX', spanishLabels],
    ['it', italianLabels],
    ['IT', italianLabels],
  ])('%s', (locale, labels) => {
    expect(labelsForLocale(locale)).toBe(labels);
  });
});
