import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
  useMemo: (fn: () => unknown) => fn(),
}));

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection: undefined, connectionError: undefined }),
}));

import { NovaSiwxWatcher } from '../watchers';
import { NovaConnectProvider } from './NovaConnectProvider';

/** Whether an element of this type is anywhere in the element tree (children and props). */
function containsType(node: ReactNode | unknown, type: unknown): boolean {
  if (Array.isArray(node)) return node.some((child) => containsType(child, type));
  if (!isValidElement(node)) return false;
  if (node.type === type) return true;
  return Object.values(node.props as Record<string, unknown>).some((value) => containsType(value, type));
}

describe('NovaConnectProvider', () => {
  it('renders the SIWX watcher only when `siwx` is set', () => {
    expect(containsType(NovaConnectProvider({ children: null }), NovaSiwxWatcher)).toBe(false);
    expect(containsType(NovaConnectProvider({ children: null, siwx: { verifier: vi.fn() } }), NovaSiwxWatcher)).toBe(
      true,
    );
  });
});
