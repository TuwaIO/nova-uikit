/**
 * @file The pixels of the pixel picture of the "About wallets" slides, on a grid of 64: the plate, the network behind the
 * subject, the key on its orbit and the wallet with its circuit. Worked out once, when the module loads.
 */

/** A pixel of the picture. */
export type Cell = { x: number; y: number };

const N = 64;
const scale = (value: number) => value * (N / 200);

/** The pixels of a two-pixel pen moved along a polyline: lines two pixels wide, diagonals three. */
function pen(points: [number, number][]): Cell[] {
  const cells = new Map<string, Cell>();
  const put = (x: number, y: number) => {
    for (const [dx, dy] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      cells.set(`${x + dx},${y + dy}`, { x: x + dx, y: y + dy });
    }
  };
  points.slice(1).forEach(([x1, y1], index) => {
    let [x, y] = points[index];
    const dx = Math.abs(x1 - x);
    const dy = Math.abs(y1 - y);
    const sx = x < x1 ? 1 : -1;
    const sy = y < y1 ? 1 : -1;
    let error = dx - dy;
    for (;;) {
      put(x, y);
      if (x === x1 && y === y1) break;
      const twice = 2 * error;
      if (twice > -dy) {
        error -= dy;
        x += sx;
      }
      if (twice < dx) {
        error += dx;
        y += sy;
      }
    }
  });
  return [...cells.values()];
}

/** The pixels of a one-pixel line through points, in order along it. */
function line(points: [number, number][]): Cell[] {
  const cells: Cell[] = [];
  points.slice(1).forEach(([x1, y1], index) => {
    let [x, y] = points[index].map(Math.round) as [number, number];
    [x1, y1] = [Math.round(x1), Math.round(y1)];
    const dx = Math.abs(x1 - x);
    const dy = Math.abs(y1 - y);
    const sx = x < x1 ? 1 : -1;
    const sy = y < y1 ? 1 : -1;
    let error = dx - dy;
    for (;;) {
      if (!cells.some((cell) => cell.x === x && cell.y === y)) cells.push({ x, y });
      if (x === x1 && y === y1) break;
      const twice = 2 * error;
      if (twice > -dy) {
        error -= dy;
        x += sx;
      }
      if (twice < dx) {
        error += dx;
        y += sy;
      }
    }
  });
  return cells;
}

/** The pixels of a ring of outer radius `r` and width `w` around a centre. */
function ring(cx: number, cy: number, r: number, w: number): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r && d > r - w) cells.push({ x, y });
    }
  }
  return cells;
}

/** The pixels of a tilted ellipse, one pixel wide, in order round it. */
function ellipse(cx: number, cy: number, rx: number, ry: number, degrees: number): Cell[] {
  const tilt = (degrees * Math.PI) / 180;
  const cells: Cell[] = [];
  for (let step = 0; step < 1440; step++) {
    const angle = (step / 1440) * Math.PI * 2;
    const x = Math.floor(cx + rx * Math.cos(angle) * Math.cos(tilt) - ry * Math.sin(angle) * Math.sin(tilt));
    const y = Math.floor(cy + rx * Math.cos(angle) * Math.sin(tilt) + ry * Math.sin(angle) * Math.cos(tilt));
    if (!cells.some((cell) => cell.x === x && cell.y === y)) cells.push({ x, y });
  }
  return cells;
}

/** A filled square of pixels. */
const block = (x: number, y: number, size: number): Cell[] =>
  Array.from({ length: size * size }, (_, i) => ({ x: x + (i % size), y: y + Math.floor(i / size) }));

/** The outline of a box, two pixels wide, its corners cut. */
function box(x: number, y: number, w: number, h: number): Cell[] {
  const cells: Cell[] = [];
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const edge = i < 2 || j < 2 || i >= w - 2 || j >= h - 2;
      const corner = (i === 0 || i === w - 1) && (j === 0 || j === h - 1);
      if (edge && !corner) cells.push({ x: x + i, y: y + j });
    }
  }
  return cells;
}

/** The plate: a disc and its rim. */
export const PLATE = { disc: ring(32, 32, 31.6, 32), rim: ring(32, 32, 31.6, 1) };

/** The network behind the subject: four lines, each in order from its first point, and the nodes at their ends. */
export const NETWORK: Cell[][] = [
  [
    [24, 76],
    [54, 40],
    [98, 40],
  ],
  [
    [146, 34],
    [172, 68],
  ],
  [
    [178, 118],
    [148, 160],
    [102, 160],
  ],
  [
    [26, 126],
    [54, 162],
  ],
].map((points) => line(points.map(([x, y]) => [scale(x), scale(y)] as [number, number])));

/** The nodes of the network, two pixels square. */
export const NODES: Cell[] = [
  [24, 76],
  [98, 40],
  [146, 34],
  [172, 68],
  [178, 118],
  [102, 160],
  [26, 126],
  [54, 162],
].map(([x, y]) => ({ x: Math.round(scale(x)) - 1, y: Math.round(scale(y)) - 1 }));

/** A subject: its lines, its lit pixels, its accent lines that a light runs along, and where its core sits. */
export type Subject = { ink: Cell[]; lit: Cell[]; paths: Cell[][]; core: Cell };

/** The key: a ring with a shaft and two teeth, their tips lit, on an orbit round the ring. */
export const KEY: Subject = {
  ink: [
    ...ring(26.5, 36.3, 9.4, 2),
    ...pen([
      [32, 30],
      [48, 17],
    ]),
    ...pen([
      [44, 21],
      [46, 24],
    ]),
    ...pen([
      [48, 18],
      [50, 20],
    ]),
  ],
  lit: [...block(46, 25, 3), ...block(50, 21, 3)],
  paths: [ellipse(26.5, 36.3, 13, 3.6, -60)],
  core: { x: 26, y: 36 },
};

/** The wallet: a body with the flap of a card behind it, a clasp, and a circuit from two lit nodes to the clasp. */
export const WALLET: Subject = {
  ink: [
    ...box(13, 21, 37, 25),
    ...pen([
      [18, 19],
      [34, 14],
      [37, 15],
      [37, 19],
    ]),
    ...box(39, 28, 11, 10),
  ],
  lit: [...block(20, 29, 3), ...block(21, 35, 3)],
  paths: [
    line([
      [38, 33],
      [30, 33],
      [27, 30],
      [23, 30],
    ]),
    line([
      [30, 33],
      [27, 36],
      [24, 36],
    ]),
  ],
  core: { x: 44, y: 32 },
};

/**
 * The pixels split by diagonal (the sum of x and y), for a picture that gathers from the top left.
 *
 * @param cells - The pixels.
 * @returns For each diagonal that has pixels, its number and its path data.
 */
export function byDiagonal(cells: Cell[]): { step: number; d: string }[] {
  const steps = new Map<number, string>();
  for (const { x, y } of cells) steps.set(x + y, `${steps.get(x + y) ?? ''}M${x} ${y}h1v1h-1z`);
  return [...steps].sort(([a], [b]) => a - b).map(([step, d]) => ({ step, d }));
}

/**
 * Path data of pixels.
 *
 * @param cells - The pixels.
 * @returns One square per pixel.
 */
export const pathOf = (cells: Cell[]) => cells.map(({ x, y }) => `M${x} ${y}h1v1h-1z`).join('');
