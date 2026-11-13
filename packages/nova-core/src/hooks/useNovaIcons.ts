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
import type { ComponentType, Context, SVGProps } from 'react';
// A namespace: the react-server build of React (React Server Components) has no createContext and no useContext, and a named
// import of either would fail there when the module loads
import * as React from 'react';

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

/**
 * Outline icons that packages built on Nova draw and the Nova components do not, named as in Heroicons: a download, a
 * lock, a QR code, a phone, a fingerprint and the marks of the outcomes of a payment. A set may have them, and `heroicons`
 * of `@tuwaio/nova-core/heroicons` does. A package that draws one takes it from the set of the closest
 * `NovaIconsProvider` and falls back to its own icon when the set has none: a set made before these names stays whole,
 * and the default set has only what Nova draws, so an app that uses Nova alone loads nothing more.
 */
export const NOVA_EXTRA_OUTLINE_ICONS = [
  'ArrowDownTrayIcon',
  'ArrowPathRoundedSquareIcon',
  'ArrowUturnLeftIcon',
  'DevicePhoneMobileIcon',
  'FingerPrintIcon',
  'LockClosedIcon',
  'MagnifyingGlassIcon',
  'NoSymbolIcon',
  'QrCodeIcon',
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
 * - `outline`: a component for each name of `NOVA_OUTLINE_ICONS`, and, if the set has them, for the names of
 *   `NOVA_EXTRA_OUTLINE_ICONS`, which packages built on Nova draw.
 * - `solid`: a component for each name of `NOVA_SOLID_ICONS`.
 */
export type NovaIconSet = {
  look: NovaLook;
  outline: Record<(typeof NOVA_OUTLINE_ICONS)[number], NovaIconComponent> &
    Partial<Record<(typeof NOVA_EXTRA_OUTLINE_ICONS)[number], NovaIconComponent>>;
  solid: Record<(typeof NOVA_SOLID_ICONS)[number], NovaIconComponent>;
};

/**
 * The default set: the pixel icons of `@tuwaio/nova-icons` and the pixel look. It has the icons Nova draws and none of
 * `NOVA_EXTRA_OUTLINE_ICONS`: a package that draws one of those draws its own pixel icon without a set that has it.
 */
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

/** Whether this React has context: the react-server build (React Server Components) has none. */
const HAS_CONTEXT = 'createContext' in React && 'useContext' in React;

/**
 * The icon set of the closest `NovaIconsProvider`, shared on `globalThis` so that two copies of this package agree.
 * Without a provider it is `pixelIcons`. It does not exist in a React Server Component, where React has no context.
 */
export const NovaIconsContext = (
  HAS_CONTEXT
    ? globalSingleton('tuwaio.nova-core.icons', () => React.createContext<NovaIconSet>(pixelIcons))
    : undefined
) as Context<NovaIconSet>;

/**
 * Returns the icon set of the closest `NovaIconsProvider`: the icons the Nova components draw, and their look. In a React
 * Server Component, which has no context, it is `pixelIcons`: the loader and the icons that render there draw the pixel look
 * unless their `look` prop says otherwise.
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
  return useSetOfProvider();
}

/** Reads the context where React has one; chosen once, when the module loads, so every render calls the same hooks. */
const useSetOfProvider: () => NovaIconSet = HAS_CONTEXT ? () => React.useContext(NovaIconsContext) : () => pixelIcons;
