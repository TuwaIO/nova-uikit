import type { Meta, StoryObj } from '@storybook/react-vite';
import { Disclaimer } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof Disclaimer> = {
  title: 'Nova Connect/ConnectModal/Disclaimer',
  component: Disclaimer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'What is a Wallet?',
    description:
      'A wallet is a secure digital tool for managing your crypto assets and connecting to decentralized applications.',
    learnMoreAction: 'https://ethereum.org/wallets',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text for the disclaimer.',
    },
    description: {
      control: 'text',
      description: 'Description text.',
    },
    learnMoreAction: {
      control: 'text',
      description: 'URL or callback for learn more action.',
    },
    compact: {
      control: 'boolean',
      description: 'Use compact layout.',
    },
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
type Story = StoryObj<typeof Disclaimer>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    compact: true,
  },
};

export const WithCallback: Story = {
  args: {
    learnMoreAction: () => alert('Learn more clicked!'),
  },
};
