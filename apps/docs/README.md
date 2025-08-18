# TUWA Storybook

> 🔴 **Confidential: Internal Development & Documentation Tool**
>
> This app contains the Storybook instance for the TUWA design system. It is used to develop, test, and visualize our React components in isolation.

## About This Project

This is the central, interactive documentation for our entire Nova UI component ecosystem. It serves as a "living" style guide for developers, designers, and product managers.

Here we document components from packages like:
-   `@tuwaio/nova-core`
-   `@tuwaio/nova-transactions`

## Getting Started

### 1. Prerequisites
Ensure you have installed all dependencies from the root of the monorepo:
```bash
# Run from the monorepo root
pnpm install
```

### 2. Running Storybook Locally
To start the Storybook development server, run the following command from the **root of the monorepo**:

```bash
pnpm --filter @tuwaio/storybook storybook
```
Storybook will be available at **http://localhost:6006**.

## Writing Stories

We use the Component Story Format (CSF) for all our stories. When you create a new component, please create a corresponding story file next to it.

-   **File Naming:** `[ComponentName].stories.tsx`
-   **Location:** Place the story file in the same directory as the component itself (e.g., `packages/nova-transactions/src/components/Button/Button.stories.tsx`).

### Story Template
Here is a basic template to get you started:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button'; // Import your component

// More on how to set up stories at: [https://storybook.js.org/docs/writing-stories#default-export](https://storybook.js.org/docs/writing-stories#default-export)
const meta = {
  title: 'Components/Button', // How it will appear in the Storybook sidebar
  component: Button,
  tags: ['autodocs'], // Enables automatic documentation generation
  argTypes: {
    // Define controls for your component's props
    intent: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: [https://storybook.js.org/docs/writing-stories/args](https://storybook.js.org/docs/writing-stories/args)
export const Primary: Story = {
  args: {
    intent: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    children: 'Secondary Button',
  },
};
```

## Deployment

The Storybook is automatically built and deployed on every push to the `main` branch.

-   **Live Storybook URL:** [**https://stories.tuwa.io**] ## Quick Links

## 📄 License

This project is licensed under the **Apache-2.0 License**.