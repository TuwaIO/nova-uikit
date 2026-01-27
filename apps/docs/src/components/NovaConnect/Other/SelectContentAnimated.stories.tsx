import * as Select from '@radix-ui/react-select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectContentAnimated } from '@tuwaio/nova-connect/components';

const meta: Meta<typeof SelectContentAnimated> = {
  title: 'Nova Connect/Other/SelectContentAnimated',
  component: SelectContentAnimated,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Select.Root defaultValue="1" open>
        <Select.Trigger className="hidden" />
        <Story />
      </Select.Root>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectContentAnimated>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Select.Item value="1">Option 1</Select.Item>
        <Select.Item value="2">Option 2</Select.Item>
        <Select.Item value="3">Option 3</Select.Item>
      </>
    ),
  },
};

export const WithScrollButtons: Story = {
  args: {
    showScrollButtons: true,
    maxHeight: 150,
    children: (
      <>
        <Select.Item value="1">Option 1</Select.Item>
        <Select.Item value="2">Option 2</Select.Item>
        <Select.Item value="3">Option 3</Select.Item>
        <Select.Item value="4">Option 4</Select.Item>
        <Select.Item value="5">Option 5</Select.Item>
        <Select.Item value="6">Option 6</Select.Item>
      </>
    ),
  },
};
