import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { hasArt, strokeMotion } from './AboutWalletsArt';

describe('strokeMotion', () => {
  it('draws a stroke in from nothing, after its delay', () => {
    const { initial, animate, transition } = strokeMotion(true, 0.5, false) as unknown as {
      initial: object;
      animate: object;
      transition: { pathLength: { delay: number } };
    };

    expect(initial).toEqual({ pathLength: 0, opacity: 0 });
    expect(animate).toEqual({ pathLength: 1, opacity: 1 });
    expect(transition.pathLength.delay).toBe(0.5);
  });

  it('draws one away at once, so that it turns into the next', () => {
    const { animate, transition } = strokeMotion(false, 0.5, false) as unknown as {
      animate: object;
      transition: { pathLength: { delay?: number } };
    };

    expect(animate).toEqual({ pathLength: 0, opacity: 0 });
    expect(transition.pathLength.delay).toBeUndefined();
  });

  it('simply shows it with prefers-reduced-motion', () => {
    const { initial, transition } = strokeMotion(true, 0.5, true);

    expect(initial).toBe(false);
    expect(transition).toEqual({ duration: 0 });
  });
});

describe('hasArt', () => {
  it('holds for the built-in slides only: an app slide keeps its own image', () => {
    expect([1, 2, 3].map(hasArt)).toEqual([true, true, false]);
  });
});

describe('the slow motion', () => {
  it('stops with prefers-reduced-motion', () => {
    const css = readFileSync(path.resolve(__dirname, '../../styles/app.css'), 'utf8');
    const still = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

    expect(still).toContain('.novacon-art-flow');
    expect(still).toContain('.novacon-art-breathe');
    expect(still).toContain('.novacon-art-float');
    expect(still).toContain('.novacon-art-twinkle');
  });
});
