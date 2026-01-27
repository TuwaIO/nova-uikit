import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecentBadge } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof RecentBadge> = {
  title: 'Nova Connect/Primitives/RecentBadge',
  component: RecentBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Recent',
    animated: true,
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Text content inside the badge.',
    },
    animated: {
      control: 'boolean',
      description: 'Enable gradient animation.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecentBadge>;

export const Default: Story = {};

export const StaticBadge: Story = {
  args: {
    animated: false,
  },
};

export const CustomText: Story = {
  args: {
    children: 'Last Used',
  },
};

export const Localized: Story = {
  args: {
    children: 'Недавні',
  },
};
