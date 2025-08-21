# TUWA Nova Transactions

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-transactions.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The official React UI component library for the Pulsar transaction engine. Provides accessible modals, toasts, and history widgets to visualize transaction states.

## Architecture

This package provides the **View Layer** for TUWA's transaction tracking ecosystem. It works by consuming the state from your headless Pulsar store and rendering the appropriate UI.

You must connect your Pulsar store's state and actions to the `<NovaProvider />` component via props.

## Core Features

-   **🧩 UI Components:** A suite of pre-built, accessible components including `TransactionModal`, `ToastContainer`, and `WalletInfoModal`, all managed internally.
-   **🔌 Simple Integration:** Once connected to your Pulsar store, the UI automatically reacts to transaction state changes.
-   **🌐 Internationalization (i18n):** Built-in support for multiple languages and easy overrides for all text content.
-   **🎨 Highly Customizable:** Styled with `@tuwaio/nova-core` to be easily themed using Tailwind CSS.

## Installation

1.  Install all the required TUWA packages:

    ```bash
    pnpm add @tuwaio/nova-transactions @tuwaio/nova-core @tuwaio/pulsar-core @tuwaio/pulsar-evm @tuwaio/pulsar-react
    ```

2.  This package relies on several peer dependencies. Install them if you haven't already:

    ```bash
    pnpm add react react-dom wagmi viem react-toastify framer-motion @radix-ui/react-dialog
    ```

## Getting Started

To use this library, you must render the `<NovaProvider />` component at the top level of your application and pass the state and actions from your Pulsar store to it as props.

Here is a complete example of a `providers.tsx` file that configures both systems:

```tsx
// app/providers.tsx or similar
'use client';

import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NovaProvider } from '@tuwaio/nova-transactions';

// Import your custom Pulsar hook and the TransactionInitializer component
import { usePulsarStore } from '../hooks/usePulsarStore';
import { TransactionInitializer } from '../components/TransactionInitializer';

// Import required CSS
import '@tuwaio/nova-core/dist/index.css';
import '@tuwaio/nova-transactions/dist/index.css';

// Your Wagmi Config
import { wagmiConfig, appChains } from './wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // 1. Get state and actions from your Pulsar store hook
  const { transactionsPool, initialTx, handleTransaction, closeTxTrackedModal } = usePulsarStore();
  
  // 2. Get live wallet data from wagmi
  const { address, chain } = useAccount();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* TransactionInitializer handles rehydrating the Pulsar store */}
        <TransactionInitializer />
          
        {/* Your application's pages */}
        {children}

        {/* 3. Render NovaProvider as a self-contained UI manager */}
        <NovaProvider
          // Pass all required state and actions from Pulsar as props
          transactionsPool={transactionsPool}
          initialTx={initialTx}
          handleTransaction={handleTransaction}
          closeTxTrackedModal={closeTxTrackedModal}
          
          // Pass live wallet and chain data
          walletAddress={address}
          chain={chain}
          
          // Pass static configuration
          appChains={appChains}
          config={wagmiConfig}
          // actions={...} // Pass retry actions if you have them
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Usage Example

Once the `NovaProvider` is set up correctly, you can use your custom `usePulsarStore` hook anywhere to track transactions. The UI components rendered by `NovaProvider` will automatically appear and update.

```tsx
// components/IncrementButton.tsx
'use client';

// Import your custom hook, created as shown in the pulsar-react docs
import { usePulsarStore } from '../hooks/usePulsarStore';
// ... other imports

export function IncrementButton() {
  const { handleTransaction } = usePulsarStore();

  const handleIncrement = async () => {
    // Calling handleTransaction updates the Pulsar store's state.
    // NovaProvider receives this new state via props and renders the appropriate UI.
    await handleTransaction({
      actionFunction: () => { /* ... your contract write call ... */ },
      params: { /* ... your transaction metadata ... */ }
    });
  };

  return <button onClick={handleIncrement}>Increment</button>;
}
```

## Internationalization (i18n)

You can easily override the default English text by passing a `labels` prop to the `NovaProvider`. Here is an example with German translations:

```tsx
<NovaProvider
  labels={{
    transaction: {
      title: 'Transaktion',
      pending: 'Ausstehend...',
      success: 'Erfolgreich!',
      failed: 'Fehlgeschlagen!',
    },
    // ... other keys
  }}
  // ... other required props
/>
```

## Contributing

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## License

This project is licensed under the **Apache-2.0 License**.