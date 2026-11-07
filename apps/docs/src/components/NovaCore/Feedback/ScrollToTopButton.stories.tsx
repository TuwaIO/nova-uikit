import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollToTopButton } from '@tuwaio/nova-core';

const meta: Meta<typeof ScrollToTopButton> = {
  title: 'Nova Core/Feedback/ScrollToTopButton',
  component: ScrollToTopButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Appears further down a page and takes it back to the top. With reduced motion the arrow stands still and the page jumps at once.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollToTopButton>;

/** Scroll this frame down: the button appears after 200 px here. */
export const Default: Story = {
  args: { label: 'Back to top', visibleAfter: 200 },
  render: (args) => (
    <div className="h-[1600px] p-6 text-sm text-[var(--tuwa-text-secondary)]">
      Scroll down.
      <ScrollToTopButton {...args} />
    </div>
  ),
};
