import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImpersonateForm } from '@tuwaio/nova-connect/components';
import { useState } from 'react';

const meta: Meta<typeof ImpersonateForm> = {
  title: 'Nova Connect/ConnectModal/ImpersonatedForm',
  component: ImpersonateForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form for entering a wallet address to impersonate. Supports ENS and SNS resolution.',
      },
    },
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
type Story = StoryObj<typeof ImpersonateForm>;

export const Default: Story = {
  render: () => {
    const [address, setAddress] = useState('');
    return <ImpersonateForm impersonatedAddress={address} setImpersonatedAddress={setAddress} />;
  },
};

export const WithPrefilledAddress: Story = {
  render: () => {
    const [address, setAddress] = useState('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    return <ImpersonateForm impersonatedAddress={address} setImpersonatedAddress={setAddress} />;
  },
};

export const WithENSName: Story = {
  render: () => {
    const [address, setAddress] = useState('vitalik.eth');
    return <ImpersonateForm impersonatedAddress={address} setImpersonatedAddress={setAddress} />;
  },
};
