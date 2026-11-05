// Customization CSS - only loaded for this story file
import '../utils/customization/style.css';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectButton } from '@tuwaio/nova-connect/components';

import { ConnectButtonWithTransactions } from '../utils/ConnectButtonWithTransactions';
import { connect_button_customization } from '../utils/customization/connect_button';
import { nova_connect_provider_customization } from '../utils/customization/nova_connect_provider';
import {
  CONNECT_BUTTON_SOURCE,
  createStorybookDecorator,
  ExtendedConnectButtonProps,
  sharedArgs,
  sharedArgTypes,
  sharedParameters,
} from '../utils/storybook-providers';

const meta: Meta<ExtendedConnectButtonProps> = {
  title: 'ConnectButton/Customization',
  component: ConnectButton,
  tags: ['autodocs'],
  // `classNames.button` of the customization replaces `className`, so that control would do nothing here
  argTypes: { ...sharedArgTypes, className: { table: { disable: true } } },
  args: sharedArgs,
  parameters: {
    ...sharedParameters,
    docs: {
      source: {
        code: CONNECT_BUTTON_SOURCE.replace(
          '<NovaConnectProvider',
          '<NovaConnectProvider\n  customization={customization}',
        ).replace('<ConnectButton />', '<ConnectButton customization={connectButtonCustomization} />'),
      },
      description: {
        component:
          'ConnectButton with custom styling. This story demonstrates how to apply custom CSS variables and component customization.',
      },
    },
  },
  decorators: [createStorybookDecorator(nova_connect_provider_customization)],
};

export default meta;
type Story = StoryObj<ExtendedConnectButtonProps>;

/**
 * Customized ConnectButton with custom theme applied.
 * Uses CSS variables from style.css and component customization props.
 */
export const Customized: Story = {
  args: {
    customization: connect_button_customization,
  },
};

/**
 * The states of the button about the transactions of the wallet, with the custom status icons. Connect through Impersonate, then
 * press a state.
 */
export const TransactionStates: Story = {
  args: {
    customization: connect_button_customization,
  },
  render: ({ customization }) => <ConnectButtonWithTransactions customization={customization} />,
};
