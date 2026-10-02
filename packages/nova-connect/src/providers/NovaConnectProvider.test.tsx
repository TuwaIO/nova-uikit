import { isValidElement, type ReactNode } from 'react';
import { mainnet } from 'viem/chains';
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

import { ConnectedModal } from '../components/ConnectedModal/ConnectedModal';
import { ConnectModal } from '../components/ConnectModal/ConnectModal';
import { NovaSiwxWatcher } from '../watchers';
import { NovaConnectProvider } from './NovaConnectProvider';

/** Whether an element of this type is anywhere in the element tree (children and props). */
function containsType(node: ReactNode | unknown, type: unknown): boolean {
  if (Array.isArray(node)) return node.some((child) => containsType(child, type));
  if (!isValidElement(node)) return false;
  if (node.type === type) return true;
  return Object.values(node.props as Record<string, unknown>).some((value) => containsType(value, type));
}

/** The first element of this type in the element tree (children and props). */
function findType(node: ReactNode | unknown, type: unknown): ReactNode | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findType(child, type);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  if (node.type === type) return node;
  for (const value of Object.values(node.props as Record<string, unknown>)) {
    const found = findType(value, type);
    if (found) return found;
  }
  return undefined;
}

describe('NovaConnectProvider', () => {
  it('renders the SIWX watcher only when `siwx` is set', () => {
    expect(containsType(NovaConnectProvider({ children: null }), NovaSiwxWatcher)).toBe(false);
    expect(containsType(NovaConnectProvider({ children: null, siwx: { verifier: vi.fn() } }), NovaSiwxWatcher)).toBe(
      true,
    );
  });

  it('gives the labels to the modals, the error toasts and the SIWX watcher, not only to the app', () => {
    const Labels = ({ children }: { children?: ReactNode }) => <>{children}</>;
    const Errors = () => null;
    const tree = NovaConnectProvider({
      children: null,
      appChains: [mainnet],
      siwx: { verifier: vi.fn() },
      customization: { components: { LabelsProvider: Labels, ErrorsProvider: Errors } },
    });

    const labels = findType(tree, Labels);
    expect(labels).toBeDefined();
    for (const type of [ConnectModal, ConnectedModal, Errors, NovaSiwxWatcher]) {
      expect(containsType(labels, type)).toBe(true);
    }
  });
});
