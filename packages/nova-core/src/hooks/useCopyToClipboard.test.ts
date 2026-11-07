import { afterEach, describe, expect, it, vi } from 'vitest';

const { setState, ref } = vi.hoisted(() => ({ setState: vi.fn(), ref: { current: undefined as unknown } }));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, setState],
  useCallback: (fn: unknown) => fn,
  useEffect: vi.fn(),
  useRef: () => ref,
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

  // The reset of an earlier copy cut the `Copied` of a later one short
  it('keeps a later copy for its whole time', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(async () => undefined) } });
    const { copy } = useCopyToClipboard(1000);

    await copy('first');
    await vi.advanceTimersByTimeAsync(900);
    await copy('second');
    setState.mockClear();
    await vi.advanceTimersByTimeAsync(900);
    expect(setState).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(setState).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });
});
