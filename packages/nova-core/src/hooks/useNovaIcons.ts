/**
 * @file The icons of the Nova components and their look: the pixel ones of `@tuwaio/nova-icons` by default, or another set
 * (Heroicons, through `@tuwaio/nova-core/heroicons`) given to a `NovaIconsProvider`.
 */

import {
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
} from '@tuwaio/nova-icons/24/outline';
import {
  ArrowPathIcon as ArrowPathSolidIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
} from '@tuwaio/nova-icons/24/solid';
import { globalSingleton } from '@tuwaio/orbit-core';
import { type ComponentType, createContext, type SVGProps, useContext } from 'react';

/** The outline icons the Nova components draw, named as in Heroicons. */
export const NOVA_OUTLINE_ICONS = [
  'ArrowLeftIcon',
  'ArrowPathIcon',
  'ArrowRightIcon',
  'ArrowsRightLeftIcon',
  'BoltIcon',
  'CheckCircleIcon',
  'ClockIcon',
  'CloudArrowUpIcon',
  'CloudIcon',
  'CommandLineIcon',
  'CpuChipIcon',
  'DocumentTextIcon',
  'ExclamationCircleIcon',
  'ExclamationTriangleIcon',
  'InformationCircleIcon',
  'WalletIcon',
  'XCircleIcon',
] as const;

/** The solid icons the Nova components draw, named as in Heroicons. */
export const NOVA_SOLID_ICONS = [
  'ArrowPathIcon',
  'ChevronDownIcon',
  'ChevronLeftIcon',
  'ChevronRightIcon',
  'ChevronUpIcon',
  'ExclamationTriangleIcon',
  'GlobeAltIcon',
  'PuzzlePieceIcon',
] as const;

/** An icon component of a set: the props of an SVG element, as an icon of Heroicons takes them. */
export type NovaIconComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string; titleId?: string }>;

/**
 * The look of the Nova components: `pixel`, the TUWA retro pixel style, or `classic`, the thin lines Nova had before. The
 * loaders, the drawn marks, the pictures and the star field follow it.
 */
export type NovaLook = 'pixel' | 'classic';

/**
 * A set of icons for the Nova components and the look of what they draw themselves.
 *
 * - `look`: the look of the loaders, the drawn marks, the pictures and the star field (`NovaLook`).
 * - `outline`: a component for each name of `NOVA_OUTLINE_ICONS`.
 * - `solid`: a component for each name of `NOVA_SOLID_ICONS`.
 */
export type NovaIconSet = {
  look: NovaLook;
  outline: Record<(typeof NOVA_OUTLINE_ICONS)[number], NovaIconComponent>;
  solid: Record<(typeof NOVA_SOLID_ICONS)[number], NovaIconComponent>;
};

/** The default set: the pixel icons of `@tuwaio/nova-icons` and the pixel look. */
export const pixelIcons: NovaIconSet = {
  look: 'pixel',
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

/**
 * The icon set of the closest `NovaIconsProvider`, shared on `globalThis` so that two copies of this package agree.
 * Without a provider it is `pixelIcons`.
 */
export const NovaIconsContext = globalSingleton('tuwaio.nova-core.icons', () => createContext<NovaIconSet>(pixelIcons));

/**
 * Returns the icon set of the closest `NovaIconsProvider`: the icons the Nova components draw, and their look.
 *
 * @returns The set; `pixelIcons` without a provider.
 *
 * @example
 * ```tsx
 * import { useNovaIcons } from '@tuwaio/nova-core';
 *
 * export function RetryLabel() {
 *   const { solid } = useNovaIcons();
 *   return (
 *     <span>
 *       <solid.ArrowPathIcon className="h-4 w-4" aria-hidden /> Retry
 *     </span>
 *   );
 * }
 * ```
 */
export function useNovaIcons(): NovaIconSet {
  return useContext(NovaIconsContext);
}
