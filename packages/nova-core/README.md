# @tuwaio/nova-core

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](./LICENSE)

`@tuwaio/nova-core` is the **UI Core (L6)** package of the TUWA Ecosystem design system. It acts as the shared foundation for styling primitives, CSS variable definitions, base React elements, and helper utilities. Fully independent of Web3 logic, it provides the common design boundaries consumed by visual modules like `@tuwaio/nova-connect` and `@tuwaio/nova-transactions` to maintain visual consistency across all TUWA interfaces.

---

## 🏛️ Core Capabilities

- **🎨 Design Token System:** Declares variables for colors, typography, borders, animations, and spacing, with built-in switching for light and dark modes.
- **🛠️ Style Merger (`cn`):** An optimized composition utility blending `clsx` and `tailwind-merge` to resolve style overrides dynamically without class conflicts.
- **⚡ Tailwind CSS v4 Native:** Configured to map variables into Tailwind's modern engine, allowing arbitrary class declarations.
- **♿ Base Components & Primitives:** Shared layout modules, dialog nodes, overlays, and common utility indicators.
- **📱 Shared React Hooks:** Reusable, performance-optimized hooks for clipboards (`useCopyToClipboard`) and responsive layouts (`useMediaQuery`).

---

## 💾 Installation

```bash
pnpm add @tuwaio/nova-core
```

### CSS Setup

Import the core CSS styles into the entrypoint of your application (e.g., `main.css` or `globals.css`):

```css
@import '@tuwaio/nova-core/dist/index.css';
```

---

## 🚀 Usage Guide

### 1. Tailwind Arbitrary Tokens

Use Nova custom variables directly in components for consistent styling:

```tsx
export function AccentCard() {
  return (
    <div className="p-6 bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] rounded-[var(--tuwa-rounded-corners)]">
      <h3 className="text-[var(--tuwa-text-primary)] font-medium">Core Primitive Card</h3>
      <p className="mt-2 text-[var(--tuwa-text-secondary)] text-sm">Styled using central ecosystem design tokens.</p>
      <button className="mt-4 px-4 py-2 bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)]">Action</button>
    </div>
  );
}
```

### 2. Styling Composition (`cn`)

Blend default styles with external prop overrides cleanly:

```tsx
import { cn } from '@tuwaio/nova-core';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 font-medium rounded transition-colors',
        variant === 'primary'
          ? 'bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)]'
          : 'bg-[var(--tuwa-standart-button-bg)] text-[var(--tuwa-text-primary)] hover:bg-[var(--tuwa-standart-button-hover)]',
        className,
      )}
      {...props}
    />
  );
}
```

### 3. Clipboard copy with `useCopyToClipboard`

Easily build wallet address display nodes with copying feedback:

```tsx
import { useCopyToClipboard } from '@tuwaio/nova-core';

export function AddressDisplay({ address }: { address: string }) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <button
      onClick={() => copy(address)}
      className="font-mono text-xs text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-accent)]"
    >
      {address.slice(0, 6)}...{address.slice(-4)}
      {copied ? ' (Copied ✓)' : ' (Copy)'}
    </button>
  );
}
```

---

## 🎨 Theme Customization

Override default tokens in your global CSS stylesheet to match your brand:

```css
:root {
  /* Customize Brand Accent Colors */
  --tuwa-text-accent: #10b981; /* Emerald-500 */
  --tuwa-text-on-accent: #ffffff;
  --tuwa-rounded-corners: 8px;
}

/* Customize Dark Mode styling */
.dark {
  --tuwa-bg-primary: #050505;
  --tuwa-bg-secondary: #121212;
  --tuwa-border-primary: #222222;
}
```

---

## 🔧 API & Module Architecture

`@tuwaio/nova-core` exports the following modules and functions:

- **Style Composition:** `cn`.
- **React Hooks:** `useCopyToClipboard`, `useMediaQuery`.
- **UI Dialog Primitives:** `Dialog`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- **Utility Indicators:** `StarsBackground`, `FallbackIcon`, `GithubFallbackIcon`, `ChevronArrowWithAnim`, `ToastCloseButton`, `ToastValidationError`, `NetworkIcon`, `WalletIcon`.
- **Formatters:** `deepMerge`, `svgToBase64`, `isTouchDevice`, `textCenterEllipsis`, `resolveCssVariable`.

---

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](./LICENSE) file for details.
