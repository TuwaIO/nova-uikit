import { describe, expect, it } from 'vitest';

import { getChainName } from './getChainName';

describe('getChainName utility', () => {
  it('resolves numeric chain IDs (EVM mainnet 1)', () => {
    const info = getChainName(1);
    expect(info.name).toBe('Ethereum');
    expect(info.id).toBe('ethereum');
    expect(info.chainId).toBe(1);
  });

  it('resolves numeric chain ID for Polygon (137)', () => {
    const info = getChainName(137);
    expect(info.name).toBe('Polygon');
    expect(info.id).toBe('polygon');
    expect(info.chainId).toBe(137);
  });

  it('returns Unknown for unrecognized numeric chain IDs', () => {
    const info = getChainName(99999999);
    expect(info.name).toBe('Unknown');
    expect(info.id).toBe('unknown');
    expect(info.chainId).toBe(99999999);
  });

  it('resolves string chain IDs with solana base identifier', () => {
    const info = getChainName('solana');
    expect(info.name).toBe('Solana');
    expect(info.id).toBe('solana');
  });

  it('resolves solana:devnet and appends capitalized environment', () => {
    const info = getChainName('solana:devnet');
    expect(info.name).toBe('Solana Devnet');
    expect(info.id).toBe('solana');
    expect(info.chainId).toBe('solana:devnet');
  });

  it('resolves solana:testnet and appends capitalized environment', () => {
    const info = getChainName('solana:testnet');
    expect(info.name).toBe('Solana Testnet');
    expect(info.id).toBe('solana');
    expect(info.chainId).toBe('solana:testnet');
  });

  it('returns Unknown for unrecognized string chain IDs', () => {
    const info = getChainName('unknown-chain-xyz');
    expect(info.name).toBe('Unknown');
    expect(info.id).toBe('unknown');
  });
});
