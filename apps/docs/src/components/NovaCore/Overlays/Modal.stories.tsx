import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tuwaio/nova-core';
import { useState } from 'react';

const meta: Meta<typeof Dialog> = {
  title: 'Nova Core/Overlays/Modal',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modal dialog component built on top of Radix UI and Framer Motion. It handles animations, focus management, and accessibility automatically.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

// Shared button styles using existing CSS variables
const buttonBaseStyles =
  'cursor-pointer px-4 py-2 rounded-[var(--tuwa-rounded-corners)] font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

const primaryButtonStyles = `${buttonBaseStyles} bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-[var(--tuwa-text-on-accent)] hover:from-[var(--tuwa-button-gradient-from-hover)] hover:to-[var(--tuwa-button-gradient-to-hover)] focus:ring-[var(--tuwa-button-gradient-from)]`;

const secondaryButtonStyles = `${buttonBaseStyles} bg-[var(--tuwa-standart-button-bg)] text-[var(--tuwa-text-primary)] hover:bg-[var(--tuwa-standart-button-hover)] focus:ring-[var(--tuwa-border-primary)]`;

const inputStyles =
  'w-full rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-secondary)] px-3 py-2 text-sm text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-text-accent)] focus:border-[var(--tuwa-text-accent)] transition-colors';

/**
 * Basic usage example with a trigger and content.
 * Note: The `Dialog` component itself controls the open state via context.
 */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <button className={primaryButtonStyles}>Open Modal</button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <DialogDescription className="text-[var(--tuwa-text-secondary)] text-sm">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--tuwa-text-secondary)]">Name</label>
            <input className={inputStyles} defaultValue="Pedro Duarte" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--tuwa-text-secondary)]">Email</label>
            <input
              className={inputStyles}
              defaultValue="pedro@example.com"
              placeholder="Enter your email"
              type="email"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-3 p-4 pt-0">
          <DialogClose asChild>
            <button className={secondaryButtonStyles}>Cancel</button>
          </DialogClose>
          <DialogClose asChild>
            <button className={primaryButtonStyles}>Save changes</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Example with controlled state - useful for programmatic control.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} className={primaryButtonStyles}>
          Open Controlled Modal
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Controlled State</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <DialogDescription className="text-[var(--tuwa-text-secondary)] text-sm">
                This modal is controlled by React state.
              </DialogDescription>
              <p className="text-[var(--tuwa-text-primary)] text-sm">
                You can programmatically open and close this modal using the{' '}
                <code className="bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-text-accent)] px-1.5 py-0.5 rounded-[var(--tuwa-rounded-corners)] text-xs font-mono">
                  open
                </code>{' '}
                prop and{' '}
                <code className="bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-text-accent)] px-1.5 py-0.5 rounded-[var(--tuwa-rounded-corners)] text-xs font-mono">
                  onOpenChange
                </code>{' '}
                callback.
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-3 p-4 pt-0">
              <button onClick={() => setOpen(false)} className={primaryButtonStyles}>
                Close via State
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/**
 * Confirmation dialog example - common pattern for destructive actions.
 */
export const ConfirmationDialog: Story = {
  render: () => {
    const dangerButtonStyles = `${buttonBaseStyles} bg-[var(--tuwa-error-bg)] text-[var(--tuwa-error-text)] hover:opacity-80 focus:ring-[var(--tuwa-error-icon)]`;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={dangerButtonStyles}>Delete Account</button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <DialogDescription className="text-[var(--tuwa-text-secondary)] text-sm">
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </div>
          <DialogFooter className="flex justify-end gap-3 p-4 pt-0">
            <DialogClose asChild>
              <button className={secondaryButtonStyles}>Cancel</button>
            </DialogClose>
            <DialogClose asChild>
              <button className={dangerButtonStyles}>Delete</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

/**
 * Long content example with scrollable body.
 */
export const ScrollableContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <button className={primaryButtonStyles}>Open Scrollable Modal</button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 NovaCustomScroll">
          <DialogDescription className="text-[var(--tuwa-text-secondary)] text-sm">
            Please read and accept our terms of service.
          </DialogDescription>
          {[1, 2, 3, 4, 5].map((section) => (
            <div key={section} className="space-y-2">
              <h4 className="font-medium text-[var(--tuwa-text-primary)]">Section {section}</h4>
              <p className="text-sm text-[var(--tuwa-text-secondary)] leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur.
              </p>
            </div>
          ))}
        </div>
        <DialogFooter className="flex justify-end gap-3 p-4 border-t border-[var(--tuwa-border-primary)]">
          <DialogClose asChild>
            <button className={secondaryButtonStyles}>Decline</button>
          </DialogClose>
          <DialogClose asChild>
            <button className={primaryButtonStyles}>Accept</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Info dialog example - for displaying information or notifications.
 */
export const InfoDialog: Story = {
  render: () => {
    const infoButtonStyles = `${buttonBaseStyles} bg-[var(--tuwa-info-bg)] text-[var(--tuwa-info-text)] hover:opacity-80 focus:ring-[var(--tuwa-info-icon)]`;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={infoButtonStyles}>Show Info</button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Information</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <DialogDescription className="text-[var(--tuwa-text-secondary)] text-sm">
              This is an informational dialog. You can use it to display important messages or notifications to the
              user.
            </DialogDescription>
          </div>
          <DialogFooter className="flex justify-end gap-3 p-4 pt-0">
            <DialogClose asChild>
              <button className={primaryButtonStyles}>Got it</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
