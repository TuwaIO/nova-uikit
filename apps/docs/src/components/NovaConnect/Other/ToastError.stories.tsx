import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastError } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof ToastError> = {
  title: 'Nova Connect/Other/ToastError',
  component: ToastError,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Connection Failed',
    rawError: 'User rejected the request. Error code: 4001',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Error title.',
    },
    rawError: {
      control: 'text',
      description: 'Raw error message (can be copied).',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastError>;

export const Default: Story = {};

export const LongError: Story = {
  args: {
    rawError:
      'Error: Cannot read properties of undefined (reading "address"). Stack trace: at connect (wallet.js:42:15) at handleClick (App.tsx:100:23)',
  },
};

export const WithCopyCallback: Story = {
  args: {
    onCopyComplete: (success) => alert(`Copy ${success ? 'succeeded' : 'failed'}`),
  },
};
