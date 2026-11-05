import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ToastTransaction,
  TransactionStatusBadge,
  TxProgressIndicator,
  TxStatusVisual,
} from '@tuwaio/nova-transactions';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { TransactionStatus } from '@tuwaio/pulsar-core';
import { useEffect, useState } from 'react';

import { mockEvmAdapter } from '../../../utils/mockAdapters';
import { createMockTx } from '../../../utils/mockTransactions';

const WALLET = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const OLD_HASH = '0x1111111111111111111111111111111111111111111111111111111111111111';
const NEW_HASH = '0x2222222222222222222222222222222222222222222222222222222222222222';

const base = { from: WALLET, sender: WALLET, nonce: 7, maxFeePerGas: '1000', maxPriorityFeePerGas: '100' };

/** The scenarios a toast can live through, as what the Pulsar store holds at each step. */
const SCENARIOS = {
  'Success with confirmations': [
    { ...base, pending: true, requiredConfirmations: 3 },
    { ...base, pending: true, requiredConfirmations: 3, confirmations: 1 },
    { ...base, pending: true, requiredConfirmations: 3, confirmations: 2 },
    { ...base, pending: false, requiredConfirmations: 3, confirmations: 3, status: TransactionStatus.Success },
  ],
  Failed: [
    { ...base, pending: true },
    { ...base, pending: false, status: TransactionStatus.Failed, isError: true },
  ],
  'Sped up, then success': [
    { ...base, txKey: OLD_HASH, hash: OLD_HASH, pending: true },
    { ...base, txKey: NEW_HASH, hash: NEW_HASH, replaces: OLD_HASH, pending: true, confirmations: 1 },
    { ...base, txKey: NEW_HASH, hash: NEW_HASH, replaces: OLD_HASH, pending: false, status: TransactionStatus.Success },
  ],
  Cancelled: [
    { ...base, txKey: OLD_HASH, hash: OLD_HASH, pending: true },
    {
      ...base,
      txKey: OLD_HASH,
      hash: OLD_HASH,
      pending: false,
      status: TransactionStatus.Replaced,
      replacedTxHash: NEW_HASH,
      replacedReason: 'cancelled',
    },
  ],
} as const;

type ScenarioName = keyof typeof SCENARIOS;

function Lifecycle({ scenario, everyMs }: { scenario: ScenarioName; everyMs: number }) {
  const steps = SCENARIOS[scenario];
  const [index, setIndex] = useState(0);
  const step = steps[Math.min(index, steps.length - 1)];

  useEffect(() => {
    // Rests on the result a little longer than on a step, then starts over
    const timer = setTimeout(
      () => setIndex((current) => (current + 1) % steps.length),
      index === steps.length - 1 ? everyMs * 1.6 : everyMs,
    );
    return () => clearTimeout(timer);
  }, [index, steps.length, everyMs]);

  const tx = createMockTx(OrbitAdapter.EVM, step);
  const isSucceed = tx.status === TransactionStatus.Success;
  const isFailed = tx.status === TransactionStatus.Failed;
  const isReplaced = tx.status === TransactionStatus.Replaced;

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="w-full max-w-[380px]">
        <ToastTransaction
          tx={tx}
          adapter={[mockEvmAdapter]}
          connectedWalletAddress={WALLET}
          openTxInfoModal={() => {}}
        />
      </div>
      <div className="flex w-full max-w-[380px] flex-col gap-4">
        <TxStatusVisual isProcessing={tx.pending} isSucceed={isSucceed} isFailed={isFailed} isReplaced={isReplaced} />
        <TxProgressIndicator
          isProcessing={tx.pending}
          isSucceed={isSucceed}
          isFailed={isFailed}
          isReplaced={isReplaced}
        />
        <div>
          <TransactionStatusBadge tx={tx} />
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof Lifecycle> = {
  title: 'Nova Transactions/Toasts/Transaction lifecycle',
  component: Lifecycle,
  parameters: { layout: 'padded' },
  args: { scenario: 'Success with confirmations', everyMs: 2200 },
  argTypes: {
    scenario: { control: 'select', options: Object.keys(SCENARIOS) },
    everyMs: { control: { type: 'range', min: 800, max: 5000, step: 200 } },
  },
};

export default meta;
type Story = StoryObj<typeof Lifecycle>;

/**
 * The strip fills up with the confirmations, the status line morphs and the result washes the top of the toast. Everything
 * here is driven by the same fields of the transaction that the Pulsar store updates.
 */
export const SuccessWithConfirmations: Story = {};

export const Failed: Story = { args: { scenario: 'Failed' } };

/** One toast carries the whole operation: it goes on under the new hash and says which one it replaced. */
export const SpedUp: Story = { args: { scenario: 'Sped up, then success' } };

/** The money did not move: gray, not red. */
export const Cancelled: Story = { args: { scenario: 'Cancelled' } };
