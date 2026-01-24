# 🤖 Agent Context: Nova UI Kit

## 1. Project Philosophy & Goal
* **What is this?** A monorepo for **Nova UI Kit** — the official, high-performance design system and component library for the TUWA ecosystem. It provides the "View Layer" that visualizes the state managed by `satellite` (wallet connection) and `pulsar` (transaction tracking).
* **Role in TUWA:** The Visual Interface. It connects purely logical, headless libraries to beautiful, interactive React components.
* **Philosophy:** "Pure Web3", Headless-First, Framework Agnostic (React implementation), Strict Separation of Concerns (UI vs. Logic).

## 2. Tech Stack (Verified)
* **Core:** TypeScript v5.9+, Node.js (v20-24), pnpm v10+ (Workspace).
* **Framework:** React v19+.
* **Styling:** Tailwind CSS v4, Framer Motion v12.
* **State Management:** Zustand v5.x.
* **Web3 (EVM):** `viem` v2.x, `@wagmi/core` v3.x.
* **Web3 (Solana):** `gill` v0.14+ (formerly `rpc-helpers`), `@wallet-standard/react`, `@wallet-standard/base`.
* **Icons:** `@web3icons/react` v4+.
* **Build/Monorepo:**
    *   `tsup`: Bundler for `packages/*` (ESM/CJS/DTS).
    *   `vite`: Bundler for Storybook (`apps/docs`).
    *   `pnpm` Workspaces: Dependency management.
    *   `semantic-release`: Automated versioning.

## 3. Architecture & Directory Structure
The project is a **pnpm workspace** clearly separating core styling, connection logic, and transaction visualization.

```
nova-uikit/
├── apps/
│   └── docs/                   # Storybook Instance (React + Vite)
│       └── .storybook/         # Storybook configuration
├── packages/
│   ├── nova-core/              # FOUNDATION. Styling primitives & Utils.
│   │   ├── src/styles/         # CSS Variables & Tailwind setup
│   │   ├── src/hooks/          # Shared hooks (useTheme, etc.)
│   │   └── src/utils/          # Helper functions (cn, formatters)
│   ├── nova-connect/           # CONNECTIVITY. Wallet Connection Components.
│   │   ├── src/satellite/      # Integration with @tuwaio/satellite-core
│   │   ├── src/evm/            # EVM-specific connectors (Wagmi/Viem)
│   │   ├── src/solana/         # Solana-specific connectors (Gill)
│   │   ├── src/components/     # UI Components (ConnectButton, Modal)
│   │   └── src/providers/      # NovaConnectProvider logic
│   └── nova-transactions/      # FEEDBACK. Transaction Status Components.
│       ├── src/components/     # Toasts, Modals, Feed lists
│       └── src/providers/      # TransactionProvider
├── package.json                # Root scripts & dependencies
└── pnpm-workspace.yaml         # Workspace definition
```

### Module Breakdown
*   **`nova-core`**: The bedrock. Contains the Tailwind configuration, shared CSS variables, and utility functions like `cn` (classnames). Zero Web3 logic.
*   **`nova-connect`**: The bridge to wallets. Consumes `@tuwaio/satellite-*` packages to provide UI for wallet selection, connection status, and account management.
*   **`nova-transactions`**: The feedback loop. Consumes `@tuwaio/pulsar-core` to visualize transaction lifecycles (pending -> success/fail) via toasts and history lists.

## 4. Coding Standards (STRICT)
*   **Language:** English ONLY (Code, Comments, Commits).
*   **Style:** Functional programming preferred. React Functional Components.
*   **Types:** Strict TypeScript. **NO `any`**. Usage of `ts-expect-error` must be justified.
*   **Styling:** Utility-first via Tailwind CSS. No custom CSS files unless absolutely necessary (use `nova-core/src/styles` for globals).
*   **Comments:** JSDoc required for **all** exported components and hooks.
    *   Must explain *props*, *returns*, and *side effects*.
*   **Naming:**
    *   Files: `camelCase.ts` (hooks/utils), `PascalCase.tsx` (components).
    *   Components/Types: `PascalCase`.
    *   Functions/Variables: `camelCase`.

## 5. Key Workflows
*   **Build:** `pnpm build` (Builds all packages via `tsup`).
*   **Storybook:** `pnpm storybook` (Runs the dev environment. Note: `pnpm dev` is NOT configured in root).
*   **Lint:** `pnpm lint` (ESLint).
*   **Format:** `pnpm format` (Prettier).
*   **Clean:** `pnpm clean` (Nukes `node_modules` and `dist` dirs).

## 6. AI Agent Behavior (Mandatory)
*   **Post-Work Routine:** After generating or modifying code, you **MUST** run `pnpm lint --fix` (and `pnpm format`) to ensure code quality.
*   **Dependency Rule:** Never install new packages without explicit user permission.
*   **Hallucination Check:**
    *   Do **NOT** import `ethers.js` (We use `viem`).
    *   Do **NOT** import legacy `@solana/web3.js` unless via `gill`.
    *   Do **NOT** implement business logic in `nova-*` packages (Logic belongs in `satellite-*` or `pulsar-*`).
    *   Do **NOT** use `style={{...}}` for styling (Use Tailwind classes).
