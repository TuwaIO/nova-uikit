import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as heroOutline from '@heroicons/react/24/outline';
import * as heroSolid from '@heroicons/react/24/solid';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import * as root from './index';
import * as outline from './outline';
import * as solid from './solid';
import * as tuwa from './tuwa';

type Node = { props: Record<string, unknown> };

const PACKAGE = join(__dirname, '..');
const iconsOf = (module: Record<string, unknown>) =>
  Object.entries(module).filter(([name]) => /^[A-Z]\w*Icon$/.test(name));

// The Heroicons that the TUWA ecosystem imports (Nova, Quasar, quasar-client, the docs, the website, cosmos and the
// templates, counted 2026-11-11): the set has every one of them, so that changing the import is the whole replacement
const USED_OUTLINE = `AdjustmentsHorizontal ArchiveBox ArrowDownCircle ArrowDown ArrowDownTray ArrowLeft ArrowLeftStartOnRectangle
  ArrowPath ArrowPathRoundedSquare ArrowRight ArrowRightStartOnRectangle ArrowsRightLeft ArrowsUpDown ArrowTrendingUp
  ArrowUpCircle ArrowUpTray ArrowUturnLeft Banknotes Beaker BellAlert Bell Bolt BookOpen Briefcase BuildingOffice2
  BuildingOffice Calculator CalendarDays Camera ChartBar ChartBarSquare ChatBubbleLeftRight ChatBubbleOvalLeftEllipsis
  CheckBadge CheckCircle Check ChevronDown ChevronLeft ChevronRight ChevronUpDown ChevronUp CircleStack
  ClipboardDocumentCheck ClipboardDocument Clock CloudArrowUp Cloud CodeBracket CodeBracketSquare Cog6Tooth CommandLine
  CpuChip CreditCard Cube CurrencyDollar CursorArrowRays DevicePhoneMobile DocumentArrowDown DocumentArrowUp DocumentCheck
  DocumentDuplicate DocumentText EllipsisHorizontal Envelope EnvelopeOpen ExclamationTriangle Eye EyeSlash FaceFrown
  FingerPrint Folder Funnel GlobeAlt GlobeEuropeAfrica Hashtag Home Identification Inbox InformationCircle Key Language
  LightBulb Link LockClosed LockOpen MagnifyingGlass Moon NoSymbol PaintBrush PaperAirplane PauseCircle Pause PencilSquare
  Photo Plus QrCode QuestionMarkCircle ReceiptPercent RocketLaunch Scale Server ServerStack ShieldCheck ShieldExclamation
  Signal SignalSlash Sparkles Squares2X2 Sun Tag Trash UserCircle UserGroup User UserPlus Users Wallet XCircle XMark`;
const USED_SOLID = `ArrowDown ArrowPath ArrowUp Beaker CheckCircle ChevronDown ChevronLeft ChevronRight ChevronUp ChevronUpDown
  DocumentDuplicate ExclamationTriangle GlobeAlt PuzzlePiece`;
const names = (list: string) => list.split(/\s+/).map((name) => `${name}Icon`);

describe('the icons of the set', () => {
  // The owner, 2026-11-11: the library works as Heroicons do, with the same names
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

// The owner, 2026-11-11: icons of TUWA's own for the Transactions and Webhooks of the Quasar dashboard, beside the
// Heroicons names and never in place of one
describe('the icons of TUWA', () => {
  it('are the pulsar of Transactions and the loop of Webhooks, each with a lit pixel', () => {
    expect(iconsOf(tuwa).map(([name]) => name)).toEqual(['TransactionsIcon', 'WebhooksIcon']);
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

describe('the package', () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, 'package.json'), 'utf8')) as {
    exports: Record<string, Record<string, string>>;
    sideEffects: unknown;
  };

  // An app swaps `@heroicons/react/<path>` for `@tuwaio/nova-icons/<path>`: the paths of Heroicons, the mini (20) and
  // micro (16) solid ones drawn once on the same 16 x 16 grid
  it('has the import paths of Heroicons, all solid paths leading to the one solid set', () => {
    expect(Object.keys(pkg.exports)).toEqual(
      expect.arrayContaining(['.', './24/outline', './24/solid', './20/solid', './16/solid', './tuwa', './motion.css']),
    );
    expect(pkg.exports['./20/solid']).toEqual(pkg.exports['./24/solid']);
    expect(pkg.exports['./16/solid']).toEqual(pkg.exports['./24/solid']);
  });

  // `sideEffects: false` would let a bundler drop `import '@tuwaio/nova-icons/motion.css'` as an unused import
  it('keeps its stylesheet when a bundler drops what is unused', () => {
    expect(pkg.sideEffects).toEqual(['*.css']);
  });

  // The owner, 2026-11-11: each motion plays once, in plain CSS, and never for a reader who asks for less motion
  it('animates in plain CSS, each motion once, and not at all under reduced motion', () => {
    const css = readFileSync(join(PACKAGE, 'motion.css'), 'utf8');
    expect(css).toMatch(/@keyframes nova-icon-gather/);
    expect(css).toMatch(/@keyframes nova-icon-breathe/);
    expect(css).not.toMatch(/infinite/);
    for (let step = 1; step <= 30; step++) expect(css, `step ${step}`).toContain(`[data-step='${step}']`);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[^}]*\{[^}]*animation: none/);
  });
});
