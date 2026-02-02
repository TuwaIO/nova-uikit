import type { Meta, StoryObj } from '@storybook/react-vite';
import { HashLink } from '@tuwaio/nova-transactions';

const meta: Meta<typeof HashLink> = {
  title: 'Nova Transactions/Primitives/HashLink',
  component: HashLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    hash: '0x7a2de40d55c1e2b3e9e3f4b1d7a0c8e6b9c5b2a12b4d7f8e9f0a1b3c5d7e9f0a',
    variant: 'default',
    label: 'Tx Hash',
    explorerUrl: 'https://sepolia.etherscan.io/tx/0x7a2de40d55c1e2b3e9e3f4b1d7a0c8e6b9c5b2a12b4d7f8e9f0a1b3c5d7e9f0a',
  },
  argTypes: {
    hash: {
      control: 'text',
      description: 'The full hash string to display and copy.',
    },
    label: {
      control: 'text',
      description: 'An optional label to display before the hash.',
    },
    explorerUrl: {
      control: 'text',
      description: 'An optional URL to a block explorer. If provided, the hash becomes a link.',
    },
    variant: {
      control: 'radio',
      options: ['default', 'compact'],
      description: "The visual style of the component. 'default' is larger, 'compact' is smaller.",
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default appearance of the `HashLink` component with a label and explorer link.
 */
export const Default: Story = {
  args: {
    label: 'Default',
  },
};

/**
 * The compact variant of the `HashLink`, suitable for smaller spaces or less prominent display.
 */
export const Compact: Story = {
  args: {
    label: 'Compact',
    variant: 'compact',
  },
};

/**
 * The `HashLink` component displayed without a label.
 */
export const NoLabel: Story = {
  args: {
    label: undefined,
  },
};

/**
 * The `HashLink` component without an `explorerUrl`. It displays the hash as plain text
 * but retains the copy-to-clipboard functionality.
 */
export const NoExplorerLink: Story = {
  name: 'Without Explorer Link',
  args: {
    label: 'No Link',
    explorerUrl: undefined,
  },
};
