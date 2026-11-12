/**
 * The pixels of the frame of the pixel spinner, in order round it, clockwise from the middle of its top: the edge of a grid
 * of 10, two screen pixels each at 20 px. Square, as every mark of the steps (a ring of pixels read as the one circle left)
 *
 * @internal
 */
export const PIXEL_RING = (() => {
  const ring: { x: number; y: number }[] = [];
  const add = (x: number, y: number) => ring.push({ x, y });
  for (let x = 5; x <= 9; x++) add(x, 0);
  for (let y = 1; y <= 9; y++) add(9, y);
  for (let x = 8; x >= 0; x--) add(x, 9);
  for (let y = 8; y >= 0; y--) add(0, y);
  for (let x = 1; x <= 4; x++) add(x, 0);
  return ring;
})();
