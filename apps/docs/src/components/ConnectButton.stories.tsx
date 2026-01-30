import './../utils/customization/style.css';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NovaConnectProvider, NovaConnectProviderProps } from '@tuwaio/nova-connect';
import { ConnectButton, ConnectButtonProps } from '@tuwaio/nova-connect/components';
import { EVMConnectorsWatcher } from '@tuwaio/nova-connect/evm';
import { SatelliteConnectProvider } from '@tuwaio/nova-connect/satellite';
import { SolanaConnectorsWatcher } from '@tuwaio/nova-connect/solana';
import { createBoundedUseStore, createPulsarStore, Transaction } from '@tuwaio/pulsar-core';
import { pulsarEvmAdapter } from '@tuwaio/pulsar-evm';
import { pulsarSolanaAdapter } from '@tuwaio/pulsar-solana';
import { createDefaultTransports, impersonated, safeSdkOptions } from '@tuwaio/satellite-evm';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { SiweNextAuthProvider, useSiweAuth } from '@tuwaio/satellite-siwe-next-auth';
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

import { connect_button_customization } from '../utils/customization/connect_button';
import { nova_connect_provider_customization } from '../utils/customization/nova_connect_provider';

const appConfig = {
  appName: 'Stories TUWA Demo',
  appDescription: 'Stories TUWA Demo Connect Button',
  projectId: '9077e559e63e099f496b921a027d0f04',
  appLogoUrl: 'https://raw.githubusercontent.com/TuwaIO/workflows/refs/heads/main/preview/preview-logo.png',
  appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:6006/' : 'https://stories.tuwa.io/',
};

const solanaRPCUrls = {
  devnet: 'https://api.devnet.solana.com',
};

const appEVMChains = [
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

const wagmiConfig = createConfig({
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

const usePulsarStore = createBoundedUseStore(
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

interface ExtendedConnectButtonProps extends ConnectButtonProps {
  customizationOn?: boolean;
  autoConnect?: boolean;
  withBalance?: boolean;
  withChain?: boolean;
  withImpersonated?: boolean;
  alwaysShowSafe?: boolean;
}

function SatelliteConnectProviders({
  children,
  customizationOn,
  autoConnect,
  withBalance,
  withChain,
  withImpersonated,
  alwaysShowSafe,
}: {
  children: React.ReactNode;
} & Pick<
  ExtendedConnectButtonProps,
  'customizationOn' | 'autoConnect' | 'withBalance' | 'withChain' | 'withImpersonated' | 'alwaysShowSafe'
>) {
  const { signInWithSiwe, enabled, isRejected, isSignedIn } = useSiweAuth();
  const transactionPool = usePulsarStore((state) => state.transactionsPool);
  const getAdapter = usePulsarStore((state) => state.getAdapter);

  return (
    <>
      {customizationOn && <div className="custom-theme" style={{ display: 'none' }} />}
      <SatelliteConnectProvider
        adapter={[
          satelliteEVMAdapter(wagmiConfig, enabled ? signInWithSiwe : undefined),
          satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls }),
        ]}
        autoConnect={autoConnect}
      >
        <EVMConnectorsWatcher wagmiConfig={wagmiConfig} siwe={{ isSignedIn, isRejected, enabled }} />
        <SolanaConnectorsWatcher />
        <NovaConnectProvider
          appChains={appEVMChains}
          solanaRPCUrls={solanaRPCUrls}
          transactionPool={transactionPool}
          pulsarAdapter={getAdapter() as NovaConnectProviderProps['pulsarAdapter']}
          withImpersonated={withImpersonated}
          withBalance={withBalance}
          withChain={withChain}
          alwaysShowSafe={alwaysShowSafe}
          customization={customizationOn ? nova_connect_provider_customization : undefined}
        >
          {children}
        </NovaConnectProvider>
      </SatelliteConnectProvider>
    </>
  );
}

const queryClient = new QueryClient();

const meta: Meta<ExtendedConnectButtonProps> = {
  title: 'ConnectButton',
  component: ConnectButton,
  tags: ['autodocs'],
  argTypes: {
    customizationOn: {
      control: 'boolean',
      description: 'Turn on customization of provider and styles',
      table: { category: 'Customization' },
    },
    autoConnect: {
      control: 'boolean',
      description: 'Automatically try to connect on mount',
      table: { category: 'SatelliteConnectProvider' },
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
    alwaysShowSafe: {
      control: 'boolean',
      description: 'Whether to always show the safe connector',
      table: { category: 'NovaConnectProvider' },
    },
    className: {
      control: 'text',
      description: 'CSS classes to apply to the button',
      table: { category: 'ConnectButton' },
    },
  },
  args: {
    customizationOn: false,
    autoConnect: true,
    withBalance: true,
    withChain: true,
    withImpersonated: true,
    alwaysShowSafe: false,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Main wallet connection button. Handles connect/disconnect states automatically via NovaConnectProvider context.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const customizationOn = context.args.customizationOn;

      return (
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <SiweNextAuthProvider
              wagmiConfig={wagmiConfig}
              enabled={false}
              onSignOut={() => console.log('sign out')}
              onSignIn={(session) => console.log('sign in', session)}
            >
              <SatelliteConnectProviders
                customizationOn={customizationOn}
                autoConnect={context.args.autoConnect}
                withBalance={context.args.withBalance}
                withChain={context.args.withChain}
                withImpersonated={context.args.withImpersonated}
                alwaysShowSafe={context.args.alwaysShowSafe}
              >
                <Story
                  args={{
                    ...context.args,
                    customization: customizationOn ? connect_button_customization : undefined,
                  }}
                />
              </SatelliteConnectProviders>
            </SiweNextAuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<ExtendedConnectButtonProps>;

/**
 * Default state - shows "Connect Wallet" when disconnected.
 * Requires NovaConnectProvider context to function properly.
 */
export const Default: Story = {};

export const WithCustomCustomization: Story = {
  args: {
    customizationOn: true,
  },
};
