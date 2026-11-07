import { defaultLabels } from './en';
import { NovaTransactionsLabels } from './types';
import { ukrainianLabels } from './ua';
import { chineseLabels } from './zh';

/**
 * The labels of a language, for an app that switches languages: Ukrainian for `uk`, Simplified Chinese for `zh` and
 * `zh-CN`, English for the rest.
 *
 * @param locale - The language, a BCP 47 tag such as `uk` or `zh-CN`.
 * @returns The labels of that language.
 */
export function labelsForLocale(locale: string): NovaTransactionsLabels {
  const language = locale.split('-')[0].toLowerCase();
  // `ua` as well: it is what the labels of this package are named after
  if (language === 'uk' || language === 'ua') return ukrainianLabels;
  if (language === 'zh') return chineseLabels;
  return defaultLabels;
}
