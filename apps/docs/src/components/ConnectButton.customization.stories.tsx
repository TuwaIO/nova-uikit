// The theme of the drawing - only loaded for this story file
import '../utils/customization/isometric.css';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectButton } from '@tuwaio/nova-connect/components';

import { ConnectButtonWithTransactions } from '../utils/ConnectButtonWithTransactions';
import { isoConnect, isoConnectButton } from '../utils/customization/isometric';
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
          'ConnectButton in the Isometric style of the playground of the docs: its CSS variables and the `customization` props of every part.',
      },
    },
  },
  decorators: [createStorybookDecorator(isoConnect)],
};

export default meta;
type Story = StoryObj<ExtendedConnectButtonProps>;

/**
 * ConnectButton in the Isometric style, and with it the windows it opens: a line drawing, where a button presses in.
 */
export const Customized: Story = {
  args: {
    customization: isoConnectButton,
  },
};

/**
 * The states of the button about the transactions of the wallet, with the custom status icons. Connect through Impersonate, then
 * press a state.
 */
export const TransactionStates: Story = {
  args: {
    customization: isoConnectButton,
  },
  render: ({ customization }) => <ConnectButtonWithTransactions customization={customization} />,
};
