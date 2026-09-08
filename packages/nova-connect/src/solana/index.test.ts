import { describe, expect, it, vi } from 'vitest';

import { getSolanaExports } from './index';

describe('Solana module runtime loader', () => {
  it('attempts to dynamically load Solana exports and handles availability gracefully', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getSolanaExports();
    expect(result).toBeDefined();
    expect(typeof result.available).toBe('boolean');
    if (result.available) {
      expect(result.SolanaConnectorsWatcher).toBeDefined();
    } else {
      expect(typeof result.error).toBe('string');
    }
    warnSpy.mockRestore();
  });
});
