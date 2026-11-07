import { describe, expect, it } from 'vitest';

import { defaultLabels } from './en';
import { labelsForLocale } from './labelsForLocale';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

describe('labelsForLocale', () => {
  it.each([
    ['en', defaultLabels],
    ['de', defaultLabels],
    ['', defaultLabels],
    ['uk', ukrainianLabels],
    ['uk-UA', ukrainianLabels],
    ['ua', ukrainianLabels],
    ['zh', chineseLabels],
    ['zh-CN', chineseLabels],
  ])('%s', (locale, labels) => {
    expect(labelsForLocale(locale)).toBe(labels);
  });
});
