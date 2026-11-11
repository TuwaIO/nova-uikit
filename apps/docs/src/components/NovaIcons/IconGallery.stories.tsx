import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCopyToClipboard } from '@tuwaio/nova-core';
import * as outline from '@tuwaio/nova-icons/24/outline';
import * as solid from '@tuwaio/nova-icons/24/solid';
import * as tuwa from '@tuwaio/nova-icons/tuwa';
import { type ComponentType, type SVGProps, useMemo, useState } from 'react';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { motion?: 'assemble' | 'breathe' }>;
type Entry = { name: string; Icon: Icon };

const SETS = {
  outline: { title: 'Outline', path: '@tuwaio/nova-icons/24/outline', icons: outline },
  solid: { title: 'Solid', path: '@tuwaio/nova-icons/24/solid', icons: solid },
  tuwa: { title: 'TUWA', path: '@tuwaio/nova-icons/tuwa', icons: tuwa },
} as const;
const SIZES = [16, 20, 24, 32, 48] as const;
const MOTIONS = ['still', 'assemble', 'breathe'] as const;

type SetName = keyof typeof SETS;

/** The icons of a set: the exports named as an icon. */
const entriesOf = (set: SetName): Entry[] =>
  Object.entries(SETS[set].icons)
    .filter(([name]) => /^[A-Z]\w*Icon$/.test(name))
    .map(([name, Icon]) => ({ name, Icon: Icon as Icon }));

const segmentClass = (isActive: boolean) =>
  `cursor-pointer rounded-[calc(var(--tuwa-rounded-corners)-2px)] px-3 py-1.5 text-xs transition-colors ${
    isActive
      ? 'bg-[var(--tuwa-bg-primary)] text-[var(--tuwa-text-primary)] shadow-sm'
      : 'text-[var(--tuwa-text-primary)] hover:bg-[var(--tuwa-bg-primary)]/60'
  }`;

/** One icon: the card copies the line that imports it. */
const IconCard = ({
  entry,
  set,
  size,
  motion,
  round,
}: {
  entry: Entry;
  set: SetName;
  size: number;
  motion: string;
  round: number;
}) => {
  const { isCopied, copy } = useCopyToClipboard();
  const label = entry.name.replace(/Icon$/, '');
  return (
    <button
      type="button"
      onClick={() => void copy(`import { ${entry.name} } from '${SETS[set].path}';`)}
      // Starts with the text on the card: whoever speaks to the page says what they see
      aria-label={`${isCopied ? 'Copied' : label}, copy the import of ${entry.name}`}
      className="group flex min-w-0 cursor-pointer flex-col items-center gap-3 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3 pt-5 pb-3.5 transition-[border-color,box-shadow] duration-200 hover:border-[var(--tuwa-text-accent)] hover:shadow-[0_10px_28px_-14px_rgb(0_0_0/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tuwa-text-accent)]"
    >
      <span className="flex h-12 items-center justify-center text-[var(--tuwa-text-primary)]">
        {/* A new key replays the motion, once */}
        <entry.Icon
          key={`${motion}-${round}`}
          width={size}
          height={size}
          aria-hidden
          {...(motion === 'still' ? {} : { motion: motion as 'assemble' | 'breathe' })}
        />
      </span>
      <span
        className={`max-w-full truncate font-mono text-xs tracking-wide ${isCopied ? 'text-[var(--tuwa-text-accent)]' : 'text-[var(--tuwa-text-primary)]'}`}
      >
        {isCopied ? 'Copied' : label}
      </span>
    </button>
  );
};

/** Every icon of @tuwaio/nova-icons, to search, to see at a size and in motion, and to copy. */
const NovaIconGallery = () => {
  const [set, setSet] = useState<SetName>('outline');
  const [size, setSize] = useState<(typeof SIZES)[number]>(24);
  const [motion, setMotion] = useState<(typeof MOTIONS)[number]>('still');
  const [round, setRound] = useState(0);
  const [query, setQuery] = useState('');
  const all = useMemo(() => entriesOf(set), [set]);
  const found = all.filter((entry) => entry.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-[var(--tuwa-bg-secondary)] px-6 py-10 text-[var(--tuwa-text-primary)]">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Nova icons</h2>
          <p className="mt-1.5 text-sm text-[var(--tuwa-text-secondary)]">
            {entriesOf('outline').length} outline, {entriesOf('solid').length} solid and {entriesOf('tuwa').length} TUWA
            icons in the TUWA retro pixel style, on a 16 × 16 grid with two-pixel lines. They have the names and the
            import paths of Heroicons; the lit pixels take the accent of the theme. Choose one to copy its import.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-2 mb-5 flex flex-wrap items-center gap-3 bg-[var(--tuwa-bg-secondary)] px-2 py-3">
          <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3.5 py-2.5 transition-colors focus-within:border-[var(--tuwa-text-accent)]">
            <outline.MagnifyingGlassIcon aria-hidden className="h-4 w-4 shrink-0 text-[var(--tuwa-text-tertiary)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name"
              aria-label="Search icons by name"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--tuwa-text-tertiary)]"
            />
            <span className="shrink-0 font-mono text-xs text-[var(--tuwa-text-secondary)]" aria-live="polite">
              {found.length}
            </span>
          </label>

          {(
            [
              ['Which icons', Object.keys(SETS) as SetName[], set, setSet, (value: SetName) => SETS[value].title],
              ['Size', SIZES, size, setSize, (value: number) => `${value} px`],
              ['Motion', MOTIONS, motion, setMotion, (value: string) => value[0].toUpperCase() + value.slice(1)],
            ] as const
          ).map(([label, values, current, setValue, title]) => (
            <div
              key={label}
              role="group"
              aria-label={label}
              className="flex gap-0.5 rounded-[var(--tuwa-rounded-corners)] bg-[var(--tuwa-bg-muted)] p-0.5"
            >
              {(values as readonly (string | number)[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={current === value}
                  onClick={() => {
                    (setValue as (next: string | number) => void)(value);
                    setRound((count) => count + 1);
                  }}
                  className={segmentClass(current === value)}
                >
                  {(title as (next: string | number) => string)(value)}
                </button>
              ))}
            </div>
          ))}
          {motion !== 'still' && (
            <button
              type="button"
              onClick={() => setRound((count) => count + 1)}
              className="cursor-pointer rounded-[var(--tuwa-rounded-corners)] border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-primary)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--tuwa-text-accent)]"
            >
              Play again
            </button>
          )}
        </div>

        {found.length > 0 ? (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(124px,1fr))]">
            {found.map((entry) => (
              <IconCard key={entry.name} entry={entry} set={set} size={size} motion={motion} round={round} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[var(--tuwa-rounded-corners)] border border-dashed border-[var(--tuwa-border-primary)] px-6 py-14 text-center">
            <outline.QuestionMarkCircleIcon aria-hidden className="h-11 w-11" />
            <p className="text-sm font-medium">No icon matches “{query.trim()}”</p>
          </div>
        )}
      </div>
    </div>
  );
};

// A tool to find an icon, not a page of the reference: no Docs page of its own
const meta: Meta = {
  title: 'Nova Icons/Gallery',
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Gallery: StoryObj = {
  render: () => <NovaIconGallery />,
};
