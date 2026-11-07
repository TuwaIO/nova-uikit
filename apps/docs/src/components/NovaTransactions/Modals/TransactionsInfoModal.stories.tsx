import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionsInfoModal } from '@tuwaio/nova-transactions';
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';

import { connectedWalletTransactionsMock } from '../../../utils/connectedWalletTransactionsMock';
import { mockEvmAdapter, mockSolanaAdapter } from '../../../utils/mockAdapters';

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

const OPEN_BUTTON_CLASSES =
  'cursor-pointer rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-button-gradient-from)] px-4 py-2 text-[var(--tuwa-text-on-accent)] transition-colors hover:bg-[var(--tuwa-button-gradient-from-hover)]';

/** The modal and the button that opens it. */
const WithOpenButton = ({
  args,
  isOpen,
  setIsOpen,
  walletAddress,
}: {
  args: Story['args'];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  walletAddress: string;
}) => (
  <>
    <button onClick={() => setIsOpen(true)} className={OPEN_BUTTON_CLASSES}>
      Open Modal
    </button>
    <TransactionsInfoModal
      {...args}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      connectedWalletAddress={walletAddress}
      // @ts-expect-error - types from mock not exactly correct
      transactionsPool={connectedWalletTransactionsMock(walletAddress)}
      adapter={args?.adapter ?? [mockEvmAdapter]}
    />
  </>
);

/** The history of an EVM wallet. A sped-up operation is one row, opened on its latest record. The `isOpen` control and the button change the same state. */
export const Default: Story = {
  argTypes: { transactionsPool: { control: false }, connectedWalletAddress: { control: false } },
  render: (args) => {
    // Storybook allows its hooks only in the story function itself
    const [{ isOpen }, updateArgs] = useArgs<{ isOpen: boolean }>();
    return (
      <WithOpenButton
        args={args}
        isOpen={isOpen}
        setIsOpen={(open) => updateArgs({ isOpen: open })}
        walletAddress="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      />
    );
  },
};

/** The history of a Solana wallet. */
export const SolanaWallet: Story = {
  args: { adapter: [mockSolanaAdapter] },
  argTypes: { transactionsPool: { control: false }, connectedWalletAddress: { control: false } },
  render: (args) => {
    const [{ isOpen }, updateArgs] = useArgs<{ isOpen: boolean }>();
    return (
      <WithOpenButton
        args={args}
        isOpen={isOpen}
        setIsOpen={(open) => updateArgs({ isOpen: open })}
        walletAddress="AobnbeZ6QB2xdnPzBkaw2Stea5trqhamaoKyVMYenV3u"
      />
    );
  },
};

/** A wallet without transactions. */
export const Empty: Story = {
  argTypes: { isOpen: { control: false }, transactionsPool: { control: false } },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)} className={OPEN_BUTTON_CLASSES}>
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

/**
 * Opened on one transaction (`selectedTxKey`, as the toasts open it): its details under the header of the modal, with
 * a back button to the list.
 */
export const OpenOnTransaction: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    const transactionsPool = connectedWalletTransactionsMock('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    return (
      <>
        <button onClick={() => setIsOpen(true)} className={OPEN_BUTTON_CLASSES}>
          Open Modal
        </button>
        <TransactionsInfoModal
          {...args}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedTxKey="0x60277dbf4ef22811d954e73ff4dd3493d8e2d20235138a8daf42fa202869bb29"
          connectedWalletAddress={args.connectedWalletAddress}
          // @ts-expect-error - types from mock not exactly correct
          transactionsPool={transactionsPool}
        />
      </>
    );
  },
};
