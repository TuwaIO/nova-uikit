import type { ConnectorType } from '@tuwaio/orbit-core';

/**
 * Whether a finished `connect` of the Satellite store left its wallet as the active one. `connect` does not reject: a
 * failure is in `connectionError`, a later attempt keeps `connecting` set, and a wallet the user moved on from answers
 * without becoming active. Without this, any of them closed the window as a success under another wallet.
 *
 * @param state - The state of the store after `connect`.
 * @param state.connecting - Whether another attempt is under way.
 * @param state.connectionError - The error of the attempt, if any.
 * @param state.activeConnection - The active wallet.
 * @param connectorType - The wallet that was asked for.
 * @returns `true` when it is the active wallet and nothing else is going on.
 * @internal
 */
export function isConnectedAfterAttempt(
  state: {
    connecting?: boolean;
    connectionError?: unknown;
    activeConnection?: { connectorType: ConnectorType } | null;
  },
  connectorType: ConnectorType,
): boolean {
  return !state.connecting && !state.connectionError && state.activeConnection?.connectorType === connectorType;
}
