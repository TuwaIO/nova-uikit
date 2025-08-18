import type { Meta, StoryObj } from '@storybook/react-vite';
import { HashLink } from '@tuwaio/nova-transactions';

// --- Storybook Meta Configuration ---

const meta: Meta<typeof HashLink> = {
  title: 'UI Components/basic/HashLink',
  component: HashLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
    explorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef',
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: {
        type: 'radio',
      },
      options: ['default', 'compact'],
    },
    label: {
      control: 'text',
    },
    hash: {
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Stories ---

/**
 * The default appearance of the HashLink component.
 */
export const Default: Story = {
  args: {
    label: 'Tx Hash',
  },
};

/**
 * The HashLink component with a shorter hash. The ellipsis is not displayed.
 */
export const ShortHash: Story = {
  args: {
    label: 'Short Hash',
    hash: '0x1234...abcd',
  },
};

/**
 * The HashLink component with a long hash, demonstrating the center ellipsis.
 */
export const LongHash: Story = {
  name: 'With Long Hash',
  args: {
    label: 'Long Hash',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  },
};

/**
 * The compact variant of the HashLink, suitable for smaller spaces.
 */
export const Compact: Story = {
  args: {
    label: 'Compact',
    variant: 'compact',
  },
};

/**
 * The HashLink component displayed without a label.
 */
export const NoLabel: Story = {
  name: 'Without Label',
  args: {
    label: undefined,
  },
};

/**
 * The HashLink component without an explorer URL. The link icon is not rendered.
 */
export const NoExplorerLink: Story = {
  name: 'Without Explorer Link',
  args: {
    label: 'No Link',
    explorerUrl: undefined,
  },
};
