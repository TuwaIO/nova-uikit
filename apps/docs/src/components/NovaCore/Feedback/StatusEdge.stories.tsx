import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusEdge, type StatusTone } from '@tuwaio/nova-core';
import { type ReactNode, useEffect, useState } from 'react';

const Card = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[340px] rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] p-4 font-mono text-sm text-[var(--tuwa-text-primary)]">
    {children}
  </div>
);

const meta: Meta<typeof StatusEdge> = {
  title: 'Nova Core/Feedback/StatusEdge',
  component: StatusEdge,
  tags: ['autodocs'],
  args: { tone: 'pending' },
  argTypes: {
    tone: { control: 'select', options: ['pending', 'success', 'error', 'neutral'] },
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  render: (args) => (
    <Card>
      <StatusEdge {...args} />
      The state of an operation
    </Card>
  ),
};

export default meta;
type Story = StoryObj<typeof StatusEdge>;

/** A glint in the pending color runs along the top: it says that work goes on, without promising when it ends. */
export const Pending: Story = {};

/** The share is really known, as confirmations out of those required. */
export const PendingWithProgress: Story = { args: { progress: 2 / 3 } };

/** A result fills the strip and washes the top of the card. */
export const Success: Story = { args: { tone: 'success' } };

export const Error: Story = { args: { tone: 'error' } };

/** A result that is neither, as a replaced transaction. */
export const Neutral: Story = { args: { tone: 'neutral' } };

/** The colors crossfade from one state to the next. */
export const Lifecycle: Story = {
  render: () => {
    const tones: StatusTone[] = ['pending', 'success', 'pending', 'error', 'pending', 'neutral'];
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const timer = setInterval(() => setIndex((current) => (current + 1) % tones.length), 2400);
      return () => clearInterval(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <Card>
        <StatusEdge tone={tones[index]} />
        {tones[index]}
      </Card>
    );
  },
};
