import type { Meta, StoryObj } from '@storybook/react-vite';
import { NetworkTabs } from '@tuwaio/nova-connect/components';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { useState } from 'react';

const meta: Meta<typeof NetworkTabs> = {
  title: 'Nova Connect/ConnectModal/NetworkTabs',
  component: NetworkTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NetworkTabs>;

export const Default: Story = {
  render: () => {
    const networks = [OrbitAdapter.EVM, OrbitAdapter.SOLANA];
    const [selected, setSelected] = useState<OrbitAdapter | undefined>(OrbitAdapter.EVM);

    return <NetworkTabs networks={networks} selectedAdapter={selected} onSelect={setSelected} />;
  },
};

export const SingleNetwork: Story = {
  render: () => {
    const networks = [OrbitAdapter.EVM];
    const [selected, setSelected] = useState<OrbitAdapter | undefined>(OrbitAdapter.EVM);

    return <NetworkTabs networks={networks} selectedAdapter={selected} onSelect={setSelected} />;
  },
};

export const AllNetworks: Story = {
  render: () => {
    const networks = [OrbitAdapter.EVM, OrbitAdapter.SOLANA];
    const [selected, setSelected] = useState<OrbitAdapter | undefined>(undefined);

    return <NetworkTabs networks={networks} selectedAdapter={selected} onSelect={setSelected} />;
  },
};
