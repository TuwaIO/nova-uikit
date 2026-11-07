import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOVA_SOUND_NAMES, type NovaSoundName, playNovaSound } from '@tuwaio/nova-core/utils';
import { useState } from 'react';

const WHEN: Record<NovaSoundName, string> = {
  connect: 'A wallet connected',
  disconnect: 'A wallet disconnected',
  txPending: 'A transaction reached the pool',
  txSuccess: 'A transaction succeeded',
  txError: 'A transaction failed',
  txReplaced: 'A transaction replaced, cancelled or sped up',
  error: 'An error',
  networkSwitch: 'A change of network',
  copy: 'A copy',
  balanceRefresh: 'A balance refreshed by hand',
  remove: 'A recent wallet removed',
  modalOpen: 'A dialog opened',
  modalClose: 'A dialog closed',
  externalLink: 'A link to another site',
  addWallet: 'Connect another wallet',
  getWallet: 'The Get a wallet screen',
  aboutWallets: 'The About wallets screen',
  checkbox: 'Remember this wallet',
};

/** Every sound of the Nova components, to listen to. */
const SoundBoard = () => {
  const [volume, setVolume] = useState(0.2);

  return (
    <div className="min-h-screen bg-[var(--tuwa-bg-secondary)] px-6 py-10 text-[var(--tuwa-text-primary)]">
      <div className="mx-auto max-w-[760px]">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Sounds</h2>
          <p className="mt-1.5 text-sm text-[var(--tuwa-text-secondary)]">
            Synthesized in the browser, with no files and no requests. They are off unless the `sounds` prop of
            NovaConnectProvider or NovaTransactionsProvider asks for them. Choose one to listen to it.
          </p>
        </header>

        <label className="mb-6 flex items-center gap-3 text-sm">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-48 accent-[var(--tuwa-text-accent)]"
          />
          <span className="w-10 font-mono text-xs text-[var(--tuwa-text-secondary)]">{volume.toFixed(2)}</span>
        </label>

        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          {NOVA_SOUND_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => playNovaSound(name, { volume })}
              className="flex cursor-pointer flex-col items-start gap-1 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-4 py-3 text-left transition-colors hover:border-[var(--tuwa-text-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tuwa-text-accent)]"
            >
              <span className="font-mono text-xs">{name}</span>
              <span className="text-xs text-[var(--tuwa-text-secondary)]">{WHEN[name]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Nova Core/Sounds',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Board: StoryObj = {
  render: () => <SoundBoard />,
};
