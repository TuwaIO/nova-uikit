import { pixelFlight as flightOfNovaIcons } from '@tuwaio/nova-icons';

/**
 * Where a pixel of a picture that assembles itself comes from, and when: `pixelFlight` of `@tuwaio/nova-icons`, the one
 * motion of every pixel drawing of Nova (the icons, the marks of a result, the pictures of the connect modal). Give each
 * pixel `data-px` and this `style`, and its parent `data-motion="assemble"`: the pixel flies in to its place from a spot
 * 3 to 7 cells away (times `spread`), after a delay of up to `stagger` ms, once, with a little overshoot. The same pixel
 * gets the same spot on every render.
 *
 * @param x - The column of the pixel on its grid.
 * @param y - The row of the pixel on its grid.
 * @param options - How far and over how long the pixels come.
 * @param options.spread - The distance in cells, times this; 1 by default.
 * @param options.stagger - The longest delay of a pixel, in ms; 220 by default.
 * @returns The `style` of the pixel: `--nova-px-x`, `--nova-px-y` and `--nova-px-delay`.
 */
export const pixelFlight: (
  x: number,
  y: number,
  options?: { spread?: number; stagger?: number },
) => ReturnType<typeof flightOfNovaIcons> = flightOfNovaIcons;
