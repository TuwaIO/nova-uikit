import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusAwareText } from '@tuwaio/nova-transactions';
import { TransactionStatus } from '@tuwaio/pulsar-core';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof StatusAwareText> = {
  title: 'UI Components/basic/StatusAwareText',
  component: StatusAwareText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    // Default source array for status-dependent text
    source: [
      'Transaction is pending...',
      'Transaction successful!',
      'Transaction failed.',
      'Transaction was replaced.',
    ],
    variant: 'description',
    applyColor: false,
  },
  argTypes: {
    txStatus: {
      control: 'select',
      options: [undefined, ...Object.values(TransactionStatus)],
    },
    variant: {
      control: 'radio',
      options: ['title', 'description'],
    },
    applyColor: {
      control: 'boolean',
    },
    source: {
      control: 'object', // Using object control for array/string flexibility
    },
    fallback: {
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Displays the default/pending text. This is the text at index 0 of the `source` array.
 */
export const DefaultPending: Story = {
  args: {
    txStatus: undefined,
  },
};

/**
 * Displays the success text. This is the text at index 1 of the `source` array.
 */
export const Success: Story = {
  args: {
    txStatus: TransactionStatus.Success,
  },
};

/**
 * Displays the failed text. This is the text at index 2 of the `source` array.
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
    txStatus: undefined,
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
    source: 'This is a static message.',
    txStatus: TransactionStatus.Success, // Will be ignored
  },
};

/**
 * Displays the fallback text when the `source` prop is not provided.
 */
export const WithFallback: Story = {
  args: {
    source: undefined,
    fallback: 'This is a fallback message.',
  },
};
