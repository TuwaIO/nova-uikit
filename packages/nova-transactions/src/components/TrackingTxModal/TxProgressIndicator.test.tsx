import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../../i18n/en';

vi.mock('../../providers', () => ({
  useLabels: () => defaultLabels,
}));

import { TxProgressIndicator } from './TxProgressIndicator';

type Step = { props: { status: string; label: string } };

function stepsOf(props: Parameters<typeof TxProgressIndicator>[0]) {
  const element = TxProgressIndicator(props) as unknown as { props: { children: Step[] } };
  return element.props.children.map((step) => ({ status: step.props.status, label: step.props.label }));
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
});
