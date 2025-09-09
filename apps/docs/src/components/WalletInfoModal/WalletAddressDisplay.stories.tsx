import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletAddressDisplay } from '@tuwaio/nova-transactions';
import { zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletAddressDisplay> = {
  title: 'Components/Shared/WalletAddressDisplay',
  component: WalletAddressDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    explorerUrl: mainnet.blockExplorers.default.url,
  },
  argTypes: {
    address: {
      control: 'text',
      description: 'The full wallet address to display.',
    },
    explorerUrl: {
      control: 'text',
      description: 'The base URL for the block explorer. If not provided, the explorer link will not be rendered.',
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
 * The default appearance of the component with an address, copy button, and explorer link.
 */
export const Default: Story = {};

/**
 * The component rendered without an `explorerUrl`. The link icon is correctly hidden,
 * but the copy functionality remains.
 */
export const WithoutExplorerLink: Story = {
  args: {
    explorerUrl: undefined,
  },
};

/**
 * A specific example showing the zero address (often used as a burn address).
 */
export const ZeroAddress: Story = {
  args: {
    address: zeroAddress,
  },
};

/**
 * An example demonstrating how to apply custom styling to the component's container.
 */
export const WithCustomStyling: Story = {
  args: {
    className: 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200 text-blue-800 shadow-lg',
  },
};

/**
 * A story to showcase multiple addresses in a list, a common use case in transaction histories or UIs.
 */
export const ListExample: Story = {
  render: (args) => (
    <div className="w-80 space-y-3 rounded-lg bg-[var(--tuwa-bg-primary)] p-4 shadow-sm">
      <h3 className="font-semibold text-[var(--tuwa-text-primary)]">Addresses</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--tuwa-text-secondary)]">From:</span>
        <WalletAddressDisplay {...args} address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--tuwa-text-secondary)]">To:</span>
        <WalletAddressDisplay {...args} address="0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--tuwa-text-secondary)]">Contract:</span>
        <WalletAddressDisplay {...args} address="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" />
      </div>
    </div>
  ),
};
