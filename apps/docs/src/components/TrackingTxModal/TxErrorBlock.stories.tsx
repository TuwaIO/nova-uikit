import type { Meta, StoryObj } from '@storybook/react-vite';
import { TxErrorBlock } from '@tuwaio/nova-transactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof TxErrorBlock> = {
  title: 'Components/Shared/TxErrorBlock',
  component: TxErrorBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    error:
      'Transaction failed: insufficient funds for gas. The operation requires more gas than you have available in your wallet.',
  },
  argTypes: {
    error: {
      control: 'text',
      description: 'The error message to display. If undefined or empty, the component will not render.',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default appearance of the error block with a typical error message.
 */
export const Default: Story = {};

/**
 * An example with a very long error message to demonstrate the scroll functionality
 * of the text area.
 */
export const LongError: Story = {
  args: {
    error:
      'Error: Transaction failed with the following details: The smart contract execution reverted with error code 0x08c379a0 and message "SafeMath: subtraction overflow". This error typically occurs when attempting to subtract a larger number from a smaller one in Solidity. The transaction was attempting to transfer 1000.5 tokens from address 0x123... to 0x987..., but the sender only had 500.25 tokens available. Gas limit was set to 21000 but execution used 18743 gas before reverting. Block number: 18450123.',
  },
};

/**
 * This story demonstrates the interactive copy functionality. Click the copy icon
 * to see it change to a checkmark.
 */
export const InteractiveCopy: Story = {
  name: 'Interactive (Copy)',
  args: {
    error: 'Click the icon to copy this message!',
  },
};

/**
 * An example of applying custom styling to the component's container.
 */
export const WithCustomStyling: Story = {
  args: {
    className: 'border-2 border-orange-400 bg-orange-100 shadow-lg',
  },
};
