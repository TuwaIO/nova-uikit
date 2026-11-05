import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('../../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TxProgressIndicator } from './TxProgressIndicator';

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
