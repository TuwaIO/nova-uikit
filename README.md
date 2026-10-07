# Nova UI Kit

[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

<img src="https://cdn.jsdelivr.net/gh/TuwaIO/workflows@main/preview/repos/nova_uikit.png" alt="Nova UI Kit" width="400" style="border-radius: 10px; text-align: center; margin-bottom: 20px; margin-top: 20px; margin-left: auto; margin-right: auto; display: block;" />

**Nova UI Kit** is the user interface project of TUWA Stage 4: React components for wallet connections and transactions on EVM and Solana. It renders the state of [Satellite Connect](https://satellite.docs.tuwa.io) (connect button, connect and connected modals, chain selector) and of [Pulsar](https://pulsar.docs.tuwa.io) (transaction toasts, tracking modal, history), and signs users in with [SIWX](https://siwx.docs.tuwa.io). The wallet and transaction state stays in those libraries; Nova keeps only UI state and ships compiled styles that you theme with CSS variables.

📖 **Documentation and live components:** [stories.tuwa.io](https://stories.tuwa.io/)

---

## 🏛️ Ecosystem Layer Architecture

TUWA is built in stages. Nova UI Kit is **Stage 4 (User Interface)**, above [Orbit Utils](https://orbit.docs.tuwa.io/) and [SIWX](https://siwx.docs.tuwa.io/) (Stage 1), [Satellite Connect](https://satellite.docs.tuwa.io/) and [Pulsar](https://pulsar.docs.tuwa.io/) (Stage 2) and [Quasar](https://docs.tuwa.io/quasar) (Stage 3). The [TUWA SDK](https://sdk.docs.tuwa.io/) (Stage 5) re-exports it.

Inside the monorepo, packages are split into two layers:

### Layer 6: Core (L6)

- **[`@tuwaio/nova-core`](./packages/nova-core)**: the `--tuwa-*` theme variables, the dialog, network and wallet icons, and shared hooks and helpers. No Web3 logic.

### Layer 7: Components (L7)

- **[`@tuwaio/nova-connect`](./packages/nova-connect)**: the connect button, the connect and connected modals, the chain selector, error toasts and the SIWX watcher, for a Satellite Connect store.
- **[`@tuwaio/nova-transactions`](./packages/nova-transactions)**: transaction toasts, the tracking modal and the transaction history, for a Pulsar store.

Both L7 packages use `@tuwaio/nova-core`; `@tuwaio/nova-connect` shows the transaction history with `@tuwaio/nova-transactions`.

---

## 🔧 Monorepo Structure

```
nova-uikit/
├── apps/
│   └── docs/                   # stories.tuwa.io (Storybook 10 + Vite)
│       ├── src/                # Introduction, Theming, component stories and the generated `packages/` reference
│       └── typedoc/            # TypeDoc plugins and the Packages overview page
├── packages/
│   ├── nova-core/              # L6: theme variables, dialog, icons, hooks and helpers
│   ├── nova-connect/           # L7: wallet connection UI (entry points ., ./components, ./hooks, ./i18n, ./satellite, ./evm, ./solana)
│   └── nova-transactions/      # L7: transaction UI (entry points ., ./providers)
└── typedoc.json                # Reference generation (TypeDoc "packages" strategy)
```

---

## 💾 Installation

Install the packages with their peer dependencies (the full lists, and why `@tuwaio/nova-connect` needs the packages of both chain families, are in the package READMEs):

```bash
# L6 Core
pnpm add @tuwaio/nova-core @tuwaio/orbit-core react @radix-ui/react-dialog @web3icons/react @web3icons/common framer-motion clsx tailwind-merge

# L7 Transactions (with a Pulsar store)
pnpm add @tuwaio/nova-transactions @tuwaio/pulsar-core @tuwaio/orbit-core react-toastify @heroicons/react dayjs
```

For `@tuwaio/nova-connect`, see its [installation section](https://github.com/TuwaIO/nova-uikit/tree/main/packages/nova-connect#-installation). Then import the stylesheets:

```css
@import '@tuwaio/nova-core/dist/index.css';
@import '@tuwaio/nova-connect/dist/index.css';
@import '@tuwaio/nova-transactions/dist/index.css';
```

---

## 🚀 Usage

The provider setup with Satellite Connect and the `ConnectButton` is in the [`@tuwaio/nova-connect` README](https://github.com/TuwaIO/nova-uikit/tree/main/packages/nova-connect#-usage), and the Pulsar setup in the [`@tuwaio/nova-transactions` README](https://github.com/TuwaIO/nova-uikit/tree/main/packages/nova-transactions#-usage). A full app with both, SIWX and a server is in the **[Full-Stack React guide](https://docs.tuwa.io/guides/full-stack-react)**, and the theme variables are on the **[Theming](https://stories.tuwa.io/?path=/docs/theming--docs)** page.

---

## 🛠️ Development

```bash
pnpm install     # installs dependencies and builds all packages
pnpm build       # builds packages with tsup (ESM, CJS, types) and their CSS with PostCSS
pnpm test        # runs vitest in every package
pnpm lint        # runs ESLint
pnpm docs:gen    # regenerates the Packages reference in apps/docs/src/packages
pnpm storybook   # regenerates the reference and runs Storybook on port 6006
```

The Packages reference is generated from each package's entry points, JSDoc and README, and is regenerated by the pre-commit hook. Source links point to `main`, so a regeneration only changes the pages whose source actually changed. The tests and the Storybook of the L7 packages use the built `@tuwaio/nova-core`: run `pnpm build` after changing it.

---

## 🤝 Contribution & Auditing

Please review our ecosystem **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE) file for details.
