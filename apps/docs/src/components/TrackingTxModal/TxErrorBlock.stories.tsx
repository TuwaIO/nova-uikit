import type { Meta, StoryObj } from '@storybook/react-vite';

import { TxErrorBlock } from './TxErrorBlock';

const meta: Meta<typeof TxErrorBlock> = {
  title: 'UI Components/TrackingTxModal/TxErrorBlock',
  component: TxErrorBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  args: {
    error: 'Transaction failed: insufficient funds for gas',
  },
  argTypes: {
    error: {
      control: 'text',
      description: 'The error message to display. If undefined, nothing is rendered.',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Basic Stories ---

export const Default: Story = {};

// --- Error Message Variations ---

export const ShortError: Story = {
  args: {
    error: 'Insufficient funds',
  },
};

export const LongError: Story = {
  args: {
    error:
      'Transaction failed due to an unexpected error: The transaction could not be processed because the smart contract reverted with the following message: "ERC20: transfer amount exceeds balance". This usually happens when you try to transfer more tokens than you currently have in your wallet.',
  },
};

export const VeryLongError: Story = {
  args: {
    error:
      'Error: Transaction failed with the following details: The smart contract execution reverted with error code 0x08c379a0 and message "SafeMath: subtraction overflow". This error typically occurs when attempting to subtract a larger number from a smaller one in Solidity. The transaction was attempting to transfer 1000.5 tokens from address 0x1234567890abcdef1234567890abcdef12345678 to 0x9876543210fedcba9876543210fedcba98765432, but the sender only had 500.25 tokens available. Gas limit was set to 21000 but execution used 18743 gas before reverting. Block number: 18450123, Transaction hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
};

export const InContainer: Story = {
  render: (args) => (
    <div className="max-w-2xl space-y-4 p-6">
      <h2 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Transaction Details</h2>
      <div className="rounded-lg border border-[var(--tuwa-border-primary)] p-4">
        <p className="mb-4 text-sm text-[var(--tuwa-text-secondary)]">
          Your transaction encountered an error during execution:
        </p>
        <TxErrorBlock {...args} />
      </div>
    </div>
  ),
  args: {
    error: 'Transaction reverted: Insufficient allowance for token transfer',
  },
};

// --- Copy Functionality Demo ---

export const CopyFunctionalityDemo: Story = {
  render: (args) => (
    <div className="space-y-4 p-6 max-w-lg">
      <div className="rounded-lg border border-[var(--tuwa-border-primary)] p-4">
        <h3 className="mb-2 text-lg font-bold text-[var(--tuwa-text-primary)]">Copy Functionality Test</h3>
        <p className="mb-4 text-sm text-[var(--tuwa-text-secondary)]">
          Click the copy button in the error block below to test the clipboard functionality:
        </p>
        <TxErrorBlock {...args} />
        <p className="mt-4 text-xs text-[var(--tuwa-text-tertiary)]">
          💡 Tip: Look for the "Copied!" message that appears after clicking the copy button.
        </p>
      </div>
    </div>
  ),
  args: {
    error: 'Transaction failed: Contract execution reverted with error code 0x08c379a0',
  },
};

// --- Theme Variations ---

export const ThemeComparison: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Light Theme</h3>
        <TxErrorBlock {...args} />
      </div>
      <div className="dark space-y-4 rounded-lg bg-[var(--tuwa-bg-primary)] p-4">
        <h3 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Dark Theme</h3>
        <TxErrorBlock {...args} />
      </div>
    </div>
  ),
  args: {
    error: 'Theme comparison error message',
  },
};
