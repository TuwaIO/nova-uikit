import { ComponentProps } from 'react';

/**
 * Props for the SvgImg component.
 */
export interface SvgImgProps extends Omit<ComponentProps<'img'>, 'src' | 'draggable'> {
  /** Base64-encoded SVG data URL */
  src: string;
}

/**
 * Renders an SVG as an isolated `<img>` element.
 *
 * Prevents SVG ID conflicts and disables drag/selection behavior.
 *
 * @param props - {@link SvgImgProps}
 */
export function SvgImg({ src, alt, ...props }: SvgImgProps) {
  return (
    <img
      {...props}
      src={src}
      alt={alt ?? ''}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      style={{ outline: 'none', pointerEvents: 'none' }}
    />
  );
}
