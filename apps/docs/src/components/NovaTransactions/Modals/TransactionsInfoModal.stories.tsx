import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsInfoModal } from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import dayjs from 'dayjs';
import { useState } from 'react';

import { mockEvmAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

const meta: Meta<typeof TransactionsInfoModal> = {
  title: 'Nova Transactions/Modals/TransactionsInfoModal',
  component: TransactionsInfoModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: true,
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
    const transactionsPool = {
      ...[
        createMockTx(OrbitAdapter.EVM, {
          status: TransactionStatus.Success,
          localTimestamp: dayjs().subtract(2, 'minutes').unix(),
        }),
        createMockTx(OrbitAdapter.EVM, {
          status: TransactionStatus.Failed,
          localTimestamp: dayjs().subtract(5, 'hours').unix(),
        }),
      ].reduce((pool, tx) => ({ ...pool, [tx.txKey]: tx }), {}),
    };

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="novacore:bg-blue-500 novacore:text-white novacore:px-4 novacore:py-2 novacore:rounded"
        >
          Open Modal
        </button>
        <TransactionsInfoModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} transactionsPool={transactionsPool} />
      </>
    );
  },
};

export const Empty: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);
    return <TransactionsInfoModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} transactionsPool={{}} />;
  },
};
