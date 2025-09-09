import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusAwareText } from '@tuwaio/nova-transactions';
import { TransactionStatus } from '@tuwaio/pulsar-core';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof StatusAwareText> = {
  title: 'Components/Shared/StatusAwareText',
  component: StatusAwareText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    source: [
      'Your transaction is pending...',
      'Your transaction was successful!',
      'Your transaction failed.',
      'Your transaction was replaced.',
    ],
    variant: 'description',
    applyColor: false,
    txStatus: undefined, // Default to pending state
  },
  argTypes: {
    txStatus: {
      control: 'select',
      options: [undefined, ...Object.values(TransactionStatus)],
      description: 'The current status of the transaction, used to select the correct text and color.',
    },
    source: {
      control: 'object',
      description:
        "The source for the text. Can be a single string or an array in the format: `['pending', 'success', 'error', 'replaced']`.",
    },
    fallback: {
      control: 'text',
      description: 'A fallback string to display if `source` is not provided or is invalid.',
    },
    variant: {
      control: 'radio',
      options: ['title', 'description'],
      description: "The visual variant, which determines the base text style ('title' or 'description').",
    },
    applyColor: {
      control: 'boolean',
      description: 'If true, applies a status-specific color to the text.',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for custom styling.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Displays the default/pending text (index 0 of the `source` array).
 */
export const Pending: Story = {
  args: {
    txStatus: undefined,
  },
};

/**
 * Displays the success text (index 1 of the `source` array).
 */
export const Success: Story = {
  args: {
    txStatus: TransactionStatus.Success,
  },
};

/**
 * Displays the failed text (index 2 of the `source` array).
 */
export const Failed: Story = {
  args: {
    txStatus: TransactionStatus.Failed,
  },
};

/**
 * Displays the success text with a status-specific color applied.
 */
export const SuccessWithColor: Story = {
  args: {
    txStatus: TransactionStatus.Success,
    applyColor: true,
  },
};

/**
 * Displays the failed text with a status-specific color applied.
 */
export const FailedWithColor: Story = {
  args: {
    txStatus: TransactionStatus.Failed,
    applyColor: true,
  },
};

/**
 * Renders the component in the 'title' variant, which has a larger, bolder style.
 */
export const TitleVariant: Story = {
  args: {
    txStatus: TransactionStatus.Success,
    variant: 'title',
    source: ['Pending Title', 'Success Title', 'Failed Title', 'Replaced Title'],
  },
};

/**
 * Shows how the component renders when `source` is a simple string instead of an array.
 * The `txStatus` prop has no effect in this case.
 */
export const SimpleStringSource: Story = {
  args: {
    source: 'This is a static, unchanging message.',
    txStatus: TransactionStatus.Success, // This prop will be ignored
  },
};

/**
 * Displays the fallback text when the `source` prop is not provided.
 */
export const WithFallback: Story = {
  args: {
    source: undefined,
    fallback: 'This is the fallback message.',
  },
};
