import type { Meta, StoryObj } from '@storybook/react-vite';
import { AboutWallets } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof AboutWallets> = {
  title: 'Nova Connect/ConnectModal/AboutWallets',
  component: AboutWallets,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AboutWallets>;

/**
 * Default AboutWallets slider displaying wallet education content.
 */
export const Default: Story = {};
