import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastCloseButton } from '@tuwaio/nova-core';
import { useState } from 'react';

import { iso } from '../../../utils/customization/isometric';
import { withIsometricTheme } from '../../../utils/customization/IsometricFrame';

const meta: Meta<typeof ToastCloseButton> = {
  title: 'Nova Core/Feedback/ToastCloseButton',
  component: ToastCloseButton,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers.',
    },
    title: {
      control: 'text',
      description: 'Tooltip text on hover.',
    },
    className: {
      control: 'text',
      description: 'Container class overrides.',
    },
    iconClassName: {
      control: 'text',
      description: 'Icon SVG class overrides.',
    },
    closeToast: {
      action: 'clicked',
      description: 'Function called when clicked.',
    },
  },
  parameters: {
    layout: 'centered',
  },
  // In an app `closeToast` comes from react-toastify. Here it hides the mock toast and is reported in the Actions panel.
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);
    if (!isOpen) {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] px-3 py-2 text-sm text-[var(--tuwa-text-primary)]"
        >
          Show again
        </button>
      );
    }
    return (
      <div className="relative w-64 h-20 bg-[var(--tuwa-bg-primary)] border border-[var(--tuwa-border-primary)] rounded-[var(--tuwa-rounded-corners)] flex items-center justify-center">
        <span className="text-[var(--tuwa-text-primary)]">Toast Content Here</span>
        <ToastCloseButton
          {...args}
          closeToast={(event) => {
            args.closeToast?.(event);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof ToastCloseButton>;

export const Default: Story = {
  args: {},
};

export const CustomTooltip: Story = {
  args: {
    title: 'Dismiss this alert',
    ariaLabel: 'Dismiss this alert',
  },
};

export const CustomStyle: Story = {
  decorators: [withIsometricTheme],
  args: {
    className: iso.button.icon,
  },
};
