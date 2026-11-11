import { describe, expect, it, vi } from 'vitest';

const reduceMotion = vi.hoisted(() => ({ value: false }));

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => reduceMotion.value,
}));
// No renderer: the default of each context (no provider, no AnimatePresence)
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useContext: (context: { _currentValue: unknown }) => context._currentValue,
  useState: (initial: unknown) => [
    typeof initial === 'function' ? (initial as () => unknown)() : initial,
    () => undefined,
  ],
}));

import { DrawnCheck, DrawnCross } from './DrawnCheck';

type Node = { type: unknown; props: Record<string, unknown> };

// The marks render one inner component: this runs it, so that the strokes can be read
const svgOf = (element: unknown) => {
  const { type, props } = element as { type: (props: object) => Node; props: object };
  return type(props);
};
const parts = (svg: Node) => (svg.props.children as unknown[]).flat().filter(Boolean) as Node[];
const strokes = (svg: Node) => parts(svg).filter((part) => part.props.d);
const discs = (svg: Node) => parts(svg).filter((part) => part.type === 'circle');

// The classic look; the pixel one is in src/pixel/pixel.test.tsx
describe('DrawnCheck and DrawnCross, classic', () => {
  it('draw themselves from nothing, so that a result is seen happening', () => {
    reduceMotion.value = false;
    for (const mark of [DrawnCheck({ look: 'classic' }), DrawnCross({ look: 'classic' })]) {
      for (const stroke of strokes(svgOf(mark))) {
        expect(stroke.props.initial).toMatchObject({ pathLength: 0 });
        expect(stroke.props.animate).toMatchObject({ pathLength: 1 });
      }
    }
  });

  it('are simply shown with prefers-reduced-motion', () => {
    reduceMotion.value = true;

    expect(strokes(svgOf(DrawnCheck({ look: 'classic' })))[0].props.initial).toBe(false);
    expect(strokes(svgOf(DrawnCross({ look: 'classic' })))[1].props.initial).toBe(false);
  });

  it('draw the cross stroke by stroke', () => {
    reduceMotion.value = false;
    const [first, second] = strokes(svgOf(DrawnCross({ look: 'classic' })));
    const delayOf = (stroke: Node) => (stroke.props.transition as { pathLength: { delay: number } }).pathLength.delay;

    expect(delayOf(second)).toBeGreaterThan(delayOf(first));
  });

  it('have a disc only in that variant', () => {
    reduceMotion.value = false;

    expect(discs(svgOf(DrawnCheck({ look: 'classic' })))).toHaveLength(0);
    expect(discs(svgOf(DrawnCross({ variant: 'disc', look: 'classic' })))).toHaveLength(1);
  });
});
