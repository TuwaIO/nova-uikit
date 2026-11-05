import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectButton } from '@tuwaio/nova-connect/components';

import { ConnectButtonWithTransactions } from '../utils/ConnectButtonWithTransactions';
import {
  createStorybookDecorator,
  ExtendedConnectButtonProps,
  sharedArgs,
  sharedArgTypes,
  sharedParameters,
} from '../utils/storybook-providers';

const meta: Meta<ExtendedConnectButtonProps> = {
  title: 'ConnectButton',
  component: ConnectButton,
  tags: ['autodocs'],
  argTypes: sharedArgTypes,
  args: sharedArgs,
  parameters: sharedParameters,
  decorators: [createStorybookDecorator()],
};

export default meta;
type Story = StoryObj<ExtendedConnectButtonProps>;

/**
 * Default state - shows "Connect Wallet" when disconnected.
 * Requires NovaConnectProvider context to function properly.
 */
export const Default: Story = {};

/**
 * What the connected button says about the transactions of the wallet: the address morphs into the state and back. Connect through
 * Impersonate, then press a state: the transaction waits for a moment, then gets its result.
 */
export const TransactionStates: Story = {
  render: ({ className, customization }) => (
    <ConnectButtonWithTransactions className={className} customization={customization} />
  ),
};
