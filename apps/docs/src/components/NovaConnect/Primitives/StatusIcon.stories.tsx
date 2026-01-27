import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIcon } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof StatusIcon> = {
  title: 'Nova Connect/Primitives/StatusIcon',
  component: StatusIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    txStatus: 'succeed',
    colorVar: 'var(--tuwa-success-text)',
    children: null,
  },
  argTypes: {
    txStatus: {
      control: 'select',
      options: ['succeed', 'failed', 'replaced'],
      description: 'Transaction status type.',
    },
    colorVar: {
      control: 'text',
      description: 'CSS color variable for the icon.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusIcon>;

export const Success: Story = {
  args: {
    txStatus: 'succeed',
    colorVar: 'var(--tuwa-success-text)',
  },
};

export const Failed: Story = {
  args: {
    txStatus: 'failed',
    colorVar: 'var(--tuwa-error-text)',
  },
};

export const Replaced: Story = {
  args: {
    txStatus: 'replaced',
    colorVar: 'var(--tuwa-warning-text)',
  },
};
