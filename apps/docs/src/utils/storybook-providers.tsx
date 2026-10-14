import type { Meta, StoryContext } from '@storybook/react-vite';
import { NovaConnectProvider, NovaConnectProviderProps } from '@tuwaio/nova-connect';
import { LegalConfig, NovaConnectProviderCustomization } from '@tuwaio/nova-connect';
import { ConnectButtonProps } from '@tuwaio/nova-connect/components';
import { EVMConnectorsWatcher } from '@tuwaio/nova-connect/evm';
import { SatelliteConnectProvider, useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { SolanaConnectorsWatcher } from '@tuwaio/nova-connect/solana';
import { createBoundedUseStore, createPulsarStore, Transaction } from '@tuwaio/pulsar-core';
import { pulsarEvmAdapter } from '@tuwaio/pulsar-evm';
import { pulsarSolanaAdapter } from '@tuwaio/pulsar-solana';
import { createDefaultTransports, impersonated, safeSdkOptions } from '@tuwaio/satellite-evm';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { satelliteSolanaAdapter } from '@tuwaio/satellite-solana';
import { useSiwxSession } from '@tuwaio/siwx-react';
import { safe } from '@wagmi/connectors';
import { createConfig, injected } from '@wagmi/core';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  bsc,
  Chain,
  mainnet,
  optimism,
  polygon,
  polygonZkEvm,
  sepolia,
} from 'viem/chains';

import { connectedWalletTransactionsMock } from './connectedWalletTransactionsMock';

// ============================================================================
// App Configuration
// ============================================================================

export const solanaRPCUrls = {
  devnet: 'https://api.devnet.solana.com',
};

export const appEVMChains = [
  mainnet,
  sepolia,
  polygon,
  polygonZkEvm,
  arbitrum,
  arbitrumSepolia,
  optimism,
  avalanche,
  avalancheFuji,
  base,
  bsc,
] as readonly [Chain, ...Chain[]];

// ============================================================================
// Wagmi Configuration
// ============================================================================

export const wagmiConfig = createConfig({
  connectors: [
    injected(),
    safe({
      ...safeSdkOptions,
    }),
    impersonated({}),
  ],
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
  syncConnectedChain: true,
  // Satellite Connect remembers the last wallet; wagmi keeps nothing in the browser (Cookie Policy)
  storage: null,
});

// Created once: `SatelliteConnectProvider` passes a new `adapter` value to its store on every change
const satelliteAdapters = [
  satelliteEVMAdapter(wagmiConfig, appEVMChains),
  satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls }),
];

// ============================================================================
// Pulsar Store
// ============================================================================

export enum TxType {
  initialize = 'initialize',
}

type InitializeTx = Transaction & {
  type: TxType.initialize;
  payload: {
    contractAddress: string;
  };
};

export type TransactionUnion = InitializeTx;

const storageName = 'stories-transactions-tracking-storage';

export const usePulsarStore = createBoundedUseStore(
  createPulsarStore<TransactionUnion>({
    name: storageName,
    adapter: [
      pulsarEvmAdapter(wagmiConfig, appEVMChains),
      pulsarSolanaAdapter({
        rpcUrls: solanaRPCUrls,
      }),
    ],
  }),
);

// ============================================================================
// Shared Props Interface
// ============================================================================

export interface ExtendedConnectButtonProps extends ConnectButtonProps {
  withBalance?: boolean;
  withChain?: boolean;
  withImpersonated?: boolean;
  customConnectorGroups?: NovaConnectProviderProps['customConnectorGroups'];
  popularConnectors?: NovaConnectProviderProps['popularConnectors'];
  legal?: LegalConfig;
}

// ============================================================================
// Shared Providers Component
// ============================================================================

interface SatelliteConnectProvidersProps {
  children: React.ReactNode;
  withBalance?: boolean;
  withChain?: boolean;
  withImpersonated?: boolean;
  customization?: NovaConnectProviderCustomization;
  customConnectorGroups?: NovaConnectProviderProps['customConnectorGroups'];
  popularConnectors?: NovaConnectProviderProps['popularConnectors'];
  legal?: LegalConfig;
}

function SatelliteConnectProvidersInner({
  children,
  withBalance,
  withChain,
  withImpersonated,
  customization,
  customConnectorGroups,
  legal,
  popularConnectors,
}: SatelliteConnectProvidersProps) {
  const activeConnection = useSatelliteConnectStore((state) => state.activeConnection);
  const getAdapter = usePulsarStore((state) => state.getAdapter);
  const siwxSession = useSiwxSession();

  return (
    <>
      <EVMConnectorsWatcher wagmiConfig={wagmiConfig} siwx={siwxSession} />
      <SolanaConnectorsWatcher siwx={siwxSession} />

      <NovaConnectProvider
        appChains={appEVMChains}
        solanaRPCUrls={solanaRPCUrls}
        // @ts-expect-error: it's mock of transaction pool, types are not compatible by 100%
        transactionPool={connectedWalletTransactionsMock(activeConnection?.address ?? '')}
        pulsarAdapter={getAdapter() as NovaConnectProviderProps['pulsarAdapter']}
        withImpersonated={withImpersonated}
        withBalance={withBalance}
        withChain={withChain}
        customization={customization}
        customConnectorGroups={customConnectorGroups}
        popularConnectors={popularConnectors}
        legal={legal}
      >
        {children}
      </NovaConnectProvider>
    </>
  );
}

export function StorybookProviders({
  children,
  withBalance,
  withChain,
  withImpersonated,
  customConnectorGroups,
  popularConnectors,
  legal,
  customization,
}: SatelliteConnectProvidersProps) {
  // No WagmiProvider: EVMConnectorsWatcher hydrates the wagmi config, so the installed (EIP-6963) wallets appear
  return (
    <SatelliteConnectProvider adapter={satelliteAdapters} autoConnect={false}>
      {customization && <div className="custom-theme" style={{ display: 'none' }} />}
      <SatelliteConnectProvidersInner
        withBalance={withBalance}
        withChain={withChain}
        withImpersonated={withImpersonated}
        customization={customization}
        customConnectorGroups={customConnectorGroups}
        popularConnectors={popularConnectors}
        legal={legal}
      >
        {children}
      </SatelliteConnectProvidersInner>
    </SatelliteConnectProvider>
  );
}

// ============================================================================
// Shared Meta Configuration
// ============================================================================

export const sharedArgTypes: Meta<ExtendedConnectButtonProps>['argTypes'] = {
  customConnectorGroups: {
    control: 'object',
    description: 'Custom connector groups to show in the connect modal (e.g. { "Custom Group": ["Metamask"] })',
    table: { category: 'NovaConnectProvider' },
  },
  popularConnectors: {
    control: 'object',
    description: 'Popular connectors to show in the connect modal (e.g. ["Wallet Connect"])',
    table: { category: 'NovaConnectProvider' },
  },
  withBalance: {
    control: 'boolean',
    description: 'Whether balance should be shown',
    table: { category: 'NovaConnectProvider' },
  },
  withChain: {
    control: 'boolean',
    description: 'Whether chain selector should be shown',
    table: { category: 'NovaConnectProvider' },
  },
  withImpersonated: {
    control: 'boolean',
    description: 'Whether impersonated wallets are enabled',
    table: { category: 'NovaConnectProvider' },
  },
  legal: {
    control: 'object',
    description: `Legal links for connect modal`,
    table: { category: 'NovaConnectProvider', type: { summary: '{ termsUrl?: string; privacyUrl?: string }' } },
  },
  className: {
    control: 'text',
    description: 'CSS classes to apply to the button',
    table: { category: 'ConnectButton' },
  },
};

export const sharedArgs: Meta<ExtendedConnectButtonProps>['args'] = {
  customConnectorGroups: {},
  popularConnectors: undefined,
  legal: {
    termsUrl: 'https://example.com/terms',
    privacyUrl: 'https://example.com/privacy',
  },
  withBalance: true,
  withChain: true,
  withImpersonated: true,
};

export const sharedParameters: Meta<ExtendedConnectButtonProps>['parameters'] = {
  layout: 'centered',
  docs: {
    description: {
      component:
        'Main wallet connection button. Handles connect/disconnect states automatically via NovaConnectProvider context.',
    },
  },
};

// ============================================================================
// Decorator Factory
// ============================================================================

export function createStorybookDecorator(customization?: NovaConnectProviderCustomization) {
  return (Story: React.ComponentType, context: StoryContext<ExtendedConnectButtonProps>) => (
    <StorybookProviders
      withBalance={context.args.withBalance}
      withChain={context.args.withChain}
      withImpersonated={context.args.withImpersonated}
      customConnectorGroups={context.args.customConnectorGroups}
      popularConnectors={context.args.popularConnectors}
      legal={context.args.legal}
      customization={customization}
    >
      <Story />
    </StorybookProviders>
  );
}
