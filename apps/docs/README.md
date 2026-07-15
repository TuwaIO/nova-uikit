# @tuwaio/storybook

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

`@tuwaio/storybook` is the private documentation hub and interactive development sandbox for the **TUWA Nova UI Kit** ecosystem. It provides the visual playground to test component configurations, review props interfaces, and verify internationalization and theme variables across different responsive layouts.

---

## 🏛️ Monorepo Integration

Storybook imports code directly from local packages inside the monorepo:

- **🎨 `@tuwaio/nova-core` (UI Core - L6)** - Primary styling variables, base hooks, and overlay wrappers.
- **🔌 `@tuwaio/nova-connect` (UI Components - L7)** - Multi-chain wallet connection modals, buttons, and state connectors.
- **📊 `@tuwaio/nova-transactions` (UI Components - L7)** - Transaction monitoring feeds, toast panels, and status alerts.

---

## 🚀 Getting Started

### 1. Installation

From the monorepo root directory, install all dependencies:

```bash
pnpm install
```

### 2. Run Local Development Server

Launch the Storybook server (which will watch local files and reload automatically):

```bash
pnpm storybook
```

Storybook will compile and open at: **[http://localhost:6006](http://localhost:6006)**.

---

## 📝 Writing Stories (CSF 3.0)

We write story modules using Storybook's **Component Story Format (CSF 3.0)** to keep sandbox declarations concise and readable:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastCloseButton } from '@tuwaio/nova-core';

const meta: Meta<typeof ToastCloseButton> = {
  title: 'Nova Core/Feedback/ToastCloseButton',
  component: ToastCloseButton,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: { control: 'text' },
    title: { control: 'text' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToastCloseButton>;

export const Default: Story = {
  args: {
    title: 'Dismiss',
    ariaLabel: 'Dismiss dialog',
  },
};
```

---

## 🛠️ Package Workflow Commands

Execute these scripts from the monorepo root to build or compile the documentation portal:

| Command                    | Action                                                      |
| :------------------------- | :---------------------------------------------------------- |
| **`pnpm storybook`**       | Launches Storybook in local development mode at port `6006` |
| **`pnpm build-storybook`** | Compiles static production bundle into `storybook-static/`  |

---

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](./LICENSE) file for details.
