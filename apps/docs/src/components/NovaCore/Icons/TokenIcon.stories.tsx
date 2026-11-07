/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TokenIcon, useCopyToClipboard } from '@tuwaio/nova-core';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

import iconMapSource from '../../../../../../packages/nova-core/src/utils/web3IconImports.ts?raw';

const meta: Meta<typeof TokenIcon> = {
  title: 'Nova Core/Icons/TokenIcon',
  component: TokenIcon,
  tags: ['autodocs'],
  argTypes: {
    symbol: {
      control: 'text',
      description: 'Token symbol, in any letter case (`USDC`, `sol`).',
    },
    variant: {
      control: 'select',
      options: ['background', 'branded', 'mono'],
      description: 'Visual style variant.',
      defaultValue: 'background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof TokenIcon>;

/**
 * USD Coin, a token of Payments.
 */
export const USDC: Story = {
  args: {
    symbol: 'USDC',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * The native token of a network.
 */
export const ETH: Story = {
  args: {
    symbol: 'ETH',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * The symbol is read in any letter case.
 */
export const LowerCaseSymbol: Story = {
  args: {
    symbol: 'sol',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

/**
 * The `branded` variant.
 */
export const Branded: Story = {
  args: {
    symbol: 'USDT',
    variant: 'branded',
    className: 'w-10 h-10',
  },
};

/**
 * The `mono` variant takes the color of the text.
 */
export const Mono: Story = {
  args: {
    symbol: 'DAI',
    variant: 'mono',
    className: 'w-10 h-10',
  },
};

/**
 * A token with no icon shows the first letter of its symbol.
 */
export const UnknownToken: Story = {
  args: {
    symbol: 'XYZ',
    variant: 'background',
    className: 'w-10 h-10',
  },
};

const PAYMENT_TOKENS = ['USDC', 'USDT', 'EURC', 'PYUSD', 'DAI', 'GHO', 'ETH', 'POL', 'BNB', 'SOL'];

// From the icon map itself, so that the gallery below cannot fall behind it
const ALL_TOKENS = [...iconMapSource.matchAll(/^\s*Token(\w+): \(\) =>/gm)].map((match) => match[1]);

/**
 * The tokens of Payments, with their names as `TokenIcon` reads them.
 */
export const PaymentTokens: Story = {
  render: (args) => (
    <div className="grid grid-cols-5 gap-3">
      {PAYMENT_TOKENS.map((symbol) => (
        <div key={symbol} className="flex flex-col items-center gap-1 text-xs text-[var(--tuwa-text-secondary)]">
          <TokenIcon {...args} symbol={symbol} className="w-10 h-10" />
          {symbol}
        </div>
      ))}
    </div>
  ),
  args: {
    symbol: 'USDC',
    variant: 'background',
  },
};

/** One token of the gallery: the card copies the code that draws it. */
const TokenCard = ({ symbol, variant, reduceMotion }: { symbol: string; variant: Variant; reduceMotion: boolean }) => {
  const { isCopied, copy } = useCopyToClipboard();
  return (
    <motion.button
      type="button"
      layout={reduceMotion ? false : 'position'}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => void copy(`<TokenIcon symbol="${symbol}" />`)}
      aria-label={`Copy the code of the ${symbol} icon`}
      className="group flex cursor-pointer flex-col items-center gap-3 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3 pt-5 pb-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--tuwa-text-accent)] hover:shadow-[0_10px_28px_-14px_rgb(0_0_0/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tuwa-text-accent)]"
    >
      <span className="block h-11 w-11 transition-transform duration-200 group-hover:scale-110">
        <TokenIcon symbol={symbol} variant={variant} />
      </span>
      <span
        className={`font-mono text-xs tracking-wide ${isCopied ? 'text-[var(--tuwa-text-accent)]' : 'text-[var(--tuwa-text-primary)]'}`}
      >
        {isCopied ? 'Copied' : symbol}
      </span>
    </motion.button>
  );
};

const VARIANTS = ['background', 'branded', 'mono'] as const;
type Variant = (typeof VARIANTS)[number];

const segmentClass = (isActive: boolean) =>
  `cursor-pointer rounded-[calc(var(--tuwa-rounded-corners)-2px)] px-3 py-1.5 text-xs capitalize transition-colors ${
    isActive
      ? 'bg-[var(--tuwa-bg-primary)] text-[var(--tuwa-text-primary)] shadow-sm'
      : 'text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)]'
  }`;

/** The gallery: every token with an icon, to search and to copy. */
const TokenGallery = () => {
  const reduceMotion = useReducedMotion() ?? false;
  const [query, setQuery] = useState('');
  const [onlyPayments, setOnlyPayments] = useState(false);
  const [variant, setVariant] = useState<Variant>('background');

  const search = query.trim().toUpperCase();
  const tokens = (onlyPayments ? ALL_TOKENS.filter((symbol) => PAYMENT_TOKENS.includes(symbol)) : ALL_TOKENS).filter(
    (symbol) => symbol.includes(search),
  );

  return (
    <div className="min-h-screen bg-[var(--tuwa-bg-secondary)] px-6 py-10 text-[var(--tuwa-text-primary)]">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Token icons</h2>
          <p className="mt-1.5 text-sm text-[var(--tuwa-text-secondary)]">
            {ALL_TOKENS.length} tokens, each loaded on demand. Choose one to copy its code.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-2 mb-5 flex flex-wrap items-center gap-3 bg-[var(--tuwa-bg-secondary)] px-2 py-3">
          <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3.5 py-2.5 transition-colors focus-within:border-[var(--tuwa-text-accent)]">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 fill-none stroke-[var(--tuwa-text-tertiary)]"
            >
              <circle cx="9" cy="9" r="5.5" strokeWidth="1.6" />
              <path d="m13.2 13.2 3.3 3.3" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by symbol"
              aria-label="Search tokens by symbol"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--tuwa-text-tertiary)]"
            />
            <span className="shrink-0 font-mono text-xs text-[var(--tuwa-text-tertiary)]" aria-live="polite">
              {tokens.length}
            </span>
          </label>

          <div
            role="group"
            aria-label="Which tokens"
            className="flex gap-0.5 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-0.5"
          >
            {[false, true].map((value) => (
              <button
                key={String(value)}
                type="button"
                aria-pressed={onlyPayments === value}
                onClick={() => setOnlyPayments(value)}
                className={segmentClass(onlyPayments === value)}
              >
                {value ? 'Payments' : 'All'}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Icon style"
            className="flex gap-0.5 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-0.5"
          >
            {VARIANTS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={variant === value}
                onClick={() => setVariant(value)}
                className={segmentClass(variant === value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {tokens.length > 0 ? (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(112px,1fr))]">
            <AnimatePresence initial={false} mode="popLayout">
              {tokens.map((symbol) => (
                <TokenCard key={symbol} symbol={symbol} variant={variant} reduceMotion={reduceMotion} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[var(--tuwa-rounded-corners)] border border-dashed border-[var(--tuwa-border-primary)] px-6 py-14 text-center">
            <span className="block h-11 w-11">
              <TokenIcon symbol={search || '?'} />
            </span>
            <p className="text-sm font-medium">No icon for {search}</p>
            <p className="max-w-[360px] text-xs text-[var(--tuwa-text-secondary)]">
              TokenIcon shows the first letter of a symbol it has no icon for, as here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Every token with an icon, read from the icon map of `nova-core`, so this list is never out of date. Search it, change
 * the style, and choose a token to copy its code. Any other token shows the first letter of its symbol.
 */
export const AllTokens: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <TokenGallery />,
};
