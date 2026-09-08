import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useCallback: (fn: unknown) => fn,
    useEffect: () => {
      // noop in unit test
    },
    useRef: (val: unknown) => ({ current: val }),
    useState: (val: unknown) => [typeof val === 'function' ? (val as () => unknown)() : val, vi.fn()],
  };
});

let mockBalance: { value: string; symbol: string } | null = null;
const mockActiveConnection = {
  address: 'AiNJoXtwr2p3',
  chainId: 'solana:mainnet',
  connectorType: 'phantom',
  isConnected: true,
};

interface MockStoreState {
  activeConnection: typeof mockActiveConnection | null;
}

vi.mock('../../satellite', () => ({
  useSatelliteConnectStore: vi.fn((selector: (state: MockStoreState) => unknown) =>
    selector({ activeConnection: mockActiveConnection }),
  ),
}));

vi.mock('../../hooks', () => ({
  useNovaConnect: vi.fn(() => ({
    isConnectedModalOpen: false,
    setConnectedButtonStatus: vi.fn(),
    connectedButtonStatus: 'idle',
  })),
  useGetWalletNameAndAvatar: vi.fn(() => ({
    ensAvatar: null,
    ensNameAbbreviated: 'AiNJoX...twr2p3',
  })),
  useWalletNativeBalance: vi.fn(() => ({
    balance: mockBalance,
    isLoading: false,
    refetch: vi.fn(),
  })),
  useNovaConnectLabels: vi.fn(() => ({
    walletAddress: 'Wallet Address',
    walletBalance: 'Balance',
    transactionStatus: 'Transaction Status',
    success: 'Success',
    error: 'Error',
    walletAvatar: 'Avatar',
  })),
}));

import { ConnectedContent } from './ConnectedContent';

interface ComponentWithRender {
  render?: (props: Record<string, unknown>, ref: null) => ReactNode;
}

const renderContent = (props: Record<string, unknown>): ReactNode => {
  const comp = ConnectedContent as unknown as ComponentWithRender;
  if (typeof comp === 'function') {
    return (comp as (p: Record<string, unknown>) => ReactNode)(props);
  }
  if (typeof comp.render === 'function') {
    return comp.render(props, null);
  }
  return null;
};

interface ElementWithProps {
  props?: {
    children?: Array<{
      props?: {
        children?: Array<{
          props?: {
            formattedBalance?: string;
          };
        }>;
      };
    }>;
  };
}

const getRenderedFormattedBalance = (el: unknown): string => {
  const element = el as ElementWithProps;
  const balanceWrapper = element?.props?.children?.[0];
  const balanceContainer = balanceWrapper?.props?.children?.[0];
  return balanceContainer?.props?.formattedBalance ?? '';
};

describe('ConnectedContent formattedBalance handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats standard Solana balance with 3 decimal places', () => {
    mockBalance = { value: '2.5', symbol: 'SOL' };
    const el = renderContent({ withBalance: true });
    expect(getRenderedFormattedBalance(el)).toBe('2.500');
  });

  it('safely handles malformed "[object Object]" without producing NaN', () => {
    mockBalance = { value: '[object Object]', symbol: 'SOL' };
    const el = renderContent({ withBalance: true });
    const formatted = getRenderedFormattedBalance(el);

    expect(formatted).toBe('0.000');
    expect(formatted).not.toContain('NaN');
  });

  it('safely formats zero balance ("0") as "0.000"', () => {
    mockBalance = { value: '0', symbol: 'SOL' };
    const el = renderContent({ withBalance: true });

    expect(getRenderedFormattedBalance(el)).toBe('0.000');
  });

  it('safely formats null balance as "0.000"', () => {
    mockBalance = null;
    const el = renderContent({ withBalance: true });

    expect(getRenderedFormattedBalance(el)).toBe('0.000');
  });
});
