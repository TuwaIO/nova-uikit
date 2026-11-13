/**
 * @file The Heroicons set of the Nova components: with it they look as Nova did before the pixel icons. A separate entry,
 * `@tuwaio/nova-core/heroicons`, so that only an app that takes it loads `@heroicons/react` (an optional peer dependency).
 */

import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  ArrowUturnLeftIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CloudIcon,
  CommandLineIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  InformationCircleIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  QrCodeIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowPathIcon as ArrowPathSolidIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/solid';

import type { NovaIconSet } from './hooks/useNovaIcons';

/**
 * The icons of Heroicons and the `classic` look: the thin lines, the loader, the drawn marks, the pictures and the star
 * field that Nova had before the pixel style. Give it to `NovaIconsProvider`, or to the `icons` prop of
 * `NovaConnectProvider` or `NovaTransactionsProvider`. It also has the icons of `NOVA_EXTRA_OUTLINE_ICONS`, which packages
 * built on Nova draw (the checkout of Nova Payments), so that their icons change with those of Nova.
 *
 * @example
 * ```tsx
 * import { NovaIconsProvider } from '@tuwaio/nova-core';
 * import { heroicons } from '@tuwaio/nova-core/heroicons';
 * import type { ReactNode } from 'react';
 *
 * export function ClassicNova({ children }: { children: ReactNode }) {
 *   return <NovaIconsProvider icons={heroicons}>{children}</NovaIconsProvider>;
 * }
 * ```
 */
export const heroicons: NovaIconSet = {
  look: 'classic',
  outline: {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    ArrowsRightLeftIcon,
    BoltIcon,
    CheckCircleIcon,
    ClockIcon,
    CloudArrowUpIcon,
    CloudIcon,
    CommandLineIcon,
    CpuChipIcon,
    DocumentTextIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    WalletIcon,
    XCircleIcon,
    // What packages built on Nova draw (`NOVA_EXTRA_OUTLINE_ICONS`): with this set they are of Heroicons too
    ArrowDownTrayIcon,
    ArrowPathRoundedSquareIcon,
    ArrowUturnLeftIcon,
    DevicePhoneMobileIcon,
    FingerPrintIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    NoSymbolIcon,
    QrCodeIcon,
  },
  solid: {
    ArrowPathIcon: ArrowPathSolidIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ExclamationTriangleIcon: ExclamationTriangleSolidIcon,
    GlobeAltIcon,
    PuzzlePieceIcon,
  },
};
