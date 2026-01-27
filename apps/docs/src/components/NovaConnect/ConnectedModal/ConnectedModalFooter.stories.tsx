import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedModalFooter } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ConnectedModalFooter> = {
  title: 'Nova Connect/ConnectedModal/ConnectedModalFooter',
  component: ConnectedModalFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Footer component for the connected modal. Requires an active wallet connection via `useSatelliteConnectStore` to render. In isolation (without provider), this component will not render.',
      },
    },
  },
  args: {
    setIsOpen: (isOpen) => alert(`setIsOpen called with: ${isOpen}`),
  },
  argTypes: {
    setIsOpen: {
      action: 'setIsOpen',
      description: 'Callback to control modal visibility.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the container.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-gray-200 rounded-lg bg-white">
        <div className="p-4 text-center text-gray-500 text-sm">
          Note: This component requires an active wallet connection context to render. In Storybook isolation, it may
          not display content.
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedModalFooter>;

/**
 * Default state - requires wallet connection context.
 */
export const Default: Story = {};

/**
 * With custom className.
 */
export const WithCustomClass: Story = {
  args: {
    className: 'bg-gray-50',
  },
};
