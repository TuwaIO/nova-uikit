import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChainListRenderer } from '@tuwaio/nova-connect/components';

const mockChainsList = [1, 10, 137, 42161];

const mockGetChainData = (chain: string | number) => ({
  formattedChainId: chain,
  chain: chain,
});

const meta: Meta<typeof ChainListRenderer> = {
  title: 'Nova Connect/Chains/ChainListRenderer',
  component: ChainListRenderer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    chainsList: mockChainsList,
    selectValue: '1',
    handleValueChange: (newChainId) => alert(`Selected chain: ${newChainId}`),
    getChainData: mockGetChainData,
    onClose: () => alert('Close triggered'),
    isMobile: false,
  },
  argTypes: {
    chainsList: {
      control: false,
      description: 'Array of chain IDs to render.',
    },
    selectValue: {
      control: 'text',
      description: 'Currently selected chain value as string.',
    },
    isMobile: {
      control: 'boolean',
      description: 'Whether to render mobile layout.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading state.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] border border-gray-200 rounded-lg p-2 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChainListRenderer>;

export const Default: Story = {};

export const MobileLayout: Story = {
  args: {
    isMobile: true,
  },
};

export const SelectedOptimism: Story = {
  args: {
    selectValue: '10',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'Failed to load chains. Please try again.',
  },
};

export const Empty: Story = {
  args: {
    chainsList: [],
  },
};

export const ManyChains: Story = {
  args: {
    chainsList: [1, 10, 137, 42161, 56, 43114, 250, 100, 8453, 324],
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] h-[300px] border border-gray-200 rounded-lg overflow-y-auto bg-white">
        <Story />
      </div>
    ),
  ],
};
