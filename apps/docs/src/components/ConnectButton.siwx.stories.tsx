import type { Meta, StoryObj } from '@storybook/react-vite';
import { useNovaSiwx } from '@tuwaio/nova-connect';
import { ConnectButton } from '@tuwaio/nova-connect/components';
import { parseMessage } from '@tuwaio/siwx-core';
import { useSiwxSession } from '@tuwaio/siwx-react';

import {
  ExtendedConnectButtonProps,
  sharedArgs,
  sharedArgTypes,
  StorybookProviders,
} from '../utils/storybook-providers';

// No backend: a real app verifies the signature on its server, with `@tuwaio/siwx-server`
const verifier = async ({ message }: { message: string; signature: string }) => {
  const { address, chainId, domain, issuedAt, expirationTime } = parseMessage(message);
  return { address, chainId, domain, issuedAt, expirationTime };
};

const SessionLine = () => {
  const { status, session } = useSiwxSession();
  const { signOut } = useNovaSiwx({ verifier });
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-center font-mono text-xs text-[var(--tuwa-text-secondary)]" data-testid="session">
        {status}
        {session ? `: ${session.address}` : ''}
      </p>
      {session && (
        <button
          type="button"
          onClick={() => void signOut()}
          className="cursor-pointer text-xs text-[var(--tuwa-text-secondary)] underline underline-offset-2"
        >
          Sign out
        </button>
      )}
    </div>
  );
};

const meta: Meta<ExtendedConnectButtonProps> = {
  title: 'ConnectButton/Sign-in',
  component: ConnectButton,
  tags: ['!autodocs'],
  argTypes: sharedArgTypes,
  args: sharedArgs,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<ExtendedConnectButtonProps>;

/**
 * With `siwx`, a wallet counts as connected only after it has signed in. Connect with a wallet of yours: the window asks for the
 * signature, and a rejection leaves everything as it was. After a reload nothing is asked: the wallet comes back only if its
 * session covers it. Nothing leaves this page: the verifier here only reads the message.
 */
export const WaitsForTheSignature: Story = {
  render: (args) => (
    <StorybookProviders
      autoConnect
      withChain
      withBalance
      siwx={{
        verifier,
        domain: window.location.host,
        uri: window.location.origin,
        statement: 'Sign in to this Storybook. Nothing leaves this page.',
      }}
    >
      <ConnectButton {...args} />
      <SessionLine />
    </StorybookProviders>
  ),
};
