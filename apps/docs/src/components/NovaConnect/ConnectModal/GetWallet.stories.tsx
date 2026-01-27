import type { Meta, StoryObj } from '@storybook/react-vite';
import { GetWallet } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof GetWallet> = {
  title: 'Nova Connect/ConnectModal/GetWallet',
  component: GetWallet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    compact: false,
    enableAnimations: true,
    showStarsBackground: true,
  },
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'Use compact layout.',
    },
    enableAnimations: {
      control: 'boolean',
      description: 'Enable wallet icon animations.',
    },
    showStarsBackground: {
      control: 'boolean',
      description: 'Show stars background effect.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] h-[400px] border border-gray-200 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GetWallet>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    compact: true,
  },
};

export const NoAnimations: Story = {
  args: {
    enableAnimations: false,
  },
};

export const NoBackground: Story = {
  args: {
    showStarsBackground: false,
  },
};
