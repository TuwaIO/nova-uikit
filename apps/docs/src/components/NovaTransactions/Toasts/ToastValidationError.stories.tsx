import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastValidationError } from '@tuwaio/nova-transactions';

const meta: Meta<typeof ToastValidationError> = {
  title: 'Nova Transactions/Toasts/ToastValidationError',
  component: ToastValidationError,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    message: 'The title of a transaction must be 3 to 80 characters long.',
  },
  argTypes: {
    message: { control: 'text', description: 'What went wrong, usually `error.message`.' },
    rawError: { control: 'text', description: 'What the copy button writes. Falls back to `message`.' },
    fieldName: { control: 'text', description: 'The input to fix, shown as a badge.' },
    title: { control: 'text', description: 'The title. Defaults to the `validationError.title` label.' },
  },
};

export default meta;
type Story = StoryObj<typeof ToastValidationError>;

/**
 * A field of the transaction failed the validation of Pulsar: the badge says which input to fix.
 */
export const InvalidField: Story = {
  args: {
    fieldName: 'title',
  },
};

/**
 * A `beforeTxProcess` check refused the transaction: there is no field to name.
 */
export const PreflightRejected: Story = {
  args: {
    message: 'Your session has expired. Sign in again to continue.',
  },
};

/**
 * The copy button writes the raw error, for a support request, while the toast shows the readable message.
 */
export const WithRawError: Story = {
  args: {
    message: 'The network does not support this transaction.',
    rawError: 'ChainNotConfiguredError: Chain not configured.\n  at switchChain (viem/actions/wallet)',
  },
};

/**
 * Another title, for an app that names the step.
 */
export const CustomTitle: Story = {
  args: {
    title: 'Check the amount',
    message: 'The amount must be greater than zero.',
    fieldName: 'amount',
  },
};
