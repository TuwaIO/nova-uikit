import type { Meta, StoryObj } from '@storybook/react-vite';
import { NetworkIcon } from '@tuwaio/nova-core';

const meta: Meta<typeof NetworkIcon> = {
  title: 'Nova Core/Icons/NetworkIcon',
  component: NetworkIcon,
  tags: ['autodocs'],
  argTypes: {
    chainId: {
      control: 'text', // Using text to allow inputs like "1" or "solana" easily
      description: 'Chain ID (number for EVM, string for others).',
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
type Story = StoryObj<typeof NetworkIcon>;

/**
 * Ethereum Mainnet (Chain ID 1).
 */
export const Ethereum: Story = {
  args: {
    chainId: 1,
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * Solana Mainnet ("solana").
 */
export const Solana: Story = {
  args: {
    chainId: 'solana',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * Base (Chain ID 8453).
 */
export const Base: Story = {
  args: {
    chainId: 8453,
    variant: 'branded',
    className: 'w-10 h-10',
  },
};

/**
 * Unknown Chain (Defaults to fallback).
 */
export const Unknown: Story = {
  args: {
    chainId: 99999999,
    className: 'w-10 h-10',
  },
};

/**
 * Solana Devnet (Special visual logic for testnets).
 */
export const SolanaDevnet: Story = {
  args: {
    chainId: 'solana:devnet',
    variant: 'background',
    className: 'w-10 h-10',
  },
};
