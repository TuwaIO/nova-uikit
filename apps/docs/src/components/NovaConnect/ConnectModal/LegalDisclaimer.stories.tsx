import type { Meta, StoryObj } from '@storybook/react-vite';
import { LegalDisclaimer } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof LegalDisclaimer> = {
  title: 'Nova Connect/ConnectModal/LegalDisclaimer',
  component: LegalDisclaimer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays Terms of Service and Privacy Policy links. Requires `legal` configuration via `NovaConnectProvider`. Returns null if no legal URLs are configured.',
      },
    },
  },
  args: {
    customization: undefined,
  },
  argTypes: {
    customization: {
      control: 'object',
      description: 'Customization options for styling and behavior.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white p-4">
        <div className="text-center text-gray-500 text-sm mb-4">
          Note: This component requires `legal` configuration via NovaConnectProvider to render.
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LegalDisclaimer>;

/**
 * Default state - requires NovaConnectProvider with legal config.
 */
export const Default: Story = {};

/**
 * With custom separator text via customization.
 */
export const CustomSeparator: Story = {
  args: {
    customization: {
      config: {
        display: {
          separatorText: ' | ',
        },
      },
    },
  },
};
