/**
 * @file An icon of the icon set of the closest `NovaIconsProvider`, by its name.
 */

import type { SVGProps } from 'react';

import { type NOVA_OUTLINE_ICONS, type NOVA_SOLID_ICONS, useNovaIcons } from '../hooks/useNovaIcons';

/**
 * Props of {@link NovaSetIcon}: the name of the icon, `outline` or `solid`, and the props of the SVG element.
 *
 * - `outline`: the name of an outline icon of the set (`NOVA_OUTLINE_ICONS`).
 * - `solid`: the name of a solid icon of the set (`NOVA_SOLID_ICONS`).
 * - `title`, `titleId`: what the icon means for a screen reader, and the `id` of that title.
 * - `motion`: a motion of the pixel icons of `@tuwaio/nova-icons` that plays once (`assemble` or `breathe`); an icon of
 *   another look is drawn without it.
 */
export type NovaSetIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
  motion?: 'assemble' | 'breathe';
} & (
    | { outline: (typeof NOVA_OUTLINE_ICONS)[number]; solid?: never }
    | { solid: (typeof NOVA_SOLID_ICONS)[number]; outline?: never }
  );

/**
 * Draws an icon of the icon set of the closest `NovaIconsProvider` (the pixel icons of `@tuwaio/nova-icons` without one).
 * The Nova components draw their icons through it, so that one set changes all of them.
 *
 * @param props - See {@link NovaSetIconProps}.
 * @returns The icon.
 *
 * @example
 * ```tsx
 * import { NovaSetIcon } from '@tuwaio/nova-core';
 *
 * export function RetryLabel() {
 *   return (
 *     <span>
 *       <NovaSetIcon solid="ArrowPathIcon" className="h-4 w-4" aria-hidden /> Retry
 *     </span>
 *   );
 * }
 * ```
 */
export function NovaSetIcon({ outline, solid, motion, ...props }: NovaSetIconProps) {
  const icons = useNovaIcons();
  const Icon = outline ? icons.outline[outline] : icons.solid[solid];
  // Only the pixel icons know `motion`: another icon would pass it on to its SVG element as an attribute
  return <Icon {...props} {...(motion && icons.look === 'pixel' ? { motion } : {})} />;
}
