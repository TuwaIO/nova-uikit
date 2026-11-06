import { describe, expect, it } from 'vitest';

import { stripFill } from './statusEdgeFill';

describe('stripFill', () => {
  it('fills the strip for any result', () => {
    for (const tone of ['success', 'error', 'neutral'] as const) expect(stripFill(tone, undefined, false)).toBe(1);
  });

  it('shows only the glint while pending when nothing says how far it is', () => {
    expect(stripFill('pending', undefined, false)).toBe(0);
  });

  it('follows the share that is known', () => {
    expect(stripFill('pending', 0.5, false)).toBe(0.5);
    expect(stripFill('pending', 3, false)).toBe(1);
    expect(stripFill('pending', -1, false)).toBe(0);
  });

  it('stays visible without motion, when no glint can run', () => {
    expect(stripFill('pending', undefined, true)).toBe(1);
  });

  // A warning screen ran the glint of a payment under way, under a text asking the buyer to check the wallet
  it('fills the strip of a warning, which stands still', () => {
    expect(stripFill('warning', undefined, false)).toBe(1);
  });
});
