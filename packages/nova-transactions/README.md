# TUWA Nova Transactions

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-transactions.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The official React UI component library for the Pulsar transaction engine. It provides a suite of pre-built, accessible, and highly customizable modals, toasts, and history widgets to visualize the entire transaction lifecycle.

---

## 🏛️ Architecture

This package provides the **View Layer** for TUWA's transaction tracking ecosystem. It works by consuming the state from your headless Pulsar store and rendering the appropriate UI. You must connect your Pulsar store's state and actions to the `<NovaProvider />` component, which acts as a self-contained UI manager that renders modals and toasts.

---

## ✨ Core Features

-   **🧩 Pre-built UI Suite:** A set of accessible components including `TrackingTxModal`, `TransactionsInfoModal`, and `ToastTransaction`, all managed internally by the `NovaProvider`.
-   **🔌 Plug-and-Play Integration:** Once connected to your Pulsar store, the UI automatically reacts to all transaction state changes.
-   **🌐 Internationalization (i18n):** Built-in support for multiple languages with easy overrides for all text content via the `labels` prop.
-   **🎨 Highly Customizable:** Styled with `@tuwaio/nova-core` to be easily themed using CSS variables. Almost every sub-component can be replaced with your own implementation via the `customization` prop.

---

## 💾 Installation

First, install all required packages for the Pulsar & Nova stack.

Next, you need to install a peer dependencies that `nova-transactions` relies on for UI rendering.

```bash
# Using pnpm
pnpm add react-toastify framer-motion @radix-ui/react-dialog @heroicons/react @bgd-labs/react-web3-icons @tuwaio/pulsar-core @tuwaio/nova-core dayjs ethereum-blockies-base64 react immer zustand clsx tailwind-merge @tuwaio/orbit-core

# Using npm
npm install react-toastify framer-motion @radix-ui/react-dialog @heroicons/react @bgd-labs/react-web3-icons @tuwaio/pulsar-core @tuwaio/nova-core dayjs ethereum-blockies-base64 react immer zustand clsx tailwind-merge @tuwaio/orbit-core

# Using yarn
yarn add react-toastify framer-motion @radix-ui/react-dialog @heroicons/react @bgd-labs/react-web3-icons @tuwaio/pulsar-core @tuwaio/nova-core dayjs ethereum-blockies-base64 react immer zustand clsx tailwind-merge @tuwaio/orbit-core
````

-----

## 🚀 Getting Started

To use this library, you must render the `<NovaProvider />` component at a high level in your application and pass the state and actions from your Pulsar store to it as props.

Here is a complete example of a `src/providers/index.tsx` file that configures the entire system.

```tsx
// src/hooks/txTrackingHooks.tsx
'use client';

import { createBoundedUseStore, createPulsarStore } from '@tuwaio/pulsar-core';
import { evmAdapter } from '@tuwaio/pulsar-evm';

import { appChains, config } from '@/configs/wagmiConfig';

const storageName = 'transactions-tracking-storage';

export enum TxType {
  example = 'example',
}

type ExampleTx = Transaction & {
  type: TxType.example;
  payload: {
    value: number;
  };
};

export type TransactionUnion = ExampleTx;

export const usePulsarStore = createBoundedUseStore(
  createPulsarStore<TransactionUnion>({
    name: storageName,
    adapter: evmAdapter(config, appChains),
  }),
);
```

```tsx
// src/providers/NovaProvider.tsx
import { NovaProvider as NP } from '@tuwaio/nova-transactions/providers';
import { TransactionAdapter } from '@tuwaio/pulsar-core';
import { useInitializeTransactionsPool } from '@tuwaio/pulsar-react';
import { useAccount } from 'wagmi';

import { usePulsarStore } from '@/hooks/txTrackingHooks';

export function NovaProvider() {
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const initialTx = usePulsarStore((state) => state.initialTx);
  const closeTxTrackedModal = usePulsarStore((state) => state.closeTxTrackedModal);
  const handleTransaction = usePulsarStore((state) => state.handleTransaction);
  const initializeTransactionsPool = usePulsarStore((state) => state.initializeTransactionsPool);
  const getAdapter = usePulsarStore((state) => state.getAdapter);

  useInitializeTransactionsPool({ initializeTransactionsPool });

  const { address } = useAccount();

  return (
    <NP
      transactionsPool={transactionsPool}
      initialTx={initialTx}
      closeTxTrackedModal={closeTxTrackedModal}
      handleTransaction={handleTransaction}
      connectedWalletAddress={address}
      connectedAdapterType={TransactionAdapter.EVM}
      adapter={getAdapter()}
    />
  );
}

```

```tsx
// src/providers/index.tsx
'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import { config } from '@/configs/wagmiConfig';

import { NovaProvider } from './NovaProvider';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NovaProvider />
          {children}
        </RainbowKitProvider>
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

## 🤝 Contributing & Support

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

If you find this library useful, please consider supporting its development. Every contribution helps!

[**➡️ View Support Options**](https://github.com/TuwaIO/workflows/blob/main/Donation.md)

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.
