# TUWA Nova UI Kit

[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](./LICENSE)
[![Contributors](https://img.shields.io/github/contributors/TuwaIO/nova-uikit)](https://github.com/TuwaIO/nova-uikit/graphs/contributors)

<img src="https://raw.githubusercontent.com/TuwaIO/workflows/refs/heads/main/preview/repos/nova_uikit.png" alt="Nova UI Kit" width="400" style="border-radius: 10px; text-align: center; margin-bottom: 20px; margin-top: 20px; margin-left: auto; margin-right: auto; display: block;" />

Welcome to the official monorepo for the **Nova UI Kit**, the comprehensive design system and component library for the TUWA ecosystem. This project provides all the necessary tools to build beautiful, consistent, and high-performance Web3 applications.

## 🏛️ Architecture Philosophy

Our ecosystem is built on a clear separation of concerns:

- **Orbit Utils (`orbit-core`, `orbit-evm`, `orbit-solana`):** The headless helper functions for interactions with multi networks in Web3.
- **Satellite Connect (`satellite-core`, `satellite-evm`, `satellite-solana`):** The headless state management libraries that handle Web3 wallet connect logic.
- **Pulsar Engine (`pulsar-core`, `pulsar-evm`, `pulsar-solana`):** The headless state management libraries that handle Web3 transactions tracking logic.
- **Nova UI Kit (this repo):** The view layer, providing foundational styles and React components to visualize the state managed by Satellite and Pulsar.

## 📦 Packages in this Monorepo

This repository is managed using `pnpm` workspaces.

| Package                            | Version                                                                                                                               | Description                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |----------------------------------------------------------------------------------------------------------|
| 🎨 **`@tuwaio/nova-core`**         | [![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core)                 | Foundational package with styling primitives, CSS variables, base react components and helper utilities. |
| 🔗 **`@tuwaio/nova-connect`**      | [![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-connect.svg)](https://www.npmjs.com/package/@tuwaio/nova-connect)           | React components for Web3 wallet connection flows, including connect modals and buttons.                 |
| 🧩 **`@tuwaio/nova-transactions`** | [![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions) | React component library for visualizing transaction states (modals, toasts, etc.).                       |

## 🛠 Tech Stack

- **Framework**: React 19+
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Tooling**: TypeScript, pnpm, Vite, Storybook

---

## 🚀 Getting Started

Follow these steps to set up the development environment on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/TuwaIO/nova-uikit.git

cd nova-uikit
```

### 2. Install Dependencies

This project uses `pnpm`. Make sure you have it installed (). Then run: `npm install -g pnpm`

```bash
pnpm install
```

### 3. Build All Packages

After installation, it's a good practice to build all packages to ensure everything is linked correctly.

```bash
pnpm build
```

## 💻 Development Workflow

The primary way to develop and test components is through Storybook.

### Running Storybook

To start the Storybook development server, run the following command from the root of the repository:

```bash
pnpm storybook
```

This will open Storybook at **[http://localhost:6006](http://localhost:6006)**.

## 🤝 Contributing & Support

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

If you find this library useful, please consider supporting its development. Every contribution helps!

[**➡️ View Support Options**](https://github.com/TuwaIO/workflows/blob/main/Donation.md)

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.
