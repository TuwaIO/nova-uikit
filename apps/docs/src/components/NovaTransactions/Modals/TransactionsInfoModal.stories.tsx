import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsInfoModal } from '@tuwaio/nova-transactions';
import { useState } from 'react';

import { connectedWalletTransactionsMock } from '../../../utils/connectedWalletTransactionsMock';
import { mockEvmAdapter } from '../../../utils/mockAdapters';

const meta: Meta<typeof TransactionsInfoModal> = {
  title: 'Nova Transactions/Modals/TransactionsInfoModal',
  component: TransactionsInfoModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: false,
    connectedWalletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    transactionsPool: {},
    adapter: [mockEvmAdapter],
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    connectedWalletAddress: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TransactionsInfoModal>;

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    // Mock transactions
    const transactionsPool = Object.values(args.transactionsPool).length
      ? args.transactionsPool
      : connectedWalletTransactionsMock('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer bg-blue-500 text-white px-4 novacore:py-2 rounded-[var(--tuwa-rounded-corners)]"
        >
          Open Modal
        </button>
        <TransactionsInfoModal
          {...args}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          connectedWalletAddress={args.connectedWalletAddress}
          // @ts-expect-error - types from mock not exactly correct
          transactionsPool={transactionsPool}
        />
      </>
    );
  },
};

export const Empty: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer bg-blue-500 text-white px-4 novacore:py-2 rounded-[var(--tuwa-rounded-corners)]"
        >
          Open Modal
        </button>

        <TransactionsInfoModal
          {...args}
          isOpen={isOpen}
          connectedWalletAddress={args.connectedWalletAddress}
          setIsOpen={setIsOpen}
          transactionsPool={{}}
        />
      </>
    );
  },
};
