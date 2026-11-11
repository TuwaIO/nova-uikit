import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

// No renderer: the default of the icon set
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useContext: (context: { _currentValue: unknown }) => context._currentValue,
}));

import { TrashIcon } from './TrashIcon';

const css = readFileSync(join(__dirname, '../styles/icons.css'), 'utf8');

type Props = { children?: ReactNode; className?: string; d?: string };

const childrenOf = (element: ReactElement<Props>) => [element.props.children].flat() as ReactElement<Props>[];

describe('TrashIcon', () => {
  it('draws the lid apart from the bin, so that it can open', () => {
    const svg = TrashIcon({ className: 'h-4 w-4', look: 'classic' }) as ReactElement<Props>;
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
    // As heavy as the rules that open it (button:not(:disabled)…) and after them, so that the lid closes on a press: a plain
    // `button:active` weighs less than `button:not(:disabled):hover` and never won
    for (const lid of ['tuwa-trash-lid', 'tuwa-trash-lid-px']) {
      expect(css).toMatch(new RegExp(`button:not\\(:disabled\\):active \\.${lid}\\s*\\{[^}]*transform: none`));
      expect(css.indexOf(`button:not(:disabled):active .${lid}`)).toBeGreaterThan(
        css.indexOf(`button:not(:disabled):hover .${lid}`),
      );
    }
  });

  it('stays still with reduced motion', () => {
    expect(css.slice(css.indexOf('prefers-reduced-motion'))).toContain('.tuwa-trash-lid');
  });
});
