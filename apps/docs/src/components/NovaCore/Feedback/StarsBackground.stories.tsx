import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarsBackground } from '@tuwaio/nova-core';

const meta: Meta<typeof StarsBackground> = {
  title: 'Nova Core/Feedback/StarsBackground',
  component: StarsBackground,
  tags: ['autodocs'],
  argTypes: {
    starsCount: {
      control: { type: 'number', min: 50, max: 1000, step: 50 },
      description: 'Number of stars to render.',
      defaultValue: 200,
    },
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'dark', // Best viewed on dark background
    },
  },
  // Wrapper to give it some height in Storybook
  decorators: [
    (Story) => (
      <div className="w-full h-[400px] relative bg-gray-300 overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StarsBackground>;

/**
 * Default constellation (200 stars).
 */
export const Default: Story = {
  args: {
    starsCount: 200,
  },
};

/**
 * Sparse Field (50 stars).
 */
export const Sparse: Story = {
  args: {
    starsCount: 50,
  },
};

/**
 * Dense Field (500 stars).
 */
export const Dense: Story = {
  args: {
    starsCount: 500,
  },
};
