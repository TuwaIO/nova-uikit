import type { Meta, StoryObj } from '@storybook/react-vite';
import { BalanceDisplay } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof BalanceDisplay> = {
  title: 'Nova Connect/Primitives/BalanceDisplay',
  component: BalanceDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    balance: {
      control: 'object',
      description: 'Balance data object with value and symbol properties.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading skeleton when true.',
    },
    onRefetch: {
      action: 'refetch',
      description: 'Callback for refetching balance.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BalanceDisplay>;

export const Default: Story = {
  args: {
    balance: {
      value: '1.234',
      symbol: 'ETH',
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    balance: null,
    isLoading: true,
  },
};

export const ZeroBalance: Story = {
  args: {
    balance: {
      value: '0.00',
      symbol: 'ETH',
    },
  },
};

export const LongValue: Story = {
  args: {
    balance: {
      value: '1,234,567.89',
      symbol: 'USDC',
    },
  },
};

export const WithRefresh: Story = {
  args: {
    balance: {
      value: '100.00',
      symbol: 'DAI',
    },
    onRefetch: () => alert('Refetching balance...'),
  },
};

export const NoBalance: Story = {
  args: {
    balance: null,
    isLoading: false,
  },
};
