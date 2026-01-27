import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollableChainList } from '@tuwaio/nova-connect/components';
import { useState } from 'react';

const mockChains = [1, 10, 137, 42161, 8453, 56, 43114, 250];

const getChainData = (chain: string | number) => ({
  formattedChainId: String(chain),
  chain,
});

const meta: Meta<typeof ScrollableChainList> = {
  title: 'Nova Connect/Chains/ScrollableChainList',
  component: ScrollableChainList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[200px] h-[300px] border border-gray-200 rounded-lg bg-white overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScrollableChainList>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState('1');

    return (
      <ScrollableChainList
        chainsList={mockChains}
        selectValue={selected}
        handleValueChange={setSelected}
        getChainData={getChainData}
        onClose={() => {}}
      />
    );
  },
};

export const FewChains: Story = {
  render: () => {
    const [selected, setSelected] = useState('1');

    return (
      <ScrollableChainList
        chainsList={[1, 10, 137]}
        selectValue={selected}
        handleValueChange={setSelected}
        getChainData={getChainData}
        onClose={() => {}}
      />
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [selected, setSelected] = useState('1');

    return (
      <ScrollableChainList
        chainsList={mockChains}
        selectValue={selected}
        handleValueChange={setSelected}
        getChainData={getChainData}
        onClose={() => {}}
        isLoading={true}
      />
    );
  },
};
