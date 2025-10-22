# Nova Connect

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
- **📱 Responsiveness**: Mobile-first design.

---

## 💾 Installation

### Requirements
- React 19+
- Node.js 24+
- TypeScript 5.9+

```bash
# Using pnpm (recommended)
pnpm add @tuwaio/nova-connect @tuwaio/satellite-core @tuwaio/orbit-core @tuwaio/pulsar-core @tuwaio/satellite-evm @tuwaio/satellite-solana @wagmi/core @wallet-standard/react viem zustand

# Using npm
npm install @tuwaio/nova-connect @tuwaio/satellite-core @tuwaio/orbit-core @tuwaio/pulsar-core @tuwaio/satellite-evm @tuwaio/satellite-solana @wagmi/core @wallet-standard/react viem zustand

# Using yarn
yarn add @tuwaio/nova-connect @tuwaio/satellite-core @tuwaio/orbit-core @tuwaio/pulsar-core @tuwaio/satellite-evm @tuwaio/satellite-solana @wagmi/core @wallet-standard/react viem zustand
````

-----

## 🚀 Quick Start

### Basic Provider Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { SatelliteConnectProvider, NovaConnectProvider } from '@tuwaio/nova-connect';
import { EVMWalletsWatcher } from '@tuwaio/nova-connect/evm';
import { SolanaWalletsWatcher } from '@tuwaio/nova-connect/solana';
import { initializeSolanaMobileConnectors, satelliteSolanaAdapter } from '@tuwaio/satellite-solana';
import { createDefaultTransports, initAllConnectors } from '@tuwaio/satellite-evm';
import { createConfig } from '@wagmi/core';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { Chain, mainnet, polygon, arbitrum } from 'viem/chains';

export const appConfig = {
  appName: 'My Nova Connect App',
};

export const solanaRPCUrls = {
  mainnet: 'https://api.mainnet-beta.solana.com',
};

export const appEVMChains = [mainnet, polygon, arbitrum] as readonly [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  connectors: initAllConnectors({
    ...appConfig,
  }),
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
  syncConnectedChain: true,
});

const queryClient = new QueryClient();

initializeSolanaMobileConnectors({
  rpcUrls: solanaRPCUrls,
  ...appConfig,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SatelliteConnectProvider
          adapters={[satelliteEVMAdapter({ wagmiConfig }), satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls })]}
          appName={appConfig.appName}
        >
          <EVMWalletsWatcher />
          <SolanaWalletsWatcher />
          <NovaConnectProvider>
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
import { ConnectButton } from '@tuwaio/nova-connect';

function App() {
  return (
    <div>
      <ConnectButton
        appChains={appEVMChains}
        solanaRPCUrls={solanaRPCUrls}
        withImpersonated
        withBalance
        withChain
      />
    </div>
  );
}
```

-----

## 🧩 Key Components

### 1. **ConnectButton**

- Main component for wallet connection.
- Built-in support for balance display and network selector.
- Full customization system.

### 2. **NovaConnectProvider**

- Context provider with state management.
- Customizable error handling.
- Flexible internationalization system.

### 3. **Hooks**

- `useWalletBalance`: Get the wallet balance.

-----

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
/>
```

-----

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

## 👥 Contributors

- **Oleksandr Tkach** - [GitHub](https://github.com/Argeare5)