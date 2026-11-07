import { describe, expect, it } from 'vitest';

import { formatCountLabel, formatLabel, formatLabelParts } from './formatLabel';

describe('formatLabel', () => {
  it('fills the placeholders and keeps the unknown ones', () => {
    expect(formatLabel('Step {current} of {total}', { current: 1, total: 3 })).toBe('Step 1 of 3');
    expect(formatLabel('Step {current} of {total}', { current: 1 })).toBe('Step 1 of {total}');
  });

  // `in` reached the prototype: a translation with this word printed the source of a function
  it('takes only the values it was given', () => {
    expect(formatLabel('{toString} {constructor}', {})).toBe('{toString} {constructor}');
    expect(formatLabelParts('{toString}', {})).toEqual(['{toString}']);
  });
});

describe('formatLabelParts', () => {
  it('puts values that are not text, such as links, into a label', () => {
    const terms = { link: 'Terms' };
    expect(formatLabelParts('You agree to the {terms} of {seller}.', { terms, seller: 'Acme' })).toEqual([
      'You agree to the ',
      terms,
      ' of ',
      'Acme',
      '.',
    ]);
    expect(formatLabelParts('{a}{b}', { a: 1, b: 2 })).toEqual([1, 2]);
    expect(formatLabelParts('Keep {unknown}', {})).toEqual(['Keep {unknown}']);
  });
});

describe('formatCountLabel', () => {
  const forms = { one: '{count} item of {seller}', other: '{count} items of {seller}' };

  it('takes the form the plural rule of the language picks, with the count and the other values', () => {
    expect(formatCountLabel(forms, 1, 'en', { seller: 'Acme' })).toBe('1 item of Acme');
    expect(formatCountLabel(forms, 0, 'en', { seller: 'Acme' })).toBe('0 items of Acme');
    expect(formatCountLabel(forms, 2, 'en', { seller: 'Acme' })).toBe('2 items of Acme');
    // Ukrainian takes `one` for 21, 31…; Chinese never does
    expect(formatCountLabel(forms, 21, 'uk', { seller: 'Acme' })).toBe('21 item of Acme');
    expect(formatCountLabel(forms, 1, 'zh-CN', { seller: 'Acme' })).toBe('1 items of Acme');
  });

  it('falls back to the English rule for a language tag Intl does not accept', () => {
    expect(formatCountLabel(forms, 1, '', { seller: 'Acme' })).toBe('1 item of Acme');
    expect(formatCountLabel(forms, 1, 'not a tag!', { seller: 'Acme' })).toBe('1 item of Acme');
  });
});

// Showcase review, 2026-10-29: the compact order on a phone read "1 items"

describe('formatCountLabel', () => {
  const english = { one: '{count} item', other: '{count} items' };
  const ukrainian = { one: '{count} позиція', other: 'Позицій: {count}' };

  it.each([
    [1, 'en', english, '1 item'],
    [3, 'en', english, '3 items'],
    [21, 'en', english, '21 items'],
    [1, 'uk', ukrainian, '1 позиція'],
    [21, 'uk', ukrainian, '21 позиція'],
    [3, 'uk', ukrainian, 'Позицій: 3'],
    [11, 'uk', ukrainian, 'Позицій: 11'],
    // Chinese has one form, which is `other`
    [1, 'zh-CN', { one: 'unused', other: '{count} 件' }, '1 件'],
  ])('%i in %s', (count, locale, forms, expected) => {
    expect(formatCountLabel(forms, count, locale)).toBe(expected);
  });

  it('takes the English rule for a tag that Intl does not accept, or none', () => {
    expect(formatCountLabel(english, 1, 'not a language')).toBe('1 item');
    expect(formatCountLabel(english, 2, '')).toBe('2 items');
  });

  it('fills the other placeholders as well', () => {
    expect(
      formatCountLabel({ one: '{count} item, {tax}', other: '{count} items, {tax}' }, 2, 'en', { tax: 'VAT 0.20' }),
    ).toBe('2 items, VAT 0.20');
  });
});
