# TUWA Nova Core

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/TuwaIO/nova-uikit/release.yml?branch=main)](https://github.com/TuwaIO/nova-uikit/actions)

The foundational package for the TUWA design system. Provides core styling primitives, theme variables, and common React hooks and utilities.

## What is `@tuwaio/nova-core`?

`@tuwaio/nova-core` is the engine of the TUWA design system. It is **not** a component library. Instead, it provides the low-level tools necessary to build consistent, high-quality user interfaces across all TUWA products.

Use this package to:
-   Ensure brand consistency with a centralized theme and styling.
-   Speed up development with a set of battle-tested helper hooks and utilities.
-   Provide a solid foundation for our component library, `@tuwaio/nova-react`.

## Core Features

-   **🎨 Styling Primitives:** A single CSS file containing all TUWA design tokens as CSS variables (e.g., `--tuwa-color-primary`).
-   **🛠️ Helper Utilities:** A smart `cn` utility that combines `clsx` and `tailwind-merge` for building dynamic and conflict-free class names.
-   **🎣 Common Hooks:** A collection of generic, reusable React hooks for common tasks.

## Installation

1.  Install the package using your preferred package manager:

    ```bash
    pnpm add @tuwaio/nova-core
    ```

2.  **Import the core styles** into the root of your application's main CSS file (e.g., `globals.css`). **This step is crucial.**

    ```css
    @import "tailwindcss";
    @import '@tuwaio/nova-core/dist/index.css';
    ```

## Usage

You can use the provided styles in two ways: directly with CSS variables (basic) or by integrating them into your theme (recommended).

### Basic Usage (Without `tailwind.config.js`)

With Tailwind CSS v4, you can use the CSS variables from this package directly in your className as arbitrary values. A `tailwind.config.js` file is not required for this to work.

```tsx
// You can use the variables directly
<button className="bg-[var(--tuwa-color-primary)] text-[var(--tuwa-color-foreground)] p-[var(--tuwa-spacing-md)]">
  Click Me
</button>
```

### Recommended Usage (Theming with `tailwind.config.js`)

While a config file is optional in Tailwind v4, creating one to map our CSS variables to Tailwind's theme allows you to use clean, semantic class names. This is the recommended approach for building a consistent design system.

**1. Create or update your `tailwind.config.js`:**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--tuwa-color-primary)',
        secondary: 'var(--tuwa-color-secondary)',
        background: 'var(--tuwa-color-background)',
        foreground: 'var(--tuwa-color-foreground)',
      },
      // ... etc.
    },
  },
  plugins: [],
};
```

**2. Use semantic class names in your components:**

Now your code becomes much cleaner and easier to read.

```tsx
import { cn } from '@tuwaio/nova-core';

export function Button({ intent, className, ...props }) {
  const buttonClasses = cn(
    'px-4 py-2 rounded-md font-semibold transition-colors',
    {
      'bg-primary text-white hover:opacity-90': intent === 'primary',
      'bg-secondary text-foreground hover:opacity-90': intent === 'secondary',
    },
    className,
  );

  return <button className={buttonClasses} {...props} />;
}
```

## Contributing

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## License

This project is licensed under the **Apache-2.0 License**.