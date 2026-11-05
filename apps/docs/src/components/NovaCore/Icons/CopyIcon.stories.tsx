import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyIcon, ExternalLinkIcon } from '@tuwaio/nova-core';
import { useEffect, useState } from 'react';

const meta: Meta<typeof CopyIcon> = {
  title: 'Nova Core/Icons/CopyIcon',
  component: CopyIcon,
  tags: ['autodocs'],
  args: { className: 'h-10 w-10 text-[var(--tuwa-text-secondary)]' },
};

export default meta;
type Story = StoryObj<typeof CopyIcon>;

/** Two thin sheets, ready to copy. */
export const Default: Story = {};

/** The sheets folded into a check mark. */
export const Copied: Story = { args: { copied: true } };

/** Back and forth, as after a click. */
export const Change: Story = {
  render: (args) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
      const timer = setInterval(() => setCopied((current) => !current), 1600);
      return () => clearInterval(timer);
    }, []);
    return <CopyIcon {...args} copied={copied} />;
  },
};

/** The link icon: hover the link, and the arrow moves out of the box. */
export const LinkIcon: Story = {
  render: () => (
    <a href="#link" className="inline-flex items-center gap-1 text-[var(--tuwa-text-accent)]">
      Open in the explorer
      <ExternalLinkIcon className="h-5 w-5" />
    </a>
  ),
};
