import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('../../providers/NovaTransactionsLabelsProvider', () => ({ useLabels: () => defaultLabels }));

import { PixelActiveMark, TxProgressIndicator } from './TxProgressIndicator';

type Step = { props: { status: string; label: string } };
type Row = { props: { children: [Step[], unknown] } };

const rowOf = (props: Parameters<typeof TxProgressIndicator>[0]) =>
  (TxProgressIndicator(props) as unknown as { props: { children: Row } }).props.children;

function stepsOf(props: Parameters<typeof TxProgressIndicator>[0]) {
  return rowOf(props).props.children[0].map((step) => ({ status: step.props.status, label: step.props.label }));
}

describe('TxProgressIndicator', () => {
  it('marks the processing step active while the transaction is processed', () => {
    expect(stepsOf({ isProcessing: true })[1]).toEqual({
      status: 'active',
      label: defaultLabels.trackingModal.progressIndicator.processing,
    });
  });

  it('completes the processing step as confirmed and keeps the final step active until success', () => {
    const steps = stepsOf({ isProcessing: true, isConfirmed: true });

    expect(steps[1]).toEqual({ status: 'completed', label: defaultLabels.statuses.confirmed });
    expect(steps[2].status).toBe('active');
  });

  it('waits for one step at a time: the last one only once the processing step is passed', () => {
    const waiting = stepsOf({ isProcessing: true });

    expect(waiting.map((step) => step.status)).toEqual(['completed', 'active', 'inactive']);
  });

  it('has one glint for the whole wait, and none without one', () => {
    const glint = (props: Parameters<typeof TxProgressIndicator>[0]) => rowOf(props).props.children[1];

    expect(glint({ isProcessing: true })).toBeTruthy();
    expect(glint({ isSucceed: true })).toBeFalsy();
  });
});

// What Nova draws has a pixel variant
describe('the pixel spinner of a step', () => {
  type Rect = { type: string; props: { className?: string; style?: Record<string, number> } };
  const parts = () => (PixelActiveMark() as unknown as { props: { children: [Rect[], Rect] } }).props.children;

  it('runs a lit arc round its ring, each pixel in its turn', () => {
    const [ring, dot] = parts();
    expect(ring.length).toBeGreaterThan(16);
    expect(ring.map((rect) => rect.props.style?.['--i'])).toEqual(ring.map((_, index) => index));
    expect(dot.props.className).toBe('tuwa-tx-px-dot');
  });

  it('holds still with reduced motion, the arc parked at the top', () => {
    const css = readFileSync(path.resolve(__dirname, '../../styles/app.css'), 'utf8');
    expect(css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))).toMatch(
      /\.tuwa-tx-px-park \{\s*opacity: 1;/,
    );
    expect(
      parts()[0].filter((rect) => String(rect.props.className).includes('tuwa-tx-px-park')).length,
    ).toBeGreaterThan(0);
  });
});
