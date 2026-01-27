# TUWA Storybook

[![Storybook](https://img.shields.io/badge/Storybook-stories.tuwa.io-FF4785?logo=storybook&logoColor=white)](https://stories.tuwa.io)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

> 🎨 **Interactive Documentation & Design System**
>
> The central Storybook instance for the Nova UI Kit design system. Used to develop, test, and document React components for Web3 applications in the TUWA ecosystem.

---

## ️ About This Project

This is the **interactive documentation hub** for the entire Nova UI Kit ecosystem. It serves as a living style guide and component library for developers, designers, and product managers working with TUWA's components.

### What You'll Find Here

**📦 Component Libraries:**

- **`@tuwaio/nova-core`** - Foundational utilities, theming system, and base components
- **`@tuwaio/nova-connect`** - Complete wallet connection components for EVM and Solana
- **`@tuwaio/nova-transactions`** - Transaction tracking UI with modals, toasts, and progress indicators

**🎯 Key Features:**

- **Live Component Playground** - Interactive controls for testing all component variations
- **Auto-Generated Documentation** - Comprehensive props tables and usage examples
- **Multi-Chain Examples** - Real-world scenarios for EVM and Solana interactions

---

## Getting Started

### 1. Prerequisites

Ensure you have the required tools installed:

```bash
# Check Node.js version (requires 20-24)
node --version

# Check pnpm installation (recommended package manager)
pnpm --version

# Install dependencies from monorepo root
pnpm install
```

### 2. Running Storybook Locally

Start the development server from the **monorepo root**:

```bash
# Start Storybook development server
pnpm --filter @tuwaio/storybook storybook

# Alternative: Run from storybook directory
cd apps/storybook && pnpm storybook
```

**🚀 Storybook will be available at:** [http://localhost:6006](http://localhost:6006)

### 3. Hot Reloading & Development

Storybook automatically watches for changes in:

- Story files (`*.stories.tsx`)
- Storybook configuration files

Make changes to any story, and see updates instantly in your browser!

---

## Writing Stories

We follow Storybook's **Component Story Format (CSF 3.0)** for consistent, maintainable documentation.

### Story Organization

**📁 File Structure:**

```
apps/docs/src/components/[PackageName]/[ComponentsType]/
│   ├── [ComponentName].stories.tsx
```

**📝 Naming Conventions:**

- **Files:** `[ComponentName].stories.tsx`
- **Location:** Same directory as the component
- **Story Titles:** Use hierarchical paths like `Nova Core/Feedback/ToastCloseButton`

### Story Template

Here's our standard template for creating new stories:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastCloseButton } from '@tuwaio/nova-core';

const meta: Meta<typeof ToastCloseButton> = {
  title: 'Nova Core/Feedback/ToastCloseButton',
  component: ToastCloseButton,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers.',
    },
    title: {
      control: 'text',
      description: 'Tooltip text on hover.',
    },
    className: {
      control: 'text',
      description: 'Container class overrides.',
    },
    iconClassName: {
      control: 'text',
      description: 'Icon SVG class overrides.',
    },
    closeToast: {
      action: 'clicked',
      description: 'Function called when clicked.',
    },
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    // Decorator to provide a context for the absolute positioning of the button
    (Story) => (
      <div className="relative w-64 h-20 bg-[var(--tuwa-bg-primary)] border border-[var(--tuwa-border-primary)] rounded-md flex items-center justify-center">
        <span className="text-[var(--tuwa-text-primary)]">Toast Content Here</span>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastCloseButton>;

export const Default: Story = {
  args: {},
};

export const CustomTooltip: Story = {
  args: {
    title: 'Dismiss this alert',
    ariaLabel: 'Dismiss this alert',
  },
};

export const CustomStyle: Story = {
  args: {
    className: 'bg-red-500/10 hover:bg-red-500/20 text-red-500',
  },
};
```

---

## Storybook Structure

Our Storybook is organized into logical sections:

### 📚 Main Sections

| Section                  | Description                                  | Components                                             |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| **🏠 Introduction**      | Getting started guide and ecosystem overview | Welcome, Setup guides                                  |
| **🔌 Nova Connect**      | Wallet connection components                 | ConnectButton, WalletModal, NetworkSelector, etc...    |
| **📊 Nova Transactions** | Transaction tracking UI                      | TransactionModal, ProgressToast, HistoryWidget, etc... |
| **⚙️ Nova Core**         | Foundational utilities and hooks             | Utils, Hooks, Base components                          |

### 🔧 Configuration

**Key Storybook configs:**

- **`.storybook/main.ts`** - Addons, framework setup, and build configuration
- **`.storybook/preview.ts`** - Global decorators, parameters, and theme setup
- **`.storybook/manager.ts`** - Storybook UI customization

---

## Deployment & CI/CD

### 🚀 Automatic Deployment

The Storybook is automatically built and deployed using GitHub Actions:

**Triggers:**

- ✅ Push to `main` branch
- ✅ Pull requests (preview deployments)
- ✅ Manual workflow dispatch

**Live URL:**

- **Production:** [https://stories.tuwa.io](https://stories.tuwa.io)

### 📋 Build Process

```bash
# Build static Storybook for production
pnpm run build-storybook

# Output directory
storybook-static/
```

The build process includes:

1.  **Component Analysis** - Auto-generates component documentation
2.  **Asset Optimization** - Minifies CSS, JS, and images
3.  **Accessibility Audit** - Validates all stories for a11y compliance
4.  **Performance Check** - Ensures optimal loading times

---

## Contributing to Storybook

### 🎯 Best Practices

**Story Writing Guidelines:**

1.  **Show All States** - Include loading, error, empty, and success states
2.  **Use Real Data** - Provide realistic props and mock data
3.  **Document Edge Cases** - Show how components handle unusual inputs
4.  **Mobile-First** - Test responsive behavior across different screen sizes

**Documentation Standards:**

```tsx
// ✅ Good: Descriptive and helpful
export const WithLongWalletAddress: Story = {
  args: {
    connectedAddress: '0x1234567890123456789012345678901234567890',
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests how the component handles very long wallet addresses with proper truncation.',
      },
    },
  },
};

// ❌ Avoid: Vague or missing descriptions
export const Story2: Story = {
  args: {
    address: '0x123...',
  },
};
```

### 🔄 Review Process

1.  **Create Stories** alongside new components
2.  **Test Interactively** in Storybook before submitting PR
3.  **Request Review** from design team for visual approval
4.  **Performance Review** - Ensure stories load quickly

---

## Quick Links & Resources

### 🔗 Essential Links

- **🎨 Live Storybook:** [stories.tuwa.io](https://stories.tuwa.io)
- **📚 Nova UI Kit Repository:** [github.com/TuwaIO/nova-uikit](https://github.com/TuwaIO/nova-uikit)
- **🐛 Report Issues:** [github.com/TuwaIO/nova-uikit/issues](https://github.com/TuwaIO/nova-uikit/issues)
- **📖 Storybook Documentation:** [storybook.js.org/docs](https://storybook.js.org/docs)

### 🛠️ Development Commands

```bash
# Start development server
pnpm storybook

# Build for production
pnpm build-storybook
```

---

## License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](./LICENSE) file for details.
