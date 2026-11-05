import type { Meta, StoryObj } from '@storybook/react-vite';
import { NetworkIcon } from '@tuwaio/nova-core';
import { SOLANA_CHAIN_IDS } from '@tuwaio/orbit-core';

const meta: Meta<typeof NetworkIcon> = {
  title: 'Nova Core/Icons/NetworkIcon',
  component: NetworkIcon,
  tags: ['autodocs'],
  argTypes: {
    chainId: {
      control: 'text',
      description: 'Chain ID: digits for an EVM chain (`1`), a network id for others (`solana`).',
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
  // A text control gives strings, and an EVM chain ID is a number
  render: ({ chainId, ...args }) => (
    <NetworkIcon {...args} chainId={/^\d+$/.test(String(chainId)) ? Number(chainId) : chainId} />
  ),
};

export default meta;
type Story = StoryObj<typeof NetworkIcon>;

/**
 * Ethereum Mainnet (Chain ID 1).
 */
export const Ethereum: Story = {
  args: {
    chainId: '1',
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
    chainId: '8453',
    variant: 'branded',
    className: 'w-10 h-10',
  },
};

/**
 * Unknown Chain (Defaults to fallback).
 */
export const Unknown: Story = {
  argTypes: { variant: { control: false } },
  args: {
    chainId: '99999999',
    className: 'w-10 h-10',
  },
};

/**
 * Solana Devnet under its CAIP-2 chain ID with the genesis hash (special visual logic for testnets). The cluster name
 * `solana:devnet` gives the same icon.
 */
export const SolanaDevnet: Story = {
  args: {
    chainId: SOLANA_CHAIN_IDS.devnet,
    variant: 'background',
    className: 'w-10 h-10',
  },
};
