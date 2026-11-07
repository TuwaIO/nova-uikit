import { OrbitAdapter } from '@tuwaio/orbit-core';
import { isValidElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ activeConnection: undefined, connectionError: undefined }),
}));

import { NovaConnectProviderContext, type NovaConnectProviderType } from '../hooks/useNovaConnect';
import { render, unmount } from '../testing/hookHarness';
import { NovaConnectProvider } from './NovaConnectProvider';

/** The context value the provider gives, found in its element tree. */
function contextValue(node: ReactNode | unknown): NovaConnectProviderType | undefined {
  if (Array.isArray(node)) return node.map(contextValue).find(Boolean);
  if (!isValidElement(node)) return undefined;
  const props = node.props as { value?: NovaConnectProviderType; children?: ReactNode };
  if (node.type === NovaConnectProviderContext.Provider) return props.value;
  return contextValue(props.children);
}

const renderProvider = () => contextValue(render(NovaConnectProvider, { children: null }))!;

afterEach(unmount);

describe('NovaConnectProvider connect modal', () => {
  it('opens on the wallets of one chain family, and on all wallets again the next time', () => {
    renderProvider().setIsConnectModalOpen(true, { adapter: OrbitAdapter.SOLANA });
    let value = renderProvider();
    expect(value.isConnectModalOpen).toBe(true);
    expect(value.connectModalAdapter).toBe(OrbitAdapter.SOLANA);

    value.setIsConnectModalOpen(false);
    value = renderProvider();
    expect(value.isConnectModalOpen).toBe(false);
    expect(value.connectModalAdapter).toBeUndefined();

    value.setIsConnectModalOpen(true);
    value = renderProvider();
    expect(value.isConnectModalOpen).toBe(true);
    expect(value.connectModalAdapter).toBeUndefined();
  });
});
