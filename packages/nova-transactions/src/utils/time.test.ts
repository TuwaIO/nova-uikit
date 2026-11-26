import { describe, expect, it } from 'vitest';

import { labelsForLocale } from '../i18n/labelsForLocale';
import { timeAgo, timeOf } from './time';

const NOW = Date.UTC(2026, 10, 25, 14, 30);
const ago = (seconds: number) => NOW / 1000 - seconds;
const DAY = 24 * 60 * 60;

// "16 days ago" and "Nov 25" stood in the middle of a Ukrainian list: dayjs speaks English unless its one language, which
// every library on the page shares, is changed
describe('how long ago', () => {
  it('is in the language of the labels', () => {
    expect(timeAgo(ago(16 * DAY), 'en', NOW)).toBe('16 days ago');
    expect(timeAgo(ago(16 * DAY), 'uk', NOW)).toBe('16 днів тому');
    expect(timeAgo(ago(2 * 60), 'uk', NOW)).toBe('2 хвилини тому');
    expect(timeAgo(ago(16 * DAY), 'zh-CN', NOW)).toBe('16天前');
    expect(timeAgo(ago(3 * 60 * 60), 'de', NOW)).toBe('vor 3 Stunden');
  });

  it.each([
    [0, 'now'],
    [44, '44 seconds ago'],
    [60, '1 minute ago'],
    [59 * 60, '59 minutes ago'],
    [60 * 60, '1 hour ago'],
    [23 * 60 * 60, '23 hours ago'],
    [DAY, 'yesterday'],
    [40 * DAY, 'last month'],
    [100 * DAY, '3 months ago'],
    [800 * DAY, '2 years ago'],
  ])('%s seconds: %s', (seconds, text) => {
    expect(timeAgo(ago(seconds), 'en', NOW)).toBe(text);
  });

  it('is in English for a language nobody knows, and of no time that has not come', () => {
    expect(timeAgo(ago(16 * DAY), 'not a language', NOW)).toBe('16 days ago');
    expect(timeAgo(ago(16 * DAY), undefined, NOW)).toBe('16 days ago');
    // The clock of the machine runs behind: a transaction sent just now is no transaction of the future
    expect(timeAgo(ago(-5), 'en', NOW)).toBe('now');
  });
});

describe('when', () => {
  const at = new Date(2026, 10, 25, 16, 29, 54).getTime() / 1000;

  it('is in the language of the labels, to the second on a 24 hour clock', () => {
    expect(timeOf(at, 'en')).toBe('Nov 25, 16:29:54');
    expect(timeOf(at, 'en', { year: true })).toBe('Nov 25, 2026, 16:29:54');
    expect(timeOf(at, 'uk')).toBe('25 лист., 16:29:54');
    expect(timeOf(at, 'zh-CN', { year: true })).toBe('2026年11月25日 16:29:54');
  });

  it('is in English for a language nobody knows', () => {
    expect(timeOf(at, 'not a language')).toBe('Nov 25, 16:29:54');
    expect(timeOf(at)).toBe('Nov 25, 16:29:54');
  });
});

it('the labels of each language name it, for the times beside them', () => {
  for (const locale of ['en', 'uk', 'zh-CN', 'de', 'es', 'it']) expect(labelsForLocale(locale).locale).toBe(locale);
});
