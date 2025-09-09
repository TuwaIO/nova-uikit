# TUWA Nova Transactions

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-transactions.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The official React UI component library for the Pulsar transaction engine. It provides a suite of pre-built, accessible, and highly customizable modals, toasts, and history widgets to visualize the entire transaction lifecycle.

---

## 🏛️ Architecture

This package provides the **View Layer** for TUWA's transaction tracking ecosystem. It works by consuming the state from your headless Pulsar store and rendering the appropriate UI.

You must connect your Pulsar store's state and actions to the `<NovaProvider />` component, which acts as a self-contained UI manager that renders modals and toasts via React Portals.

---

## ✨ Core Features

-   **🧩 Pre-built UI Suite:** A set of accessible components including `TrackingTxModal`, `WalletInfoModal`, and `ToastContainer`, all managed internally by the `NovaProvider`.
-   **🔌 Plug-and-Play Integration:** Once connected to your Pulsar store, the UI automatically reacts to all transaction state changes.
-   **🌐 Internationalization (i18n):** Built-in support for multiple languages with easy overrides for all text content via the `labels` prop.
-   **🎨 Highly Customizable:** Styled with `@tuwaio/nova-core` to be easily themed using CSS variables. Almost every sub-component can be replaced with your own implementation via the `customization` prop.

---

## 💾 Installation

First, install all required packages for the Pulsar & Nova stack.

Next, you need to install a few peer dependencies that `nova-transactions` relies on for UI rendering.

```bash
# Using pnpm
pnpm add react-toastify framer-motion @radix-ui/react-dialog @heroicons/react @bgd-labs/react-web3-icons @tuwaio/pulsar-core @tuwaio/nova-core

# Using npm
npm install react-toastify framer-motion @radix-ui/react-dialog @heroicons/react @bgd-labs/react-web3-icons @tuwaio/pulsar-core @tuwaio/nova-core

# Using yarn
yarn add react-toastify framer-motion @radix-ui/react-dialog @heroicons/react @bgd-labs/react-web3-icons @tuwaio/pulsar-core @tuwaio/nova-core
````

-----

## 🚀 Getting Started

To use this library, you must render the `<NovaProvider />` component at a high level in your application and pass the state and actions from your Pulsar store to it as props.

Here is a complete example of a `Providers.tsx` file that configures the entire system.

```tsx
// src/providers/index.tsx
'use client';

import {usePulsar} from '@/store/pulsar';
import {NovaProvider} from '@tuwaio/nova-transactions';
import {useAccount} from 'wagmi';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {WagmiProvider} from 'wagmi';
import {PulsarInitializer} from '@/components/PulsarInitializer';
import {wagmiConfig, chains, pulsarStore} from '@/configs'; // Your app's configs
import {TransactionAdapter} from '@tuwaio/pulsar-core';
import {evmAdapter} from '@tuwaio/pulsar-evm';

// Import required CSS
import '@tuwaio/nova-core/dist/index.css';
import '@tuwaio/nova-transactions/dist/index.css';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

export function Providers({children}: { children: React.ReactNode }) {
  // 1. Get live state and actions from your Pulsar store hook
  const {
    transactionsPool,
    initialTx,
    handleTransaction,
    closeTxTrackedModal,
    actions,
  } = usePulsar();

  // 2. Get live wallet data from wagmi
  const {address, chain} = useAccount();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* PulsarInitializer handles rehydrating the store on page load */}
        <PulsarInitializer/>

        {/* Your application's pages */}
        {children}

        {/* 3. Render NovaProvider as a self-contained UI manager */}
        <NovaProvider
          // Pass all required state and actions from Pulsar as props
          transactionsPool={transactionsPool}
          initialTx={initialTx}
          handleTransaction={handleTransaction}
          closeTxTrackedModal={closeTxTrackedModal}
          actions={actions}

          // Pass live wallet and adapter data
          connectedWalletAddress={address}
          connectedAdapterType={chain?.id ? TransactionAdapter.EVM : undefined} // Example for EVM

          // Pass static configuration
          adapters={[evmAdapter(wagmiConfig, chains)]}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Customization

You can easily override the default English text by passing a `labels` prop, or replace entire components using the `customization` prop.

```tsx
<NovaProvider
  // 1. Override text labels
  labels={{
    statuses: {
      pending: 'In Bearbeitung...',
      success: 'Erfolgreich!',
      failed: 'Fehlgeschlagen!',
    },
    // ... other keys
  }}

  // 2. Override a component (e.g., the status badge)
  customization={{
    components: {
      statusBadge: ({ tx }) => <MyCustomBadge status={tx.status} />,
    }
  }}

  // ... other required props
/>
```

-----

## 🤝 Contributing

Contributions are welcome\! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.