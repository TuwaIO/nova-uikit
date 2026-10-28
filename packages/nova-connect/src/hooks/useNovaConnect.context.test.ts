import { describe, expect, it, vi } from 'vitest';

describe('NovaConnectProviderContext', () => {
  it('is one context for every copy of the package', async () => {
    const first = await import('./useNovaConnect');
    vi.resetModules();
    const second = await import('./useNovaConnect');

    expect(second).not.toBe(first);
    expect(second.NovaConnectProviderContext).toBe(first.NovaConnectProviderContext);
    const shared = (globalThis as unknown as Record<symbol, unknown>)[Symbol.for('tuwaio.nova-connect.context')];
    expect(shared).toBe(first.NovaConnectProviderContext);
  });
});
