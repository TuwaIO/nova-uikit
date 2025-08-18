import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletAddressDisplay } from '@tuwaio/nova-transactions';
import { zeroAddress } from 'viem';
import { arbitrum, base, linea, mainnet, optimism, polygon, sepolia } from 'viem/chains';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof WalletAddressDisplay> = {
  title: 'UI Components/WalletInfoModal/WalletAddressDisplay',
  component: WalletAddressDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    address: '0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B',
    chain: mainnet,
  },
  argTypes: {
    address: {
      control: 'text',
      description: 'The wallet address to display',
    },
    chain: {
      control: 'object',
      description: 'The viem Chain object for generating block explorer links',
    },
    className: {
      control: 'text',
      description: 'Optional additional CSS classes for the container',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * Default wallet address display with Ethereum mainnet.
 */
export const Default: Story = {
  args: {},
};

/**
 * Shows the component without a chain (no explorer link).
 */
export const WithoutChain: Story = {
  args: {
    chain: undefined,
  },
};

/**
 * Demonstrates the zero address (burn address).
 */
export const ZeroAddress: Story = {
  args: {
    address: zeroAddress,
  },
};

/**
 * Shows a typical ENS address format.
 */
export const ENSAddress: Story = {
  args: {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  },
};

/**
 * Displays an address on Sepolia testnet.
 */
export const SepoliaTestnet: Story = {
  args: {
    address: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    chain: sepolia,
  },
};

/**
 * Shows an address on Polygon network.
 */
export const PolygonNetwork: Story = {
  args: {
    address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    chain: polygon,
  },
};

/**
 * Demonstrates an address on Arbitrum.
 */
export const ArbitrumNetwork: Story = {
  args: {
    address: '0x9876543210FeDcBa9876543210FeDcBa98765432',
    chain: arbitrum,
  },
};

/**
 * Shows an address on Optimism.
 */
export const OptimismNetwork: Story = {
  args: {
    address: '0x5555666677778888999900001111222233334444',
    chain: optimism,
  },
};

/**
 * Displays an address on Base network.
 */
export const BaseNetwork: Story = {
  args: {
    address: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
    chain: base,
  },
};

/**
 * Shows an address on Linea network.
 */
export const LineaNetwork: Story = {
  args: {
    address: '0xBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb',
    chain: linea,
  },
};

/**
 * Demonstrates various address lengths and formats.
 */
export const AddressFormats: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-gray-600 mb-2">Standard Address</div>
        <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={mainnet} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">All Uppercase</div>
        <WalletAddressDisplay address="0X742D35CC6634C0532925A3B8D5C8268EE5FF9B8B" chain={mainnet} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">All Lowercase</div>
        <WalletAddressDisplay address="0x742d35cc6634c0532925a3b8d5c8268ee5ff9b8b" chain={mainnet} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">Zero Address</div>
        <WalletAddressDisplay address={zeroAddress} chain={mainnet} />
      </div>
    </div>
  ),
};

/**
 * Shows the component with custom styling.
 */
export const WithCustomStyling: Story = {
  args: {
    className: 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200 text-blue-800 shadow-lg',
  },
};

/**
 * Demonstrates the copy functionality states.
 */
export const CopyStates: Story = {
  name: 'Interactive Copy Demo',
  render: () => (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600 mb-4">Click the clipboard icon to test copy functionality</div>
      <div>
        <div className="text-sm text-gray-600 mb-2">Ethereum Mainnet</div>
        <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={mainnet} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">Polygon</div>
        <WalletAddressDisplay address="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12" chain={polygon} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">Without Chain (no explorer link)</div>
        <WalletAddressDisplay address="0x9876543210FeDcBa9876543210FeDcBa98765432" />
      </div>
    </div>
  ),
};

/**
 * Shows multiple addresses in a list layout.
 */
export const AddressList: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Wallet Addresses</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 min-w-0 mr-3">Ethereum:</span>
          <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={mainnet} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 min-w-0 mr-3">Polygon:</span>
          <WalletAddressDisplay address="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12" chain={polygon} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 min-w-0 mr-3">Arbitrum:</span>
          <WalletAddressDisplay address="0x9876543210FeDcBa9876543210FeDcBa98765432" chain={arbitrum} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 min-w-0 mr-3">Base:</span>
          <WalletAddressDisplay address="0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa" chain={base} />
        </div>
      </div>
    </div>
  ),
};

/**
 * Shows compact and expanded variants side by side.
 */
export const SizingComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-600 mb-2">Default Size</div>
        <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={mainnet} />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">With Custom Padding</div>
        <WalletAddressDisplay
          address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B"
          chain={mainnet}
          className="px-4 py-2 text-sm"
        />
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">Compact Version</div>
        <WalletAddressDisplay
          address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B"
          chain={mainnet}
          className="px-2 py-1 text-xs"
        />
      </div>
    </div>
  ),
};

/**
 * Demonstrates different chain explorers and their links.
 */
export const ChainExplorers: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <div className="text-center text-sm text-gray-600 mb-4">
        Click the external link icon to visit different block explorers
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Ethereum (Etherscan)</div>
          <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={mainnet} />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Polygon (PolygonScan)</div>
          <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={polygon} />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Arbitrum (Arbiscan)</div>
          <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={arbitrum} />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Optimism (Optimistic Etherscan)</div>
          <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={optimism} />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Base (BaseScan)</div>
          <WalletAddressDisplay address="0x742d35Cc6634C0532925a3b8D5c8268EE5fF9b8B" chain={base} />
        </div>
      </div>
    </div>
  ),
};
