# TUWA Nova Transactions

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-transactions.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/main.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The official React UI component library for the Pulsar transaction engine. Provides accessible modals, toasts, and history widgets to visualize transaction states.

## Architecture

This package provides the **View Layer** for TUWA's transaction tracking ecosystem. It works in tandem with our headless state management libraries:

-   **`@tuwaio/pulsar-core`**: The core state management engine.
-   **`@tuwaio/nova-transactions` (this package)**: The React components that consume state from `pulsar-core` and render the UI.

You must set up both the Pulsar engine and this UI package to achieve the full functionality.

## Core Features

-   **🧩 UI Components:** A suite of pre-built, accessible components including `TransactionModal`, `TransactionToasts`, and `TransactionHistory`.
-   **🔌 Simple Integration:** The UI automatically reacts to transactions tracked by `pulsar-core`.
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

To use this library, you need to set up the `NovaProvider` from this package alongside the Pulsar initialization logic.

Here is a complete example of a `providers.tsx` file that configures both systems:

```tsx
// app/providers.tsx or similar
'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NovaProvider, TransactionToasts } from '@tuwaio/nova-transactions';
import { ToastContainer } from 'react-toastify';

// Import the TransactionInitializer component you created (see pulsar-react docs)
import { TransactionInitializer } from '../components/TransactionInitializer';
// Import required CSS
import '@tuwaio/nova-core/dist/index.css';
import '@tuwaio/nova-transactions/dist/index.css';

// Your Wagmi Config
import { wagmiConfig } from './wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* NovaProvider is the parent for all UI-related context and components */}
        <NovaProvider>
          {/* TransactionInitializer handles the logic of rehydrating the Pulsar store */}
          <TransactionInitializer />
          
          {children}

          {/* Global UI components from this package */}
          <TransactionToasts />
          <ToastContainer />
        </NovaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Usage Example

Once the providers are set up, you use your custom `usePulsarStore` hook to track transactions. The components from this library will automatically appear and update.

```tsx
// components/IncrementButton.tsx
'use client';

import { getAccount } from '@wagmi/core';

// Import your custom hook, created as shown in the pulsar-react docs
import { usePulsarStore } from '../hooks/usePulsarStore';
import { config } from '../configs/wagmiConfig';
import { abi } from './my-nft-abi';

const CONTRACT_ADDRESS = '0x...';

export function IncrementButton() {
  const activeWallet = getAccount(config);
  const { handleTransaction } = usePulsarStore();

  const handleIncrement = async () => {
    await handleTransaction({
      actionFunction: txActions.increment,
      params: {
        type: TxType.increment,
        adapter: TransactionAdapter.EVM,
        from: activeWallet.address ?? zeroAddress,
        walletType: activeWallet.connector?.type ?? '',
        desiredChainID: sepolia.id,
        actionKey: TxAction.increment,
        title: ['Incrementing', 'Incremented', 'Error when increment', 'Increment tx replaced'],
        description: [
          `Value after incrementing ${currentCount + 1}`,
          `Success. Current value is ${currentCount + 1}`,
          'Something went wrong when increment.',
          'Transaction replaced. Please take a look details in your wallet.',
        ],
        payload: {
          value: currentCount,
        },
        withTrackedModal: true,
      },
    });
  }

  return <button onClick={handleIncrement}>Increment</button>;
}
```

## Internationalization (i18n)

You can easily override the default English text by passing a `locale` object to the `NovaProvider`. Here is an example with German translations:

```tsx
<NovaProvider
  locale={{
    transaction: {
      title: 'Transaktion',
      pending: 'Ausstehend...',
      success: 'Erfolgreich!',
      failed: 'Fehlgeschlagen!',
    },
    // ... other keys
  }}
>
  {/* ... */}
</NovaProvider>
```

## Contributing

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## License

This project is licensed under the **Apache-2.0 License**.