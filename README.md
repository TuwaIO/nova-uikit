# TUWA Nova UI Kit

[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)
[![Contributors](https://img.shields.io/github/contributors/TuwaIO/nova-uikit)](https://github.com/TuwaIO/nova-uikit/graphs/contributors)

<p align="center">
  <img src="https://raw.githubusercontent.com/TuwaIO/workflows/refs/heads/main/preview/repos/nova_uikit.png" alt="Nova UI Kit" width="450" style="border-radius: 12px; margin: 24px auto;" />
</p>

TUWA Nova UI Kit is the official UI framework and visual component library of the TUWA Ecosystem. It provides the visual view layer that integrates with **[Satellite Connect](https://github.com/TuwaIO/satellite-connect)** (for wallet connection states) and **[Pulsar Engine](https://github.com/TuwaIO/pulsar-core)** (for transaction tracking lifecycles), transforming headless state managers into beautiful, accessible, and high-performance React user experiences.

Nova enforces a clear separation of concerns, decoupling UI styling and component structures from underlying blockchain communication logic. It resides at the top of the frontend integration stack, representing **UI Core (L6)** and **UI Components (L7)** of the TUWA Ecosystem.

---

## 🏛️ Ecosystem Architecture & Tiers

The Nova monorepo splits styling tokens, wallet connectivity widgets, and transaction tracking views into isolated packages:

### UI Core (L6)

- **`@tuwaio/nova-core`**: The bedrock of the design system. Contains core styling primitives, CSS custom properties, shared utility hooks (like clipboard copy and media queries), and the foundational `cn` classname merger. It is completely independent of Web3 logic.

### UI Components (L7)

- **`@tuwaio/nova-connect`**: React UI components, modals, and buttons for multi-chain wallet connection flows. Interacts directly with `@tuwaio/satellite-react` to display connection states.
- **`@tuwaio/nova-transactions`**: React UI components for transaction progress tracking. Interacts with `@tuwaio/pulsar-react` to present status feeds, modal popups, and toast notifications.

---

## 🔧 Monorepo Structure

```
nova-uikit/
├── apps/
│   └── docs/                   # Documentation portal & Storybook instance
├── packages/
│   ├── nova-core/              # UI Core (L6): CSS variables, utilities, base hooks
│   ├── nova-connect/           # UI Components (L7): Wallet connection modals & buttons
│   └── nova-transactions/      # UI Components (L7): Transaction toasts & tracking modals
```

---

## 💾 Installation

Nova is modular. Install the UI Core foundation and the components you need, along with their respective logic engines:

```bash
# L6 UI Core
pnpm add @tuwaio/nova-core

# L7 Wallet Connection UI (requires Satellite Connect)
pnpm add @tuwaio/nova-connect @tuwaio/satellite-core @tuwaio/satellite-react

# L7 Transaction Progress UI (requires Pulsar Engine)
pnpm add @tuwaio/nova-transactions @tuwaio/pulsar-core @tuwaio/pulsar-react
```

---

## 🚀 Quick Start Example

### Global Providers Wrapper

Wrap your application in the correct order to bridge headless state managers to the Nova UI layer:

```tsx
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { SatelliteConnectProvider, useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { EVMConnectorsWatcher } from '@tuwaio/nova-connect/evm';
import { NovaConnectProvider } from '@tuwaio/nova-connect';
import { NovaTransactionsProvider } from '@tuwaio/nova-transactions/providers';
import { getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import { useInitializeTransactionsPool } from '@tuwaio/pulsar-react';

import { wagmiConfig, appEVMChains } from './config/appConfig';
import { usePulsarStore } from './hooks/usePulsarStore';

const queryClient = new QueryClient();

// Connects headless Pulsar state to the Nova Transactions visual nodes
function NovaTransactionsWrapper() {
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
      connectedAdapterType={getAdapterFromConnectorType(activeConnection?.connectorType ?? 'evm:')}
      adapter={getAdapter()}
    />
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SatelliteConnectProvider adapter={satelliteEVMAdapter(wagmiConfig)} autoConnect={true}>
          <EVMConnectorsWatcher wagmiConfig={wagmiConfig} />

          <NovaConnectProvider appChains={appEVMChains} withBalance withChain>
            <NovaTransactionsWrapper />
            {children}
          </NovaConnectProvider>
        </SatelliteConnectProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## 🤝 Contribution & Auditing

Please review our ecosystem **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](./LICENSE) file for details.
