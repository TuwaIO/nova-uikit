import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectButton } from '@tuwaio/nova-connect/components';

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
