/**
 * @file The times of a transaction in the language of the labels. `dayjs` speaks one language for everything on the page, English
 * unless an app changes it.
 */

/** The seconds of each unit a time is told in, the longest first. */
const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** A formatter of a language, English for one the browser does not know. */
function inLanguage<F>(locale: string | undefined, make: (locale: string) => F): F {
  try {
    return make(locale || 'en');
  } catch {
    return make('en');
  }
}

/**
 * How long ago something was: `5 minutes ago`, `yesterday`. A time that has not come, of a machine whose clock runs behind,
 * is now.
 *
 * @param timestamp - When it was, in seconds.
 * @param locale - The language, a BCP 47 tag; English by default.
 * @param now - The time now, in milliseconds.
 * @returns The text.
 */
export function timeAgo(timestamp: number, locale?: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round(now / 1000 - timestamp));
  const [unit, size] = UNITS.find(([, length]) => seconds >= length) ?? (['second', 1] as const);
  // To zero, as "now": minus zero reads as "in 0 seconds"
  const count = Math.floor(seconds / size);
  const format = inLanguage(locale, (language) => new Intl.RelativeTimeFormat(language, { numeric: 'auto' }));
  return format.format(count === 0 ? 0 : -count, unit);
}

/**
 * When something was, to the second on a 24 hour clock: `Nov 25, 16:29:54`.
 *
 * @param timestamp - When it was, in seconds.
 * @param locale - The language, a BCP 47 tag; English by default.
 * @param options - What else it names.
 * @param options.year - Whether it names the year.
 * @returns The text.
 */
export function timeOf(timestamp: number, locale?: string, { year = false }: { year?: boolean } = {}): string {
  const format = inLanguage(
    locale,
    (language) =>
      new Intl.DateTimeFormat(language, {
        ...(year && { year: 'numeric' }),
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }),
  );
  return format.format(new Date(timestamp * 1000));
}
