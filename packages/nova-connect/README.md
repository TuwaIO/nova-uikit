# TUWA Nova Connect

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-connect.svg)](https://www.npmjs.com/package/@tuwaio/nova-connect)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-connect.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

Feature-rich React components for connecting Web3 wallets with a comprehensive customization system and support for multiple blockchain networks.

---

## 🏛️ What is `@tuwaio/nova-connect`?

`@tuwaio/nova-connect` is a comprehensive solution for integrating Web3 wallets into React applications. The package provides ready-to-use components with deep customization and support for both EVM and Solana blockchains.

Built on top of the Satellite Connect ecosystem, Nova Connect offers a unified interface for working with various wallet types and blockchain networks.

---

## ✨ Key Features

- **🎨 Full Customization**: Comprehensive customization system for all components and behaviors.
- **⚡ TypeScript**: Full TypeScript support with proper type definitions.
- **🌐 Multi-Blockchain**: Unified support for EVM and Solana wallets.
- **🔗 Modern React**: Built using React 19+ features and best practices.
- **🎯 Ready-made Components**: Connection button, modals, network selectors.
- **♿ Accessibility**: Full ARIA and keyboard navigation support.
- **🎭 Internationalization**: Support for multiple languages.
- **🔄 State Management**: Zustand-based store for efficient state management.

---

## 💾 Installation

### Requirements

- React 19+
- Node.js 20+
- TypeScript 5.9+

```bash
# Using pnpm (recommended)
pnpm add @tuwaio/nova-connect @tuwaio/orbit-core @tuwaio/satellite-core @tuwaio/satellite-react @tuwaio/pulsar-core @tuwaio/nova-core zustand immer framer-motion react-toastify ethereum-blockies-base64 @emotion/is-prop-valid @web3icons/react @web3icons/common @heroicons/react @radix-ui/react-dialog @radix-ui/react-select

# Using npm
npm install @tuwaio/nova-connect @tuwaio/orbit-core @tuwaio/satellite-core @tuwaio/satellite-react @tuwaio/pulsar-core @tuwaio/nova-core zustand immer framer-motion react-toastify ethereum-blockies-base64 @emotion/is-prop-valid @web3icons/react @web3icons/common @heroicons/react @radix-ui/react-dialog @radix-ui/react-select

# Using yarn
yarn add @tuwaio/nova-connect @tuwaio/orbit-core @tuwaio/satellite-core @tuwaio/satellite-react @tuwaio/pulsar-core @tuwaio/nova-core zustand immer framer-motion react-toastify ethereum-blockies-base64 @emotion/is-prop-valid @web3icons/react @web3icons/common @heroicons/react @radix-ui/react-dialog @radix-ui/react-select
```

---

## 🚀 Quick Start

### Basic Provider Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { satelliteEVMAdapter, createDefaultTransports } from '@tuwaio/satellite-evm';
import { NovaConnectProvider } from '@tuwaio/nova-connect';
import { SatelliteConnectProvider } from '@tuwaio/nova-connect/satellite';
import { EVMWalletsWatcher } from '@tuwaio/nova-connect/evm';
import { SolanaWalletsWatcher } from '@tuwaio/nova-connect/solana';
import { satelliteSolanaAdapter } from '@tuwaio/satellite-solana';
import { WagmiProvider } from 'wagmi';
import { ReactNode } from 'react';
import { createConfig } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { mainnet, sepolia } from 'viem/chains';
import type { Chain } from 'viem/chains';

export const appEVMChains = [mainnet, sepolia] as readonly [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  connectors: [injected()],
  transports: createDefaultTransports(appEVMChains), // Automatically creates http transports
  chains: appEVMChains,
  ssr: true, // Enable SSR support if needed (e.g., in Next.js)
});

export const solanaRPCUrls = {
  devnet: 'https://api.devnet.solana.com',
};

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SatelliteConnectProvider
          adapter={[satelliteEVMAdapter(wagmiConfig), satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls })]}
          autoConnect={true}
        >
          <EVMWalletsWatcher wagmiConfig={wagmiConfig} />
          <SolanaWalletsWatcher />
          <NovaConnectProvider
            appChains={appEVMChains}
            solanaRPCUrls={solanaRPCUrls}
            withImpersonated
            withBalance
            withChain
          >
            {children}
          </NovaConnectProvider>
        </SatelliteConnectProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Using ConnectButton

```tsx
import { ConnectButton } from '@tuwaio/nova-connect/components';

function App() {
  return (
    <div>
      <ConnectButton />
    </div>
  );
}
```

---

## 🧩 Key Components

### 1. **ConnectButton**

- Main component for wallet connection.
- Full customization system.

### 2. **NovaConnectProvider**

- Context provider with state management.
- Customizable error handling.
- Flexible internationalization system.

---

## 🌍 Internationalization

Nova Connect supports full label customization:

```tsx
const customLabels = {
  connectWallet: 'Connect Wallet',
  disconnect: 'Disconnect',
  connecting: 'Connecting...',
  connected: 'Connected',
  // ... other labels
};

<NovaConnectProvider
  labels={customLabels}
  // ... other props
/>;
```

---

## ♿ Accessibility

Nova Connect fully supports accessibility standards:

- ARIA labels and descriptions
- Keyboard navigation
- Screen reader support
- Semantic HTML elements
- High contrast

## 🤝 Contributing & Support

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

If you find this library useful, please consider supporting its development. Every contribution helps!

[**➡️ View Support Options**](https://github.com/TuwaIO/workflows/blob/main/Donation.md)

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.
