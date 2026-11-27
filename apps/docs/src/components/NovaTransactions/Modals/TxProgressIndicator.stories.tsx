import type { Meta, StoryObj } from '@storybook/react-vite';
import { defaultLabels, type NovaTransactionsLabels, StepProps, TxProgressIndicator } from '@tuwaio/nova-transactions';
import { NovaTransactionsLabelsProvider } from '@tuwaio/nova-transactions/providers';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { iso } from '../../../utils/customization/isometric';
import { withIsometricTheme } from '../../../utils/customization/IsometricFrame';

const meta: Meta<typeof TxProgressIndicator> = {
  title: 'Nova Transactions/Modals/TxProgressIndicator',
  component: TxProgressIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isProcessing: false,
    isSucceed: false,
    isFailed: false,
    isReplaced: false,
    isConfirmed: false,
    isCancelled: false,
  },
  argTypes: {
    isProcessing: {
      control: 'boolean',
      description: 'True if the transaction is being submitted or is pending.',
    },
    isSucceed: {
      control: 'boolean',
      description: 'True if the transaction has successfully completed.',
    },
    isFailed: {
      control: 'boolean',
      description: 'True if the transaction has failed or was reverted.',
    },
    isReplaced: {
      control: 'boolean',
      description: 'True if the transaction was replaced by something else than a speed-up, as by a cancel.',
    },
    isConfirmed: {
      control: 'boolean',
      description: 'True if the transaction is in a block, and it still waits for finality (Solana).',
    },
    isCancelled: {
      control: 'boolean',
      description: 'True if the replacement was a cancel: the last step then reads Cancelled.',
    },
    StepComponent: {
      control: false,
      description: 'An optional custom component to use instead of the default `Step`.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * An interactive story that allows you to toggle between all possible states of the progress indicator.
 */
export const Interactive: Story = {
  render: (args) => {
    const [status, setStatus] = useState<keyof typeof states>('created');

    const states = {
      created: { label: 'Created', props: {} },
      processing: { label: 'Processing', props: { isProcessing: true } },
      confirmed: { label: 'Confirmed', props: { isProcessing: true, isConfirmed: true } },
      succeed: { label: 'Succeed', props: { isSucceed: true } },
      failed: { label: 'Failed', props: { isFailed: true } },
      replaced: { label: 'Replaced', props: { isReplaced: true } },
      cancelled: { label: 'Cancelled', props: { isReplaced: true, isCancelled: true } },
    };

    return (
      <div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
        <TxProgressIndicator {...args} {...states[status].props} />
        <div className="flex flex-wrap justify-center gap-2 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-2">
          {Object.entries(states).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              aria-pressed={status === key}
              onClick={() => setStatus(key as keyof typeof states)}
              className={`cursor-pointer rounded-[var(--tuwa-rounded-corners)] border px-2 py-1 text-xs ${
                status === key
                  ? 'border-[var(--tuwa-text-accent)] bg-[var(--tuwa-bg-primary)] font-semibold text-[var(--tuwa-text-accent)]'
                  : 'border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * With no flags set: only the first step is complete. The tracking modal is already in Processing while the wallet signs.
 */
export const Default: Story = {
  name: 'State: Created',
};

/**
 * The state while the transaction is being submitted or is pending: only the step in progress is active.
 */
export const Processing: Story = {
  name: 'State: Processing',
  args: {
    isProcessing: true,
  },
};

/**
 * The final state for a successfully completed transaction. All steps are marked as complete.
 */
export const Succeed: Story = {
  name: 'State: Succeed',
  args: {
    isSucceed: true,
  },
};

/**
 * The final state for a failed transaction. The last step is marked with an error.
 */
export const Failed: Story = {
  name: 'State: Failed',
  args: {
    isFailed: true,
  },
};

/**
 * Solana: the transaction is in a block and waits for finality.
 */
export const Confirmed: Story = {
  name: 'State: Confirmed',
  args: {
    isProcessing: true,
    isConfirmed: true,
  },
};

/**
 * The final state for a cancelled transaction. The last step says so.
 */
export const Cancelled: Story = {
  name: 'State: Cancelled',
  args: {
    isReplaced: true,
    isCancelled: true,
  },
};

/**
 * An example of replacing the default `Step` component with a completely custom implementation.
 */
export const WithCustomStep: Story = {
  decorators: [withIsometricTheme],
  args: {
    ...Processing.args,
    StepComponent: ({ status, label }: StepProps) => (
      <div className="flex min-w-[80px] flex-1 flex-col items-center gap-2">
        <div
          className={`h-4 w-4 ${iso.surface.border} ${
            status === 'completed'
              ? iso.surface.ink
              : status === 'active'
                ? `${iso.surface.base} ${iso.faces}`
                : iso.surface.base
          }`}
        />
        <span
          className={`text-xs ${status === 'inactive' ? iso.text.secondary : `${iso.text.strong} ${iso.text.primary}`}`}
        >
          {label}
        </span>
      </div>
    ),
  },
};

/** The steps as the Nova Payments checkout labels them, in a language whose words are long. */
const stepLabels = (
  progressIndicator: NovaTransactionsLabels['trackingModal']['progressIndicator'],
  statuses: Pick<NovaTransactionsLabels['statuses'], 'confirmed' | 'failed'>,
): NovaTransactionsLabels => ({
  ...defaultLabels,
  trackingModal: { ...defaultLabels.trackingModal, progressIndicator },
  statuses: { ...defaultLabels.statuses, ...statuses },
});

/**
 * Checks that every label stands under its own step: inside the column of the step, and clear of the label before it.
 *
 * @param canvasElement - The story.
 * @param labels - The labels of the three steps, in order.
 */
async function expectLabelsInTheirSteps(canvasElement: HTMLElement, labels: string[]) {
  const canvas = within(canvasElement);
  const boxes = labels.map((label) => {
    const text = canvas.getByText(label);
    // The column of the step: the first block around its label
    const step = text.closest('div');
    return { label, text: text.getBoundingClientRect(), step: step!.getBoundingClientRect() };
  });
  for (const { label, text, step } of boxes) {
    await expect(text.left, `"${label}" starts inside its step`).toBeGreaterThanOrEqual(step.left - 0.5);
    await expect(text.right, `"${label}" ends inside its step`).toBeLessThanOrEqual(step.right + 0.5);
  }
  for (const [index, { label, text }] of boxes.entries()) {
    if (index === 0) continue;
    const before = boxes[index - 1];
    await expect(text.left, `"${label}" is clear of "${before.label}"`).toBeGreaterThanOrEqual(before.text.right);
  }
}

/** The width of the indicator whose steps are 80 px wide, as in the checkout on a phone 320 px wide. */
const NARROW_PHONE_WIDTH = 272;

/**
 * Labels longer than their steps on a phone 320 px wide, as the Nova Payments checkout gives them in Ukrainian: a word
 * that is longer than its step ("Підтверджується") breaks inside it, on two lines, and does not run under the steps
 * next to it. Before, it ran under "Надіслано" and "Не пройшов".
 */
export const LongLabelsUkrainian: Story = {
  name: 'Long labels: Ukrainian, phone 320 px',
  args: { isFailed: true },
  render: (args) => (
    <NovaTransactionsLabelsProvider
      labels={stepLabels(
        { created: 'Надіслано', processing: 'Підтверджується', succeed: 'Оплачено' },
        { confirmed: 'Підтверджено', failed: 'Не пройшов' },
      )}
    >
      <div lang="uk" style={{ width: NARROW_PHONE_WIDTH }}>
        <TxProgressIndicator {...args} />
      </div>
    </NovaTransactionsLabelsProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectLabelsInTheirSteps(canvasElement, ['Надіслано', 'Підтверджується', 'Не пройшов']);
  },
};

/**
 * The same in German, where the long word is the result: "Fehlgeschlagen" stays under the last step, and "Wird
 * bestätigt" breaks between its words.
 */
export const LongLabelsGerman: Story = {
  name: 'Long labels: German, phone 320 px',
  args: { isFailed: true },
  render: (args) => (
    <NovaTransactionsLabelsProvider
      labels={stepLabels(
        { created: 'Gesendet', processing: 'Wird bestätigt', succeed: 'Bezahlt' },
        { confirmed: 'Bestätigt', failed: 'Fehlgeschlagen' },
      )}
    >
      <div lang="de" style={{ width: NARROW_PHONE_WIDTH }}>
        <TxProgressIndicator {...args} />
      </div>
    </NovaTransactionsLabelsProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectLabelsInTheirSteps(canvasElement, ['Gesendet', 'Wird bestätigt', 'Fehlgeschlagen']);
  },
};
