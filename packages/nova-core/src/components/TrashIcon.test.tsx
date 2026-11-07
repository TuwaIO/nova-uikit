import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { TrashIcon } from './TrashIcon';

const css = readFileSync(join(__dirname, '../styles/icons.css'), 'utf8');

type Props = { children?: ReactNode; className?: string; d?: string };

const childrenOf = (element: ReactElement<Props>) => [element.props.children].flat() as ReactElement<Props>[];

describe('TrashIcon', () => {
  it('draws the lid apart from the bin, so that it can open', () => {
    const svg = TrashIcon({ className: 'h-4 w-4' }) as ReactElement<Props>;
    const parts = childrenOf(svg);
    const lid = parts.find((part) => part.props.className === 'tuwa-trash-lid');
    const lidPaths = childrenOf(lid!).map((path) => path.props.d);
    const binPaths = parts.filter((part) => part !== lid).map((path) => path.props.d);

    // The rim and the handle move, the walls and the ribs do not
    expect(lidPaths.some((d) => d?.startsWith('M3.75 5.955'))).toBe(true);
    expect(lidPaths.some((d) => d?.startsWith('M15.75 5.393'))).toBe(true);
    expect(binPaths.some((d) => d?.startsWith('M14.74 9'))).toBe(true);
    expect(binPaths.some((d) => d?.startsWith('M19.228 5.79 18.16'))).toBe(true);
    expect(svg.props.className).toContain('h-4 w-4');
  });

  it('opens on hover and focus, closes on a press, and a disabled button stays closed', () => {
    expect(css).toMatch(/button:not\(:disabled\):hover \.tuwa-trash-lid/);
    expect(css).toMatch(/button:not\(:disabled\):focus-visible \.tuwa-trash-lid/);
    expect(css).toMatch(/button:active \.tuwa-trash-lid\s*\{[^}]*transform: none/);
    // After the rules that open it: of two rules of the same weight, the later one wins
    expect(css.indexOf('button:active .tuwa-trash-lid')).toBeGreaterThan(
      css.indexOf('button:not(:disabled):hover .tuwa-trash-lid'),
    );
  });

  it('stays still with reduced motion', () => {
    expect(css.slice(css.indexOf('prefers-reduced-motion'))).toContain('.tuwa-trash-lid');
  });
});
