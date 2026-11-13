import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as heroOutline from '@heroicons/react/24/outline';
import * as heroSolid from '@heroicons/react/24/solid';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import * as brands from './brands';
import * as root from './index';
import * as outline from './outline';
import * as solid from './solid';
import * as tuwa from './tuwa';

type Node = { props: Record<string, unknown> };

const PACKAGE = join(__dirname, '..');
const iconsOf = (module: Record<string, unknown>) =>
  Object.entries(module).filter(([name]) => /^[A-Z]\w*Icon$/.test(name));

// The Heroicons that the TUWA ecosystem imports on any branch (Nova, Quasar, quasar-client, the docs and docs-ui, the
// website, cosmos and the templates): the set has every one of them, so that changing the import is
// the whole replacement
const USED_OUTLINE = `AdjustmentsHorizontal ArchiveBox ArrowDownCircle ArrowTopRightOnSquare DocumentMagnifyingGlass
  ExclamationCircle Pencil ShoppingBag ArrowDown ArrowDownTray ArrowLeft ArrowLeftStartOnRectangle
  ArrowPath ArrowPathRoundedSquare ArrowRight ArrowRightStartOnRectangle ArrowsRightLeft ArrowsUpDown ArrowTrendingUp
  ArrowUpCircle ArrowUpTray ArrowUturnLeft Banknotes Beaker BellAlert Bell Bolt BookOpen Briefcase BuildingOffice2
  BuildingOffice Calculator CalendarDays Camera ChartBar ChartBarSquare ChatBubbleLeftRight ChatBubbleOvalLeftEllipsis
  CheckBadge CheckCircle Check ChevronDown ChevronLeft ChevronRight ChevronUpDown ChevronUp CircleStack
  ClipboardDocumentCheck ClipboardDocument Clock CloudArrowUp Cloud CodeBracket CodeBracketSquare Cog6Tooth CommandLine
  CpuChip CreditCard Cube CurrencyDollar CursorArrowRays DevicePhoneMobile DocumentArrowDown DocumentArrowUp DocumentCheck
  DocumentDuplicate DocumentText EllipsisHorizontal Envelope EnvelopeOpen ExclamationTriangle Eye EyeSlash FaceFrown
  FingerPrint Folder Funnel GlobeAlt GlobeEuropeAfrica Hashtag Home Identification Inbox InformationCircle Key Language
  LightBulb Link LockClosed LockOpen MagnifyingGlass Moon NoSymbol PaintBrush PaperAirplane PauseCircle Pause PencilSquare
  Photo Plus Power QrCode QuestionMarkCircle ReceiptPercent RocketLaunch Scale Server ServerStack ShieldCheck
  ShieldExclamation Signal SignalSlash Sparkles SpeakerWave SpeakerXMark Squares2X2 Sun Tag Trash UserCircle UserGroup
  User UserPlus Users Wallet XCircle XMark`;
const USED_SOLID = `ArrowDown ArrowPath ArrowUp Beaker CheckCircle ChevronDown ChevronLeft ChevronRight ChevronUp ChevronUpDown
  DocumentDuplicate ExclamationTriangle GlobeAlt PuzzlePiece`;
const names = (list: string) => list.split(/\s+/).map((name) => `${name}Icon`);

describe('the icons of the set', () => {
  // The library works as Heroicons do, with the same names
  it('are named exactly as their Heroicons, outline and solid', () => {
    for (const [name] of iconsOf(outline)) expect(heroOutline, name).toHaveProperty(name);
    for (const [name] of iconsOf(solid)) expect(heroSolid, name).toHaveProperty(name);
  });

  it('cover every Heroicon the TUWA ecosystem uses', () => {
    for (const name of names(USED_OUTLINE)) expect(outline, name).toHaveProperty(name);
    for (const name of names(USED_SOLID)) expect(solid, name).toHaveProperty(name);
  });

  it('are each drawn on a 16 x 16 grid and named after themselves', () => {
    for (const [name, Icon] of [...iconsOf(outline), ...iconsOf(solid)]) {
      const svg = (Icon as (props: object) => ReactElement)({}) as unknown as Node;
      expect(svg.props.viewBox, name).toBe('0 0 16 16');
      expect((Icon as { displayName?: string }).displayName).toBe(name);
    }
  });

  it('of the main entry are the outline ones', () => {
    for (const [name, Icon] of iconsOf(outline)) expect(root[name as keyof typeof root], name).toBe(Icon);
  });
});

// Icons of TUWA's own, beside the Heroicons names and never in place of one: the craft of the flight plans (the rail
// of the Quasar sign-in page), and Transactions and Webhooks of the Quasar dashboard
describe('the icons of TUWA', () => {
  it('are the spacecraft, the pulsar of Transactions and the loop of Webhooks, each with a lit pixel', () => {
    expect(iconsOf(tuwa).map(([name]) => name)).toEqual(['SpacecraftIcon', 'TransactionsIcon', 'WebhooksIcon']);
    for (const [name, Icon] of iconsOf(tuwa)) {
      const svg = (Icon as (props: object) => ReactElement)({}) as unknown as Node & { props: { children?: unknown } };
      expect(svg.props.viewBox, name).toBe('0 0 16 16');
      expect(JSON.stringify(svg.props.children), name).toContain('--tuwa-icon-accent');
    }
  });

  it('have no Heroicons name, so that they never stand in for one', () => {
    for (const [name] of iconsOf(tuwa)) {
      expect(heroOutline, name).not.toHaveProperty(name);
      expect(heroSolid, name).not.toHaveProperty(name);
    }
  });

  it('are in the main entry too', () => {
    for (const [name, Icon] of iconsOf(tuwa)) expect(root[name as keyof typeof root], name).toBe(Icon);
  });
});

// The marks of the services TUWA links to (the website footer, docs-ui, the Quasar dashboard),
// in pixels like the rest; Heroicons has no marks of brands
describe('the icons of brands', () => {
  it('are the marks TUWA links to, in one color', () => {
    expect(iconsOf(brands).map(([name]) => name)).toEqual([
      'DiscordIcon',
      'GitHubIcon',
      'NpmIcon',
      'TelegramIcon',
      'XIcon',
    ]);
    for (const [name, Icon] of iconsOf(brands)) {
      const svg = (Icon as (props: object) => ReactElement)({}) as unknown as Node & { props: { children?: unknown } };
      expect(svg.props.viewBox, name).toBe('0 0 16 16');
      // A mark is drawn in the color of the text, not lit with the accent of the theme
      expect(JSON.stringify(svg.props.children), name).not.toContain('--tuwa-icon-accent');
    }
  });

  it('have no Heroicons name, so that the X of X never stands in for a close mark', () => {
    for (const [name] of iconsOf(brands)) {
      expect(heroOutline, name).not.toHaveProperty(name);
      expect(heroSolid, name).not.toHaveProperty(name);
    }
  });

  it('are in the main entry too', () => {
    for (const [name, Icon] of iconsOf(brands)) expect(root[name as keyof typeof root], name).toBe(Icon);
  });
});

describe('the package', () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, 'package.json'), 'utf8')) as {
    exports: Record<string, Record<string, string>>;
    sideEffects: unknown;
  };

  // An app swaps `@heroicons/react/<path>` for `@tuwaio/nova-icons/<path>`: the paths of Heroicons, the mini (20) and
  // micro (16) solid ones drawn once on the same 16 x 16 grid
  it('has the import paths of Heroicons, all solid paths leading to the one solid set', () => {
    expect(Object.keys(pkg.exports)).toEqual(
      expect.arrayContaining([
        '.',
        './24/outline',
        './24/solid',
        './20/solid',
        './16/solid',
        './tuwa',
        './brands',
        './motion.css',
      ]),
    );
    expect(pkg.exports['./20/solid']).toEqual(pkg.exports['./24/solid']);
    expect(pkg.exports['./16/solid']).toEqual(pkg.exports['./24/solid']);
  });

  // `sideEffects: false` would let a bundler drop `import '@tuwaio/nova-icons/motion.css'` as an unused import
  // A CommonJS consumer of TypeScript reads the .d.cts types, an ES module one the .d.ts
  it('gives each entry the types of its own module format', () => {
    for (const [path, entry] of Object.entries(pkg.exports)) {
      if (path.endsWith('.css')) continue;
      const conditions = entry as unknown as Record<string, Record<string, string>>;
      expect(conditions.import.types, path).toMatch(/\.d\.ts$/);
      expect(conditions.import.default, path).toMatch(/\.js$/);
      expect(conditions.require.types, path).toMatch(/\.d\.cts$/);
      expect(conditions.require.default, path).toMatch(/\.cjs$/);
    }
  });

  it('keeps its stylesheet when a bundler drops what is unused', () => {
    expect(pkg.sideEffects).toEqual(['*.css']);
  });

  // Each motion plays once, in plain CSS, and never for a reader who asks for less motion
  it('animates in plain CSS, each motion once, and not at all under reduced motion', () => {
    const css = readFileSync(join(PACKAGE, 'motion.css'), 'utf8');
    expect(css).toMatch(/@keyframes nova-icon-fly/);
    expect(css).toMatch(/@keyframes nova-icon-breathe/);
    expect(css).not.toMatch(/infinite|step-end|steps\(/);
    // A pixel flies from its own spot (`pixelFlight`), after its own delay, once, with a little overshoot
    const fly = css.slice(css.indexOf("[data-motion='assemble'] [data-px] {"));
    expect(fly.slice(0, fly.indexOf('}'))).toMatch(/animation: nova-icon-fly \d+ms cubic-bezier\([^)]*\) both;/);
    expect(fly.slice(0, fly.indexOf('}'))).toContain('var(--nova-px-delay');
    const keyframes = css.slice(css.indexOf('@keyframes nova-icon-fly'));
    expect(keyframes.slice(0, keyframes.indexOf('}\n}'))).toContain('translate(var(--nova-px-x');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[^}]*\{[^}]*animation: none/);
  });
});
