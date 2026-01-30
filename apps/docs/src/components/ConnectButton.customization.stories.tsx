// Customization CSS - only loaded for this story file
import './../utils/customization/style.css';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectButton } from '@tuwaio/nova-connect/components';

import { connect_button_customization } from '../utils/customization/connect_button';
import { nova_connect_provider_customization } from '../utils/customization/nova_connect_provider';
import {
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
  argTypes: sharedArgTypes,
  args: sharedArgs,
  parameters: {
    ...sharedParameters,
    docs: {
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
