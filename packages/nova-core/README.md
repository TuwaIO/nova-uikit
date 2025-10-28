# TUWA Nova Core

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The foundational package for the Nova UI Kit design system. Provides core styling primitives, theme variables, utility functions, and common React hooks for building consistent Web3 applications.

-----

## What is `@tuwaio/nova-core`?

`@tuwaio/nova-core` is the **foundational engine** of the Nova UI Kit design system. It is **not** a component library—instead, it provides the low-level tools, design tokens, and utilities necessary to build consistent, high-quality user interfaces across all TUWA products.

Built for the **TUWA ecosystem**, Nova Core serves as the shared foundation that powers all other Nova packages (`@tuwaio/nova-connect`, `@tuwaio/nova-transactions`) and ensures design consistency across multi-chain Web3 applications.

**Why Nova Core?**

Building design systems requires consistent foundations: colors, spacing, typography, and utility functions. Without a shared core, different packages end up with conflicting styles, duplicated code, and inconsistent user experiences.

Nova Core solves this by:

1.  **Providing Unified Design Tokens:** A comprehensive CSS variable system that ensures visual consistency across all components.
2.  **Offering Smart Utilities:** Battle-tested helper functions like the `cn` utility that combines `clsx` and `tailwind-merge` for conflict-free styling.
3.  **Supplying Common Hooks:** A collection of reusable React hooks for common Web3 UI patterns.
4.  **Ensuring Tailwind CSS v4 Integration:** Seamless compatibility with modern Tailwind CSS workflows.

-----

## ✨ Key Features

- **🎨 Complete Design Token System:** Comprehensive CSS variables for colors, spacing, typography, shadows, and animations
- **🛠️ Smart Utility Functions:** Advanced `cn` utility that merges Tailwind classes intelligently, preventing style conflicts
- **🎣 Common React Hooks:** Collection of reusable hooks for Web3 UI patterns like wallet state, transaction status, and theme management
- **⚡ Tailwind CSS v4 Ready:** Full compatibility with modern Tailwind CSS workflows and arbitrary value usage
- **🌓 Dark Mode Support:** Built-in dark mode theming with CSS variable-based switching
- **♿ Accessibility First:** ARIA-compliant design tokens and utilities for building accessible interfaces
- **📱 Responsive Design:** Mobile-first breakpoints and responsive utility functions

-----

## 💾 Installation

### Requirements

- **React:** 19+
- **Node.js:** 20+
- **TypeScript:** 5.9+ (recommended)

### Package Installation

Install the package using your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm add @tuwaio/nova-core

# Using npm
npm install @tuwaio/nova-core

# Using yarn
yarn add @tuwaio/nova-core
```

### CSS Setup

**⚠️ Critical Step:** Import the core styles into your application's main CSS file. This step is essential for accessing base styles.

```css
/* src/styles/globals.css or src/styles/app.css */
@import '@tuwaio/nova-core/dist/index.css';
```

-----

## 🚀 Usage

### Design Tokens with Tailwind CSS v4

Nova Core is designed to work seamlessly with Tailwind CSS v4. You can use the CSS variables directly in your `className` as arbitrary values:

```tsx
// Using Nova design tokens in Tailwind classes
<button className="bg-[var(--tuwa-color-primary)] text-[var(--tuwa-text-on-primary)]">
  Connect Wallet
</button>

// With hover states and transitions
<div className="
  p-[var(--tuwa-spacing-md)]
  bg-[var(--tuwa-bg-secondary)]
  hover:bg-[var(--tuwa-bg-hover)]
  transition-colors
">
  Card Content
</div>
```

### The `cn` Utility Function

The `cn` utility combines `clsx` and `tailwind-merge` to provide intelligent class merging:

```tsx
import { cn } from '@tuwaio/nova-core';

// Basic usage
const buttonClass = cn(
  'px-4 py-2 font-medium rounded-lg', // base styles
  'bg-blue-500 text-white', // default variant
  {'opacity-50 cursor-not-allowed': isLoading}, // conditional styles
  className // additional classes from props
);

// Tailwind class conflict resolution
const mergedClasses = cn(
  'p-4 text-sm', // base classes
  'p-6 text-lg'  // these override the base classes intelligently
);
// Result: 'p-6 text-lg' (conflicts resolved)
```

### Common React Hooks

Nova Core provides several utility hooks for common Web3 UI patterns:

```tsx
import { useCopyToClipboard } from '@tuwaio/nova-core';

function WalletAddress({ address }: { address: string }) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className={cn('transition-all', isCollapsed && 'w-12')}>
      <button
        onClick={() => copy(address)}
        className="font-mono text-sm hover:bg-[var(--tuwa-bg-hover)]"
      >
        {address.slice(0, 6)}
        {copied && ' ✓'}
      </button>
    </div>
  );
}
```

-----

## 🛠️ Theme Customization

### Basic Customization

Override design tokens in your CSS to match your brand:

```css
/* src/styles/globals.css */
@import '@tuwaio/nova-core/dist/index.css';

/* Your custom theme overrides */
:root {
  /* Brand Colors */
  --tuwa-color-primary: #3b82f6; /* Blue-500 */
  --tuwa-color-primary-hover: #2563eb; /* Blue-600 */

  /* Background System */
  --tuwa-bg-primary: #ffffff;
  --tuwa-bg-secondary: #f8fafc;
  --tuwa-bg-hover: #f1f5f9;

  /* Text Colors */
  --tuwa-text-primary: #0f172a;
  --tuwa-text-secondary: #64748b;
  --tuwa-text-muted: #94a3b8;

  /* Border System */
  --tuwa-border-primary: #e2e8f0;
  --tuwa-border-secondary: #cbd5e1;
}
```

### Dark Mode Support

Nova Core includes built-in dark mode support:

```css
/* Dark mode overrides */
.dark {
  --tuwa-color-primary: #60a5fa; /* Blue-400 */
  --tuwa-bg-primary: #0f172a; /* Slate-900 */
  --tuwa-bg-secondary: #1e293b; /* Slate-800 */
  --tuwa-text-primary: #f1f5f9; /* Slate-100 */
  --tuwa-text-secondary: #cbd5e1; /* Slate-300 */
  --tuwa-border-primary: #374151; /* Gray-700 */
}
```

### Advanced Usage

#### Component Integration

Nova Core works seamlessly with other Nova packages:

```tsx
import { cn } from '@tuwaio/nova-core';
import { ConnectButton } from '@tuwaio/nova-connect/components';
import { NovaTransactionsProvider } from '@tuwaio/nova-transactions';

function App() {
  return (
    <div className={cn(
      'min-h-screen',
      'bg-[var(--tuwa-bg-primary)]',
      'text-[var(--tuwa-text-primary)]'
    )}>
        <NovaTransactionsProvider {...params} />
        <header className="border-b border-[var(--tuwa-border-primary)]">
          <ConnectButton />
        </header>
        <main>
          {/* Your app content */}
        </main>
    </div>
  );
}
```

### API Reference

#### Utilities

| Function | Description | Usage |
| :--- | :--- | :--- |
| **`cn(...classes)`** | Merges class names intelligently, resolving Tailwind conflicts | `cn('p-4 text-sm', 'p-6', conditional && 'hidden')` |

#### Hooks

| Hook | Description | Return Type |
| :--- | :--- | :--- |
| **`useCopyToClipboard()`** | Copy text to clipboard with feedback | `[boolean, (text: string) => void]` |
| **`useMediaQuery(query)`** | Responsive media query hook | `boolean` |

## 🤝 Contributing & Support

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

If you find this library useful, please consider supporting its development. Every contribution helps!

[**➡️ View Support Options**](https://github.com/TuwaIO/workflows/blob/main/Donation.md)

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.