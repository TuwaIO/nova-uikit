# TUWA Nova UI Kit

[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](./LICENSE)
[![Contributors](https://img.shields.io/github/contributors/TuwaIO/nova-uikit)](https://github.com/TuwaIO/nova-uikit/graphs/contributors)

Welcome to the official monorepo for the **Nova UI Kit**, the comprehensive design system and component library for the TUWA ecosystem. This project provides all the necessary tools to build beautiful, consistent, and high-performance Web3 applications.

## 🏛️ Architecture Philosophy

Our ecosystem is built on a clear separation of concerns:

-   **Pulsar Engine (`pulsar-core`, `pulsar-evm`):** The headless state management libraries that handle all the Web3 logic.
-   **Nova UI Kit (this repo):** The view layer, providing foundational styles and React components to visualize the state managed by Pulsar.

## 📦 Packages in this Monorepo

This repository is managed using `pnpm` workspaces.

| Package | Version | Description |
|---|---|---|
| 🎨 **`@tuwaio/nova-core`** | [![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core) | Foundational package with styling primitives, CSS variables, and helper utilities. |
| 🧩 **`@tuwaio/nova-transactions`** | [![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://www.npmjs.com/package/@tuwaio/nova-transactions) | React component library for visualizing transaction states (modals, toasts, etc.). |

## 🛠 Tech Stack

-   **Framework**: React 19
-   **Styling**: Tailwind CSS v4
-   **State Management**: Zustand (via Pulsar)
-   **Web3**: Wagmi & Viem
-   **Tooling**: TypeScript, pnpm, Vite, Storybook

---

## 🚀 Getting Started

Follow these steps to set up the development environment on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/TuwaIO/nova-uikit.git](https://github.com/TuwaIO/nova-uikit.git)
cd nova-uikit
```

### 2. Install Dependencies
This project uses `pnpm`. Make sure you have it installed (`npm install -g pnpm`). Then run:
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
pnpm dev
```
This will open Storybook at **http://localhost:6006**.

## 🤝 Contributing

We welcome contributions from the community! Please read our main **[Contribution Guidelines](./CONTRIBUTING.md)** for details on our code of conduct, commit message standards, and the pull request process.

## 📄 License

This project is licensed under the **Apache-2.0 License**.