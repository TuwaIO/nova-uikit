/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalLinkIcon, TokenIcon, useCopyToClipboard } from '@tuwaio/nova-core';
import { tokens as libraryTokens } from '@web3icons/common/metadata/tokens';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';

import iconMapSource from '../../../../../../packages/nova-core/src/utils/web3IconImports.ts?raw';

const PAGE_SIZE = 60;
const VARIANTS = ['background', 'branded', 'mono'] as const;
const SETS = ['all', 'bundled', 'payments'] as const;
const SET_NAMES: Record<(typeof SETS)[number], string> = { all: 'All', bundled: 'In the bundle', payments: 'Payments' };
const PAYMENT_TOKENS = new Set(['USDC', 'USDT', 'EURC', 'PYUSD', 'DAI', 'GHO', 'ETH', 'POL', 'BNB', 'SOL']);

type Variant = (typeof VARIANTS)[number];
type Token = { symbol: string; name: string; isBundled: boolean; rank: number };

// From the icon map itself, so that this cannot fall behind it
const BUNDLED = new Set([...iconMapSource.matchAll(/^\s*Token(\w+): \(\) =>/gm)].map((match) => match[1]));

// What a person looks for first comes first: what is in the bundle, then by market cap
const TOKENS: Token[] = libraryTokens
  .map((token) => {
    // A token with no file of its own has the path of its network, `network:ton`, which is no symbol
    const symbol = token.filePath.startsWith('token:')
      ? token.filePath.replace('token:', '')
      : token.symbol.toUpperCase();
    return {
      symbol,
      name: token.name,
      isBundled: BUNDLED.has(symbol),
      rank: token.marketCapRank || Number.MAX_SAFE_INTEGER,
    };
  })
  .sort((a, b) => Number(b.isBundled) - Number(a.isBundled) || a.rank - b.rank || a.symbol.localeCompare(b.symbol));

const segmentClass = (isActive: boolean) =>
  `cursor-pointer rounded-[calc(var(--tuwa-rounded-corners)-2px)] px-3 py-1.5 text-xs capitalize transition-colors ${
    isActive
      ? 'bg-[var(--tuwa-bg-primary)] text-[var(--tuwa-text-primary)] shadow-sm'
      : 'text-[var(--tuwa-text-primary)] hover:bg-[var(--tuwa-bg-primary)]/60'
  }`;

/** One token: the card copies the code that draws it. */
const TokenCard = ({ token, variant, reduceMotion }: { token: Token; variant: Variant; reduceMotion: boolean }) => {
  const { isCopied, copy } = useCopyToClipboard();
  return (
    <motion.button
      type="button"
      layout={reduceMotion ? false : 'position'}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => void copy(`<TokenIcon symbol="${token.symbol}" />`)}
      // Starts with the text on the card: whoever speaks to the page says what they see
      aria-label={`${isCopied ? 'Copied' : token.symbol} ${token.name}, copy the code of the icon`}
      title={token.isBundled ? token.name : `${token.name}, loaded on demand`}
      className="group relative flex min-w-0 cursor-pointer flex-col items-center gap-3 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3 pt-5 pb-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--tuwa-text-accent)] hover:shadow-[0_10px_28px_-14px_rgb(0_0_0/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tuwa-text-accent)]"
    >
      {!token.isBundled && (
        <span aria-hidden className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[var(--tuwa-text-tertiary)]" />
      )}
      <span className="block h-11 w-11 transition-transform duration-200 group-hover:scale-110">
        <TokenIcon symbol={token.symbol} variant={variant} />
      </span>
      <span className="flex w-full min-w-0 flex-col items-center gap-0.5">
        <span
          className={`max-w-full truncate font-mono text-xs tracking-wide ${isCopied ? 'text-[var(--tuwa-text-accent)]' : 'text-[var(--tuwa-text-primary)]'}`}
        >
          {isCopied ? 'Copied' : token.symbol}
        </span>{' '}
        {/* The space keeps the two words apart in the accessible text: spans alone would read as one word */}
        <span className="max-w-full truncate text-[11px] text-[var(--tuwa-text-secondary)]">{token.name}</span>
      </span>
    </motion.button>
  );
};

/** Every token of the library, to search, to page through and to copy. */
const TokenGallery = () => {
  const reduceMotion = useReducedMotion() ?? false;
  const [query, setQuery] = useState('');
  const [set, setSet] = useState<(typeof SETS)[number]>('all');
  const [variant, setVariant] = useState<Variant>('background');
  const [shown, setShown] = useState(PAGE_SIZE);

  const found = useMemo(() => {
    const search = query.trim().toLowerCase();
    return TOKENS.filter(
      (token) =>
        (set === 'all' || (set === 'bundled' ? token.isBundled : PAYMENT_TOKENS.has(token.symbol))) &&
        (token.symbol.toLowerCase().includes(search) || token.name.toLowerCase().includes(search)),
    );
  }, [query, set]);
  const visible = found.slice(0, shown);
  const left = found.length - visible.length;

  return (
    <div className="min-h-screen bg-[var(--tuwa-bg-secondary)] px-6 py-10 text-[var(--tuwa-text-primary)]">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Token icons</h2>
          <p className="mt-1.5 text-sm text-[var(--tuwa-text-secondary)]">
            {TOKENS.length.toLocaleString('en')} tokens: {BUNDLED.size} go through your bundler, and the others, marked
            with a dot, load on demand from GitHub and cost your build nothing. Choose one to copy its code.
          </p>
          <a
            href="https://www.web3icons.io/?type=token&variant=branded"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-[var(--tuwa-text-accent)] hover:underline"
          >
            The original set on web3icons.io
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
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
              onChange={(event) => {
                setQuery(event.target.value);
                setShown(PAGE_SIZE);
              }}
              placeholder="Search by symbol or name"
              aria-label="Search tokens by symbol or name"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--tuwa-text-tertiary)]"
            />
            <span className="shrink-0 font-mono text-xs text-[var(--tuwa-text-secondary)]" aria-live="polite">
              {found.length.toLocaleString('en')}
            </span>
          </label>

          <div
            role="group"
            aria-label="Which tokens"
            className="flex gap-0.5 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-0.5"
          >
            {SETS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={set === value}
                onClick={() => {
                  setSet(value);
                  setShown(PAGE_SIZE);
                }}
                className={segmentClass(set === value)}
              >
                {SET_NAMES[value]}
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

        {visible.length > 0 ? (
          <>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(124px,1fr))]">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((token) => (
                  <TokenCard key={token.symbol} token={token} variant={variant} reduceMotion={reduceMotion} />
                ))}
              </AnimatePresence>
            </div>
            {left > 0 && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShown((current) => current + PAGE_SIZE)}
                  className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--tuwa-text-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tuwa-text-accent)]"
                >
                  Load more
                </button>
                <p className="text-xs text-[var(--tuwa-text-secondary)]">
                  {visible.length.toLocaleString('en')} of {found.length.toLocaleString('en')}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[var(--tuwa-rounded-corners)] border border-dashed border-[var(--tuwa-border-primary)] px-6 py-14 text-center">
            <span className="block h-11 w-11">
              <TokenIcon symbol={query.trim().toUpperCase().slice(0, 1) || '?'} />
            </span>
            <p className="text-sm font-medium">No token matches “{query.trim()}”</p>
            <p className="max-w-[360px] text-xs text-[var(--tuwa-text-secondary)]">
              TokenIcon shows the first letter of a symbol it has no icon for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Its own entry with no Docs page: a tool to find a token, not a part of the documentation of TokenIcon
const meta: Meta = {
  title: 'Nova Core/Icons/TokenGallery',
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Gallery: StoryObj = {
  render: () => <TokenGallery />,
};
