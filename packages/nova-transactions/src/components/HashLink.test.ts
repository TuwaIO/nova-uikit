import { describe, expect, it } from 'vitest';

import { shortHash } from './HashLink';

describe('shortHash', () => {
  it('has the form of the addresses next to it', () => {
    expect(shortHash('0xAd9A211D227d2D9c1B5573f73CDa0284b758Ac0C')).toBe('0xAd9A…Ac0C');
    expect(shortHash('5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW')).toBe(
      '5VER…kQUW',
    );
  });

  it('leaves what is short already', () => {
    expect(shortHash('0x12345678')).toBe('0x12345678');
  });
});
