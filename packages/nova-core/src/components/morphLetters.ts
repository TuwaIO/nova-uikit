/**
 * @file The letters of a text, for `MorphText`. Apart from it so that the helper is not an export of the package.
 */

/**
 * Splits a text into letters with a key that stays the same between two versions of the text: the n-th `a` of one is the
 * n-th `a` of the other, which is what lets it glide instead of fading.
 *
 * @internal
 * @param text - The text.
 * @returns The letters with their keys. A letter made of several code points, such as an emoji, stays whole.
 */
export function morphLetters(text: string): { key: string; letter: string }[] {
  const letters =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (part) => part.segment)
      : Array.from(text);
  const seen = new Map<string, number>();
  return letters.map((letter) => {
    const count = seen.get(letter) ?? 0;
    seen.set(letter, count + 1);
    return { key: `${letter}-${count}`, letter };
  });
}
