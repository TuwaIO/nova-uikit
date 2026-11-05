import type { Meta, StoryObj } from '@storybook/react-vite';
import { DrawnCheck, DrawnCross, MorphIcon, MorphText, QuasarLoader } from '@tuwaio/nova-core';
import { useEffect, useState } from 'react';

const meta: Meta<typeof DrawnCheck> = {
  title: 'Nova Core/Feedback/DrawnCheck',
  component: DrawnCheck,
  tags: ['autodocs'],
  args: { className: 'h-16 w-16 text-[var(--tuwa-success-icon)]' },
  argTypes: { variant: { control: 'select', options: ['plain', 'disc'] } },
};

export default meta;
type Story = StoryObj<typeof DrawnCheck>;

/** The check mark alone, drawn when it appears. Reload the story to see it again. */
export const Plain: Story = {};

/** On a disc, as in a status. */
export const Disc: Story = { args: { variant: 'disc' } };

/** The cross of a failure, stroke by stroke. */
export const Cross: Story = {
  render: () => <DrawnCross variant="disc" className="h-16 w-16 text-[var(--tuwa-error-icon)]" />,
};

/** How it is used: the wait gives way to the result, which draws itself. */
export const AfterTheWait: Story = {
  render: () => {
    const [isDone, setIsDone] = useState(false);
    useEffect(() => {
      const timer = setInterval(() => setIsDone((done) => !done), 2200);
      return () => clearInterval(timer);
    }, []);
    return (
      <div className="flex items-center gap-2 font-mono text-xl font-semibold text-[var(--tuwa-text-primary)]">
        <MorphIcon iconKey={isDone ? 'done' : 'wait'}>
          {isDone ? (
            <DrawnCheck variant="disc" className="h-6 w-6 text-[var(--tuwa-success-icon)]" />
          ) : (
            <QuasarLoader size={24} accent="var(--tuwa-pending-icon)" />
          )}
        </MorphIcon>
        <MorphText>{isDone ? 'Success' : 'Pending'}</MorphText>
      </div>
    );
  },
};
