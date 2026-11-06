import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, 'variables.css'), 'utf8');

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: string, b: string) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

// `NetworkIcon` paints the background of a testnet's icon with this color. A pale one left the white mark of Solana Devnet and
// the pale mark of Sepolia on a square of nearly the same shade: at 1.8 to 1 it read as a broken icon
describe('the color of testnet icons', () => {
  const colors = [...css.matchAll(/--tuwa-testnet-icons:\s*(#[0-9a-f]{6})/gi)].map((match) => match[1]);

  it('is set in both themes', () => {
    expect(colors).toHaveLength(2);
  });

  it.each([
    ['the white mark of Solana', '#ffffff'],
    ['the green of the Ethereum mark', '#8FFCF3'],
    ['the violet of the Ethereum mark', '#CABCF8'],
  ])('keeps %s visible (WCAG 1.4.11, 3 to 1)', (_name, mark) => {
    for (const color of colors) expect(contrast(color, mark)).toBeGreaterThanOrEqual(3);
  });
});
