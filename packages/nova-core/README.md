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
    @import '@tuwaio/nova-core/dist/index.css';
    ```

## Usage

You can use the provided styles in two ways: directly with CSS variables (basic) or by integrating them into your theme (recommended).

### Usage

For example with Tailwind CSS v4, you can use the CSS variables from this package directly in your className as arbitrary values only need to @import tailwindcss in your .css file.

```tsx
// You can use the variables directly
<button className="bg-[var(--tuwa-color-primary)] text-[var(--tuwa-color-foreground)] p-[var(--tuwa-spacing-md)]">
  Click Me
</button>
```

## Contributing

Contributions are welcome! Please read our main **[Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)**.

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.