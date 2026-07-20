# @tuwaio/nova-connect

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-connect.svg)](https://www.npmjs.com/package/@tuwaio/nova-connect)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-connect.svg)](./LICENSE)

`@tuwaio/nova-connect` is the **UI Components (L7)** package of the TUWA Ecosystem wallet connectivity layer. It translates the headless connection status of `@tuwaio/satellite-react` into beautiful, accessible, and highly customizable React user interface elements.

Nova Connect natively supports both EVM and Solana wallet standard connectors, providing ready-made buttons, dialog selectors, network switchers, and balance widgets while keeping styling decisions decoupled from the underlying connection state store.

---

## 🏛️ Core Capabilities

- **🔌 Plug-and-Play Widgets:** Ready-to-use wallet components (`ConnectButton`, `ConnectCard`, `DisconnectButton`, `AccountImpersonationIndicator`).
- **⛓️ Cohesive Multi-Chain Interface:** Consistently handles EVM wallets (via `@tuwaio/satellite-evm` and `wagmi`) and Solana standard wallets (via `@tuwaio/satellite-solana` and `gill`).
- **🎨 Deep Customization:** Change typography, borders, and margins using the `customization` prop or override colors via the `@tuwaio/nova-core` token variables.
- **♿ Built-in Accessibility:** Dialog primitives powered by Radix UI, featuring complete keyboard navigation, viewport trapping, and screen reader announcements.
- **🌍 Internationalization (i18n):** Overridable labels configuration for localizing connection prompts and wallet state tags.

---

## 💾 Installation

```bash
pnpm add @tuwaio/nova-connect @tuwaio/nova-core @tuwaio/satellite-core @tuwaio/satellite-react
```

### Peer Dependencies Check

Ensure your React application contains required core packages:

```bash
# State & Utilities
pnpm add zustand immer dayjs clsx tailwind-merge framer-motion @emotion/is-prop-valid

# Dialog & Icons Primitives
pnpm add @radix-ui/react-dialog @radix-ui/react-select @heroicons/react @web3icons/react @web3icons/common
```

---

## 🚀 Quick Start Setup

### 1. Global Providers Integration

Wrap your React tree with the Wagmi configuration, Satellite logic connection provider, and Nova Connect layout provider:

```tsx
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { satelliteSolanaAdapter } from '@tuwaio/satellite-solana';
import { SatelliteConnectProvider } from '@tuwaio/nova-connect/satellite';
import { EVMConnectorsWatcher } from '@tuwaio/nova-connect/evm';
import { SolanaConnectorsWatcher } from '@tuwaio/nova-connect/solana';
import { NovaConnectProvider } from '@tuwaio/nova-connect';

import { wagmiConfig, appEVMChains, solanaRPCUrls } from './config/appConfig';

const queryClient = new QueryClient();

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* Layer 1: Headless Connection logic */}
        <SatelliteConnectProvider
          adapter={[satelliteEVMAdapter(wagmiConfig, appEVMChains), satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls })]}
          autoConnect={true}
        >
          {/* Watchers sync native connector states to the store */}
          <EVMConnectorsWatcher wagmiConfig={wagmiConfig} />
          <SolanaConnectorsWatcher />

          {/* Layer 2: Visual Connection component provider */}
          <NovaConnectProvider
            appChains={appEVMChains}
            solanaRPCUrls={solanaRPCUrls}
            withBalance
            withChain
            withImpersonated
          >
            {children}
          </NovaConnectProvider>
        </SatelliteConnectProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 2. Rendering the Connection Button

Place the component in your header or navigation bar:

```tsx
import { ConnectButton } from '@tuwaio/nova-connect/components';

export function NavigationHeader() {
  return (
    <header className="flex justify-between items-center p-4 border-b border-[var(--tuwa-border-primary)]">
      <span className="font-bold">My dApp</span>
      <ConnectButton />
    </header>
  );
}
```

---

## 🎨 Component Customization

Pass class names and layout overrides using the `customization` property to match components with your custom UI:

```tsx
import { ConnectButton } from '@tuwaio/nova-connect/components';
import { cn } from '@tuwaio/nova-core';

export function CustomHeader() {
  return (
    <ConnectButton
      customization={{
        classNames: {
          connectButton: () =>
            cn(
              'px-6 py-2 rounded-full font-mono text-sm uppercase transition-all duration-300',
              'bg-emerald-500 text-slate-950 hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500',
            ),
          walletName: () => 'text-xs text-slate-300 font-semibold',
        },
      }}
    />
  );
}
```

---

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](./LICENSE) file for details.
