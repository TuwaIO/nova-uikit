import type { Meta, StoryContext } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { SiweNextAuthProvider } from '@tuwaio/satellite-siwe-next-auth';
import { satelliteSolanaAdapter } from '@tuwaio/satellite-solana';
import { baseAccount, safe, walletConnect } from '@wagmi/connectors';
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
import { WagmiProvider } from 'wagmi';

import { connectedWalletTransactionsMock } from './connectedWalletTransactionsMock';

// ============================================================================
// App Configuration
// ============================================================================

export const appConfig = {
  appName: 'Stories TUWA Demo',
  appDescription: 'Stories TUWA Demo Connect Button',
  projectId: '90f7d88db0bb324b93befd60e35107a4',
  appLogoUrl: 'https://raw.githubusercontent.com/TuwaIO/workflows/refs/heads/main/preview/preview-logo.png',
  appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:6006/' : 'https://stories.tuwa.io/',
};

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
    baseAccount({
      appName: appConfig.appName,
      appLogoUrl: appConfig.appLogoUrl,
    }),
    safe({
      ...safeSdkOptions,
    }),
    walletConnect({
      projectId: appConfig.projectId,
      metadata: {
        name: appConfig.appName,
        description: appConfig.appDescription,
        url: appConfig.appUrl,
        icons: [appConfig.appLogoUrl],
      },
    }),
    impersonated({}),
  ],
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
  syncConnectedChain: true,
});

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

  return (
    <>
      <EVMConnectorsWatcher wagmiConfig={wagmiConfig} />
      <SolanaConnectorsWatcher />

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

const queryClient = new QueryClient();

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
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SiweNextAuthProvider
          wagmiConfig={wagmiConfig}
          enabled={false}
          onSignOut={() => console.log('sign out')}
          onSignIn={(session) => console.log('sign in', session)}
        >
          <SatelliteConnectProvider
            adapter={[satelliteEVMAdapter(wagmiConfig), satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls })]}
            autoConnect={false}
          >
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
        </SiweNextAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
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
