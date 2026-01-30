import { createBoundedUseStore, createPulsarStore, Transaction } from '@tuwaio/pulsar-core';
import { pulsarEvmAdapter } from '@tuwaio/pulsar-evm';
import { createDefaultTransports } from '@tuwaio/satellite-evm';
import { injected } from '@wagmi/connectors';
import { createConfig } from '@wagmi/core';
import type { Chain } from 'viem/chains';
import { mainnet, sepolia } from 'viem/chains';

// Wagmi Config
export const appEVMChains = [mainnet, sepolia] as readonly [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  connectors: [injected()],
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
});

// Pulsar Store
const storageName = 'sb-transactions-tracking-storage';

export enum TxType {
  swap = 'swap',
  transfer = 'transfer',
}

export type TransactionUnion = Transaction & {
  type: TxType;
  payload: any;
};

export const usePulsarStore = createBoundedUseStore(
  createPulsarStore<TransactionUnion>({
    name: storageName,
    adapter: pulsarEvmAdapter(wagmiConfig, appEVMChains),
    maxTransactions: 50,
  }),
);
