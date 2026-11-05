import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useId: () => ':r1:',
}));

import { QuasarLoader } from './QuasarLoader';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

const classesOf = (tree: unknown) => elements(tree).map((element) => String(element.props.className ?? ''));

describe('QuasarLoader', () => {
  it('is the whole mark from 28 px and the compact one below that', () => {
    expect(classesOf(QuasarLoader({ size: 40 }))).toContain('tuwa-ql-jet');
    expect(classesOf(QuasarLoader({ size: 28 }))).toContain('tuwa-ql-jet');
    expect(classesOf(QuasarLoader({ size: 16 }))).not.toContain('tuwa-ql-jet');
    expect(classesOf(QuasarLoader({ size: 16, variant: 'full' }))).toContain('tuwa-ql-jet');
  });

  it('is announced only with a label, and is decorative without one', () => {
    const labelled = QuasarLoader({ label: 'Loading' }) as unknown as Element;
    const plain = QuasarLoader({}) as unknown as Element;

    expect(labelled.props.role).toBe('status');
    expect(labelled.props['aria-label']).toBe('Loading');
    expect(plain.props.role).toBeUndefined();
    expect(plain.props['aria-hidden']).toBe(true);
  });

  it('takes its color from the accent prop', () => {
    const tree = QuasarLoader({ accent: 'var(--tuwa-pending-icon)' }) as unknown as Element;

    expect((tree.props.style as Record<string, unknown>)['--tuwa-loader-accent']).toBe('var(--tuwa-pending-icon)');
  });

  it('has a clip path id that is a plain name: colons from useId would not work inside url(#…)', () => {
    const ids = elements(QuasarLoader({})).flatMap((element) => (element.props.id ? [String(element.props.id)] : []));

    expect(ids).toEqual(['r1-far', 'r1-near']);
  });

  it('holds still with prefers-reduced-motion', () => {
    const css = readFileSync(path.resolve(__dirname, '../styles/quasar-loader.css'), 'utf8');

    expect(css).toMatch(
      /prefers-reduced-motion: reduce\) \{\s*\.tuwa-quasar-loader \* \{\s*animation: none !important;/,
    );
  });
});
