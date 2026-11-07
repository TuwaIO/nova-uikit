import type { ConnectorType } from '@tuwaio/orbit-core';
import { describe, expect, it } from 'vitest';

import { isConnectedAfterAttempt } from './isConnectedAfterAttempt';

const rabby = 'evm:rabbywallet' as ConnectorType;
const metaMask = 'evm:metamask' as ConnectorType;

describe('isConnectedAfterAttempt', () => {
  it('is true when the wallet asked for is active', () => {
    expect(isConnectedAfterAttempt({ activeConnection: { connectorType: rabby } }, rabby)).toBe(true);
  });

  // The window closed as a success, with no message anywhere, and the first wallet stayed active
  it('is false when a second wallet failed and the first stays active', () => {
    const state = { connectionError: { message: 'rejected' }, activeConnection: { connectorType: metaMask } };
    expect(isConnectedAfterAttempt(state, rabby)).toBe(false);
  });

  // The window showed success under the wallet chosen later and closed
  it('is false for a wallet left behind while the later attempt runs', () => {
    expect(isConnectedAfterAttempt({ connecting: true }, rabby)).toBe(false);
  });

  it('is false for a wallet left behind after the later attempt has connected', () => {
    expect(isConnectedAfterAttempt({ activeConnection: { connectorType: metaMask } }, rabby)).toBe(false);
  });
});
