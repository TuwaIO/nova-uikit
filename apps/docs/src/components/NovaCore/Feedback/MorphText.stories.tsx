import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MorphIcon, MorphText, QuasarLoader } from '@tuwaio/nova-core';
import { useEffect, useState } from 'react';

const meta: Meta<typeof MorphText> = {
  title: 'Nova Core/Feedback/MorphText',
  component: MorphText,
  tags: ['autodocs'],
  args: { children: 'Pending' },
};

export default meta;
type Story = StoryObj<typeof MorphText>;

function useCycle<T>(values: readonly T[], everyMs = 1800) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % values.length), everyMs);
    return () => clearInterval(timer);
  }, [values, everyMs]);
  return values[index];
}

const STATUSES = ['Pending', 'Sped up', 'Pending', 'Success', 'Failed', 'Cancelled'] as const;
const UKRAINIAN = ['В очікуванні', 'Прискорено', 'Успішно', 'Помилка', 'Скасовано'] as const;
const CHINESE = ['处理中', '已加速', '成功', '失败', '已取消'] as const;

/** The letters both versions share glide to their new places, the others fade. Change `children` to try your own. */
export const Default: Story = {};

/** In every language of the kit. */
export const Statuses: Story = {
  render: () => {
    const Line = ({ values }: { values: readonly string[] }) => (
      <div className="font-mono text-2xl font-semibold text-[var(--tuwa-text-primary)]">
        <MorphText>{useCycle(values)}</MorphText>
      </div>
    );
    return (
      <div className="flex flex-col gap-4">
        <Line values={STATUSES} />
        <Line values={UKRAINIAN} />
        <Line values={CHINESE} />
      </div>
    );
  },
};

/** A title that may wrap: letter by letter only when both versions fit on one line, a crossfade otherwise. */
export const MayWrap: Story = {
  render: () => {
    const Line = ({ values }: { values: readonly string[] }) => (
      <div className="w-[240px] border border-dashed border-[var(--tuwa-border-primary)] p-2 font-mono text-sm font-semibold text-[var(--tuwa-text-primary)]">
        <MorphText wrap>{useCycle(values)}</MorphText>
      </div>
    );
    return (
      <div className="flex flex-col gap-4">
        <Line values={['Swapping tokens...', 'Swap successful!', 'Swap failed']} />
        <Line
          values={[
            'Paying the invoice of the supplier for the first quarter...',
            'The invoice of the supplier is paid',
            'The payment of the invoice failed',
          ]}
        />
      </div>
    );
  },
};

/** The icon beside the text swaps with a small pop. */
export const WithIcon: Story = {
  render: () => {
    const status = useCycle(['Pending', 'Success', 'Pending', 'Failed'] as const);
    return (
      <div className="flex items-center gap-2 font-mono text-xl font-semibold text-[var(--tuwa-text-primary)]">
        <MorphIcon iconKey={status}>
          {status === 'Pending' ? (
            <QuasarLoader size={24} accent="var(--tuwa-pending-icon)" />
          ) : status === 'Success' ? (
            <CheckCircleIcon className="h-6 w-6 text-[var(--tuwa-success-icon)]" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-[var(--tuwa-error-icon)]" />
          )}
        </MorphIcon>
        <MorphText>{status}</MorphText>
      </div>
    );
  },
};
