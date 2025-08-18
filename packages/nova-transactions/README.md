# TUWA Nova Transactions

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-transactions.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/main.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The official React UI component library for the Pulsar transaction engine. Provides accessible modals, toasts, and history widgets to visualize transaction states.

## Architecture

This package provides the **View Layer** for TUWA's transaction tracking ecosystem. It works in tandem with our headless state management libraries:

-   **`@tuwaio/pulsar-core`**: The core state management engine.
-   **`@tuwaio/nova-transactions` (this package)**: The React components that consume state from `pulsar-core` and render the UI.

You must use both packages together to achieve the full functionality.

## Core Features

-   **🧩 UI Components:** A suite of pre-built, accessible components including `TransactionModal`, `TransactionToasts`, and `TransactionHistory`.
-   **🔌 Simple Integration:** Just wrap your app in our providers, and the UI will automatically react to transactions tracked by `pulsar-core`.
-   **🌐 Internationalization (i18n):** Built-in support for multiple languages and easy overrides for all text content.
-   **🎨 Highly Customizable:** Styled with `@tuwaio/nova-core` to be easily themed using Tailwind CSS.

## Installation

1.  Install the required TUWA packages:

    ```bash
    pnpm add @tuwaio/nova-transactions @tuwaio/nova-core @tuwaio/pulsar-core
    ```

2.  This package relies on several peer dependencies. Install them if you haven't already:

    ```bash
    pnpm add react react-dom wagmi viem react-toastify framer-motion @radix-ui/react-dialog
    ```

## Getting Started

To get started, you need to set up the providers from both `pulsar-core` and `nova-transactions`.

```tsx
// app/providers.tsx or similar
'use client';

import { WagmiProvider } from 'wagmi';
import { PulsarProvider } from '@tuwaio/pulsar-core';
import { NovaProvider, TransactionToasts } from '@tuwaio/nova-transactions';
import { ToastContainer } from 'react-toastify';

// Import required CSS
import 'react-toastify/dist/ReactToastify.css';
import '@tuwaio/nova-core/dist/index.css';

// Your Wagmi Config
import { wagmiConfig } from './wagmi';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      {/* State management from Pulsar */}
      <PulsarProvider>
        {/* UI layer from Nova */}
        <NovaProvider>
          {children}

          {/* Global UI components */}
          <TransactionToasts />
          <ToastContainer />
        </NovaProvider>
      </PulsarProvider>
    </WagmiProvider>
  );
}
```

## Usage Example

Once the providers are set up, you use hooks from `@tuwaio/pulsar-core` to initiate and track transactions. The components from this library (`nova-transactions`) will automatically appear and update.

```tsx
// components/MintNFTButton.tsx
'use client';

// Logic and state management hooks are imported from pulsar-core
import { usePulsar } from '@tuwaio/pulsar-core'; 
import { useWriteContract } from 'wagmi';
import { abi } from './my-nft-abi';

const NFT_CONTRACT_ADDRESS = '0x...';

export function MintNFTButton() {
  const { writeContract } = useWriteContract();
  const { track } = usePulsar(); // The main tracking function from the engine

  const handleMint = () => {
    // track() comes from pulsar-core and handles all the state logic.
    // Nova's UI components listen to these state changes and appear automatically.
    track({
      write: () => writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi,
        functionName: 'safeMint',
        args: [1],
      }),
      metadata: {
        title: 'Mint Your Awesome NFT',
        description: 'This is a transaction to mint a new NFT.',
      },
    });
  };

  return <button onClick={handleMint}>Mint NFT</button>;
}
```

## Internationalization (i18n)

You can easily override the default English text by passing a `locale` object to the `NovaProvider`.

```tsx
<NovaProvider
  locale={{
    transaction: {
      title: 'Транзакція',
      pending: 'Очікування...',
      success: 'Успішно!',
      failed: 'Помилка!',
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