import { motion } from 'framer-motion';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';
import { render, unmount } from '../../testing/hookHarness';

vi.mock('react', async (importOriginal) => {
  const { hooks } = await import('../../testing/hookHarness');
  return { ...(await importOriginal<typeof import('react')>()), ...hooks };
});

vi.mock('../../hooks', () => ({
  useNovaConnectLabels: () => defaultLabels,
  useNovaConnect: () => ({
    isConnectedModalOpen: true,
    connectedModalContentType: 'main',
    setConnectedModalContentType: vi.fn(),
    setIsConnectedModalOpen: vi.fn(),
  }),
  useGetWalletNameAndAvatar: () => ({}),
  useWalletNativeBalance: () => ({ refetch: vi.fn() }),
  useWalletChainsList: () => ({ chainsList: [] }),
}));

const storeState = {
  activeConnection: {
    address: '0x1234567890123456789012345678901234567890',
    connectorType: 'evm:metamask',
    chainId: 1,
    isConnected: true,
  },
  switchNetwork: vi.fn(),
};

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
}));

import { ConnectedModal, type ConnectedModalProps } from './ConnectedModal';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const renderModal = (props: Partial<ConnectedModalProps> = {}) =>
  render((ConnectedModal as unknown as { render: (p: ConnectedModalProps) => unknown }).render, {
    ...props,
  } as ConnectedModalProps);

describe('ConnectedModal', () => {
  afterEach(() => unmount());

  it('has no layout animation: the window is never stretched for a frame after a size change', () => {
    const tree = renderModal({
      // Deprecated, no longer applied
      customization: { animation: { layout: { duration: 0.5 } } },
    });

    expect(elements(tree).filter((element) => 'layout' in element.props)).toEqual([]);
    const container = elements(tree).find((element) => element.type === motion.div);
    // The opening animation stays
    expect(container?.props.initial).toBe('initial');
    expect(container?.props.animate).toBe('animate');
    expect(container?.props.transition).not.toHaveProperty('layout');
  });
});
