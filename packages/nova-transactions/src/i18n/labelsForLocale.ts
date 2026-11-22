import { germanLabels } from './de';
import { defaultLabels } from './en';
import { spanishLabels } from './es';
import { italianLabels } from './it';
import { NovaTransactionsLabels } from './types';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

/**
 * The labels of a language, for an app that switches languages: Ukrainian for `uk`, Simplified Chinese for `zh` and
 * `zh-CN`, German for `de`, Spanish for `es`, Italian for `it` (with any region), English for the rest.
 *
 * @param locale - The language, a BCP 47 tag such as `uk` or `zh-CN`.
 * @returns The labels of that language.
 */
export function labelsForLocale(locale: string): NovaTransactionsLabels {
  const language = locale.split('-')[0].toLowerCase();
  // `ua` as well: it is what the labels of this package are named after
  if (language === 'uk' || language === 'ua') return ukrainianLabels;
  if (language === 'zh') return chineseLabels;
  // The languages of a Nova Payments checkout: its toasts were half in English in them
  if (language === 'de') return germanLabels;
  if (language === 'es') return spanishLabels;
  if (language === 'it') return italianLabels;
  return defaultLabels;
}
