import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatedHeight } from '@tuwaio/nova-core';
import { type ComponentProps, useState } from 'react';

const LINES = ['The first line', 'A second line', 'A third line', 'And a fourth one'];

/** A card under which something stands, to show that it moves along with the box. */
const Demo = (args: ComponentProps<typeof AnimatedHeight>) => {
  const [count, setCount] = useState(1);
  return (
    <div className="w-[320px] text-sm text-[var(--tuwa-text-primary)]">
      <button
        type="button"
        className="mb-3 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] px-3 py-1.5"
        onClick={() => setCount((current) => (current % LINES.length) + 1)}
      >
        Lines: {count}
      </button>
      <AnimatedHeight {...args} className="rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-secondary)]">
        <ul className="p-3">
          {LINES.slice(0, count).map((line) => (
            <li key={line} className="py-1">
              {line}
            </li>
          ))}
        </ul>
      </AnimatedHeight>
      <p className="mt-3 text-[var(--tuwa-text-secondary)]">
        This text stands under the box. It glides with the height, and no empty space stays behind.
      </p>
    </div>
  );
};

const meta: Meta<typeof AnimatedHeight> = {
  title: 'Nova Core/Feedback/AnimatedHeight',
  component: AnimatedHeight,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    duration: { control: { type: 'range', min: 0, max: 1, step: 0.05 }, description: 'Seconds of a change of height.' },
    children: { control: false },
  },
  render: (args) => <Demo {...args} />,
};

export default meta;
type Story = StoryObj<typeof AnimatedHeight>;

/**
 * Press the button: the box follows its content, and what is under it moves along.
 */
export const Default: Story = {
  args: {
    duration: 0.25,
  },
};

/**
 * A slower change, to see it.
 */
export const Slow: Story = {
  args: {
    duration: 1,
  },
};
