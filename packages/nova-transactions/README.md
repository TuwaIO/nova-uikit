# @tuwaio/nova-transactions

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-transactions.svg)](./LICENSE)

`@tuwaio/nova-transactions` is the **UI Components (L7)** package of the TUWA Ecosystem transaction lifecycle tracking system. It provides the visual layer to monitor, display, and manage active on-chain transactions, consuming state directly from the headless **[Pulsar Engine](https://github.com/TuwaIO/pulsar-core)** state machine.

By coupling the UI manager to Pulsar stores, it automatically handles pending loaders, speed-up options, failure overlays, and success notifications, keeping the user in the loop even during congested block space periods.

---

## 🏛️ Core Capabilities

- **🧩 Interactive Visual Nodes:** Built-in dialogs and widget cards (`TrackingTxModal` for individual status, `TransactionsInfoModal` for full transaction lists, and `ToastTransaction` feeds).
- **🔌 Isolated Provider Hooks:** The `<NovaTransactionsProvider />` bridges your React tree with Pulsar's transaction history pools and signature polling events.
- **🎨 Custom Styling overrides:** Style sub-components via CSS variables from `@tuwaio/nova-core` or replace components using the `customization` property.
- **🌍 Dynamic Internationalization:** Supports overriding labels configuration to localize status messages (`pending`, `success`, `failed`, `replaced`) and actions.

---

## 💾 Installation

```bash
pnpm add @tuwaio/nova-transactions @tuwaio/nova-core @tuwaio/pulsar-core @tuwaio/pulsar-react
```

### Peer Dependencies Check

Make sure your project contains the required layout and utility engines:

```bash
# State & Utilities
pnpm add zustand immer dayjs clsx tailwind-merge framer-motion

# Dialog Primitives & Notifications
pnpm add @radix-ui/react-dialog @heroicons/react @web3icons/common @web3icons/react react-toastify
```

---

## 🚀 Quick Start Setup

### 1. Create the Transaction Store (Pulsar)

Initialize the local-first persistent transaction store with chain-specific state adapters:

```tsx
// src/hooks/usePulsarStore.ts
'use client';

import { createBoundedUseStore, createPulsarStore, Transaction } from '@tuwaio/pulsar-core';
import { pulsarEvmAdapter } from '@tuwaio/pulsar-evm';
import { pulsarSolanaAdapter } from '@tuwaio/pulsar-solana';
import { wagmiConfig, appEVMChains, solanaRPCUrls } from '@/config/appConfig';

const storageName = 'transactions-tracking-storage';

export enum TxType {
  swap = 'swap',
}

type SwapTx = Transaction & {
  type: TxType.swap;
  payload: { from: string; to: string; amount: string };
};

export type TransactionUnion = SwapTx;

export const usePulsarStore = createBoundedUseStore(
  createPulsarStore<TransactionUnion>({
    name: storageName,
    adapter: [pulsarEvmAdapter(wagmiConfig, appEVMChains), pulsarSolanaAdapter({ rpcUrls: solanaRPCUrls })],
    maxTransactions: 50, // prevent localStorage bloat
  }),
);
```

### 2. Setup the Transactions UI Provider

Create a bridge component connecting your Pulsar store parameters and Satellite wallet state with the Nova Transactions UI:

```tsx
// src/providers/NovaTransactionsWrapper.tsx
'use client';

import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { NovaTransactionsProvider as NTP } from '@tuwaio/nova-transactions/providers';
import { getAdapterFromConnectorType } from '@tuwaio/orbit-core';
import { useInitializeTransactionsPool } from '@tuwaio/pulsar-react';

import { usePulsarStore } from '@/hooks/usePulsarStore';

export function NovaTransactionsWrapper() {
  const getAdapter = usePulsarStore((state) => state.getAdapter);
  const initialTx = usePulsarStore((state) => state.initialTx);
  const closeTxTrackedModal = usePulsarStore((state) => state.closeTxTrackedModal);
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);
  const initializeTransactionsPool = usePulsarStore((state) => state.initializeTransactionsPool);

  const activeConnection = useSatelliteConnectStore((state) => state.activeConnection);

  // Resume tracking for active pending signatures on mount
  useInitializeTransactionsPool({ initializeTransactionsPool });

  return (
    <NTP
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
```

### 3. Usage in Action Buttons

Call the action wrapper to trigger on-chain operations and auto-render status modals:

```tsx
import { usePulsarStore, TxType } from '@/hooks/usePulsarStore';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { mainnet } from 'viem/chains';

export function SwapButton() {
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);

  const triggerSwap = async () => {
    const swapFunction = async () => {
      // Execute smart contract write method and return the hash
      return '0x...';
    };

    await executeTxAction({
      actionFunction: swapFunction,
      onSuccess: (tx) => console.log('Transaction succeeded!', tx.hash),
      params: {
        type: TxType.swap,
        adapter: OrbitAdapter.EVM,
        desiredChainID: mainnet.id,
        title: 'Swap ETH',
        description: 'Swapping 1 ETH for USDC',
        payload: { from: 'ETH', to: 'USDC', amount: '1' },
        withTrackedModal: true, // opens tracking overlay automatically
      },
    });
  };

  return (
    <button onClick={triggerSwap} className="btn-primary">
      Execute Swap
    </button>
  );
}
```

---

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](./LICENSE) file for details.
