/**
 * @file The Heroicons set of the Nova components: with it they look as Nova did before the pixel icons. A separate entry,
 * `@tuwaio/nova-core/heroicons`, so that only an app that takes it loads `@heroicons/react` (an optional peer dependency).
 */

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CloudIcon,
  CommandLineIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
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
 * `NovaConnectProvider` or `NovaTransactionsProvider`.
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
    ArrowsRightLeftIcon,
    BoltIcon,
    CheckCircleIcon,
    ClockIcon,
    CloudArrowUpIcon,
    CloudIcon,
    CommandLineIcon,
    CpuChipIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
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
