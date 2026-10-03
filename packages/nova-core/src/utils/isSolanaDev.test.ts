import { describe, expect, it } from 'vitest';

import { isSolanaDev } from './isSolanaDev';

describe('isSolanaDev utility', () => {
  it('returns true for solana:devnet', () => {
    expect(isSolanaDev('solana:devnet')).toBe(true);
    expect(isSolanaDev('SOLANA:DEVNET')).toBe(true);
  });

  it('returns true for solana:testnet', () => {
    expect(isSolanaDev('solana:testnet')).toBe(true);
    expect(isSolanaDev('SOLANA:TESTNET')).toBe(true);
  });

  it('returns false for solana:mainnet or solana mainnet-beta', () => {
    expect(isSolanaDev('solana:mainnet')).toBe(false);
    expect(isSolanaDev('solana:mainnet-beta')).toBe(false);
    expect(isSolanaDev('solana')).toBe(false);
  });

  it('recognizes the genesis-hash chain IDs of devnet and testnet', () => {
    expect(isSolanaDev('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1')).toBe(true);
    expect(isSolanaDev('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')).toBe(true);
    expect(isSolanaDev('solana:4uhcVJyU9pJkvQyS88uRfhDSfZSm8DoR')).toBe(true);
    expect(isSolanaDev('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(false);
  });

  it('returns false for numeric chain IDs', () => {
    expect(isSolanaDev(1)).toBe(false);
    expect(isSolanaDev(137)).toBe(false);
  });

  it('returns false for other chains even if mentioning devnet', () => {
    expect(isSolanaDev('ethereum:devnet')).toBe(false);
  });
});
