import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
  useCallback: (fn: unknown) => fn,
}));

import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resolves `copied: true` after a successful write', async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(useCopyToClipboard().copy('0x123')).resolves.toEqual({ copied: true });
    expect(writeText).toHaveBeenCalledWith('0x123');
  });

  it('resolves `copied: false` with the error when the write fails', async () => {
    const error = new Error('Clipboard permission denied');
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(async () => Promise.reject(error)) } });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(useCopyToClipboard().copy('0x123')).resolves.toEqual({ copied: false, error });
  });

  it('resolves `copied: false` without text', async () => {
    const result = await useCopyToClipboard().copy('');
    expect(result.copied).toBe(false);
  });
});
