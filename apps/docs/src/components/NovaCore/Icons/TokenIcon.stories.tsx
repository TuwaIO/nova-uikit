import type { Meta, StoryObj } from '@storybook/react-vite';
import { TokenIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof TokenIcon> = {
  title: 'Nova Core/Icons/TokenIcon',
  component: TokenIcon,
  tags: ['autodocs'],
  argTypes: {
    symbol: {
      control: 'text',
      description: 'Token symbol, in any letter case (`USDC`, `sol`).',
    },
    variant: {
      control: 'select',
      options: ['background', 'branded', 'mono'],
      description: 'Visual style variant.',
      defaultValue: 'background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof TokenIcon>;

/**
 * USD Coin, a token of Payments.
 */
export const USDC: Story = {
  args: {
    symbol: 'USDC',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * The native token of a network.
 */
export const ETH: Story = {
  args: {
    symbol: 'ETH',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * The symbol is read in any letter case.
 */
export const LowerCaseSymbol: Story = {
  args: {
    symbol: 'sol',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * The `branded` variant.
 */
export const Branded: Story = {
  args: {
    symbol: 'USDT',
    variant: 'branded',
    className: 'w-10 h-10',
  },
};

/**
 * The `mono` variant takes the color of the text.
 */
export const Mono: Story = {
  args: {
    symbol: 'DAI',
    variant: 'mono',
    className: 'w-10 h-10',
  },
};

/**
 * A token with no icon shows the first letter of its symbol.
 */
export const UnknownToken: Story = {
  args: {
    symbol: 'XYZ',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

const PAYMENT_TOKENS = ['USDC', 'USDT', 'EURC', 'PYUSD', 'DAI', 'GHO', 'ETH', 'POL', 'BNB', 'SOL'];

/**
 * The tokens of Payments, with their names as `TokenIcon` reads them.
 */
export const PaymentTokens: Story = {
  render: (args) => (
    <div className="grid grid-cols-5 gap-3">
      {PAYMENT_TOKENS.map((symbol) => (
        <div key={symbol} className="flex flex-col items-center gap-1 text-xs text-[var(--tuwa-text-secondary)]">
          <TokenIcon {...args} symbol={symbol} className="w-10 h-10" />
          {symbol}
        </div>
      ))}
    </div>
  ),
  args: {
    symbol: 'USDC',
    variant: 'background',
  },
};
