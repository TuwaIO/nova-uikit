import '../src/styles/app.css';

import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NovaConnectProvider } from '@tuwaio/nova-connect';
import { EVMConnectorsWatcher } from '@tuwaio/nova-connect/evm';
import { defaultLabels as connectLabels } from '@tuwaio/nova-connect/i18n';
import { SatelliteConnectProvider, useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { defaultLabels as transactionsLabels } from '@tuwaio/nova-transactions';
import { NovaTransactionsProvider } from '@tuwaio/nova-transactions/providers';
import { NovaTransactionsLabelsProvider } from '@tuwaio/nova-transactions/providers';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { useInitializeTransactionsPool } from '@tuwaio/pulsar-react';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { WagmiProvider } from 'wagmi';

import { appEVMChains, usePulsarStore, wagmiConfig } from './config/wagmi-pulsar';

const queryClient = new QueryClient();

// Bridge component to connect Headless Store (Pulsar) to UI (Nova)
function NovaTransactionsProviderWrapper() {
  const getAdapter = usePulsarStore((state) => state.getAdapter);
  const initialTx = usePulsarStore((state) => state.initialTx);
  const closeTxTrackedModal = usePulsarStore((state) => state.closeTxTrackedModal);
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);
  const initializeTransactionsPool = usePulsarStore((state) => state.initializeTransactionsPool);

  const activeConnection = useSatelliteConnectStore((state) => state.activeConnection);

  useInitializeTransactionsPool({ initializeTransactionsPool });

  return (
    <NovaTransactionsProvider
      transactionsPool={transactionsPool}
      initialTx={initialTx}
      closeTxTrackedModal={closeTxTrackedModal}
      executeTxAction={executeTxAction}
      connectedWalletAddress={activeConnection?.isConnected ? activeConnection.address : undefined}
      connectedAdapterType={OrbitAdapter.EVM}
      adapter={getAdapter()}
    />
  );
}

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Introduction', 'Theming', 'Nova Core', 'Nova Connect', 'Nova Transactions', 'API_Reference'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    globalTypes: {
      theme: {
        description: 'Global theme for components',
        defaultValue: 'light',
        toolbar: {
          title: 'Theme',
          icon: 'paintbrush',
          items: ['light', 'dark'],
          dynamicTitle: true,
        },
      },
    },
    status: {
      statuses: {
        stable: {
          background: '#10b981',
          color: '#ffffff',
          description: 'Production ready',
        },
        beta: {
          background: '#f59e0b',
          color: '#ffffff',
          description: 'Beta version',
        },
        deprecated: {
          background: '#ef4444',
          color: '#ffffff',
          description: 'Will be removed',
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <SatelliteConnectProvider adapter={satelliteEVMAdapter(wagmiConfig)} autoConnect={true}>
            <EVMConnectorsWatcher wagmiConfig={wagmiConfig} />
            <NovaConnectProvider labels={connectLabels} appChains={appEVMChains}>
              <NovaTransactionsLabelsProvider labels={transactionsLabels}>
                <NovaTransactionsProviderWrapper />
                <Story />
              </NovaTransactionsLabelsProvider>
            </NovaConnectProvider>
          </SatelliteConnectProvider>
        </QueryClientProvider>
      </WagmiProvider>
    ),
  ],
};

export default preview;
