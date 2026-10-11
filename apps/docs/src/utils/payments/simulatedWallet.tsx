import { NovaConnectProviderContext, type NovaConnectProviderType } from '@tuwaio/nova-connect/hooks';
import { NovaPaymentsProvider, type PaymentsAdapter, PaymentWalletError } from '@tuwaio/nova-payments';
import { SatelliteStoreContext } from '@tuwaio/satellite-react';
import { type ReactNode, useMemo, useState } from 'react';
import { createStore } from 'zustand/vanilla';

/** A wallet connection as Satellite Connect keeps it. */
export interface SimulatedConnection {
  /** The account. */
  address: string;
  /** EVM chain ID, or the Solana cluster (`devnet`). */
  chainId: string | number;
  /** Connector type (`evm:metamask`, `solana:phantom`). */
  connectorType: string;
}

/** How the simulated wallet answers. */
export interface SimulatedWalletOptions {
  /** The balance of every token, in base units (default: plenty). */
  balance?: bigint;
  /** Balances of some tokens (`native` for the coin of the chain), over `balance`. */
  balances?: Record<string, bigint>;
  /** The buyer declines every wallet request. */
  decline?: boolean;
  /** The EVM wallet takes a paymaster (a smart wallet). */
  sponsor?: boolean;
}

/** The wallets "Connect" gives, by family: MetaMask on Ethereum (the wrong network for Base Sepolia), Phantom on devnet. */
const CONNECT_AS: Record<'evm' | 'solana', SimulatedConnection> = {
  evm: { address: '0x1111111111111111111111111111111111111111', chainId: 1, connectorType: 'evm:metamask' },
  solana: {
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    chainId: 'devnet',
    connectorType: 'solana:phantom',
  },
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wallets for the stories, without an extension: the active connection of a Satellite store, a Nova Connect whose
 * connect modal "connects" a wallet of the requested family after a moment, and chain adapters that answer like a
 * wallet (a delay, then a hash or a refusal) and switch the network in the store.
 */
export function SimulatedWallet({
  connection,
  options = {},
  children,
}: {
  connection?: SimulatedConnection;
  options?: SimulatedWalletOptions;
  children: ReactNode;
}) {
  const store = useMemo(() => createStore(() => ({ activeConnection: connection })), [connection]);
  const [connecting, setConnecting] = useState(false);
  const { balance = 1_000_000_000_000n, balances, decline = false, sponsor = false } = options;

  const adapters = useMemo<PaymentsAdapter[]>(() => {
    const answer = async (value: string) => {
      await wait(1500);
      if (decline) throw new PaymentWalletError('declined', 'The buyer declined');
      return value;
    };
    const balanceOf = async ({ token }: { token: string }) => balances?.[token] ?? balance;
    return [
      {
        family: 'eip155',
        getBalance: balanceOf,
        estimateFee: async () => ({ amount: 42_000_000_000_000n, decimals: 18, symbol: 'ETH' }),
        canSponsorCalls: async () => sponsor,
        switchChain: async (chainId) => {
          await wait(900);
          if (decline) throw new PaymentWalletError('declined', 'The buyer declined');
          const current = store.getState().activeConnection;
          if (current) store.setState({ activeConnection: { ...current, chainId: Number(chainId.split(':')[1]) } });
        },
        sendTransfer: () => answer(`0x${'ab'.repeat(32)}`),
        signTransferAuthorization: () => answer(`0x${'cd'.repeat(65)}`),
        sendSponsoredCalls: () => answer(`0x${'ef'.repeat(32)}`),
      },
      {
        family: 'solana',
        getBalance: balanceOf,
        estimateFee: async () => ({ amount: 5000n, decimals: 9, symbol: 'SOL' }),
        sendTransfer: () => answer('5'.repeat(88)),
      },
    ];
  }, [store, balance, balances, decline, sponsor]);

  const novaConnect = useMemo(
    () =>
      ({
        isConnectModalOpen: connecting,
        setIsConnectModalOpen: (open: boolean, request?: { adapter?: string }) => {
          setConnecting(open);
          if (!open) return;
          setTimeout(() => {
            store.setState({ activeConnection: CONNECT_AS[request?.adapter === 'solana' ? 'solana' : 'evm'] });
            setConnecting(false);
          }, 900);
        },
      }) as unknown as NovaConnectProviderType,
    [connecting, store],
  );

  return (
    <SatelliteStoreContext.Provider
      value={store as unknown as Parameters<typeof SatelliteStoreContext.Provider>[0]['value']}
    >
      <NovaConnectProviderContext.Provider value={novaConnect}>
        <NovaPaymentsProvider adapters={adapters}>{children}</NovaPaymentsProvider>
      </NovaConnectProviderContext.Provider>
    </SatelliteStoreContext.Provider>
  );
}
