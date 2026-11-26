import { normalizeError } from '@tuwaio/orbit-core';
import { UserRejectedRequestError } from 'viem';
import { describe, expect, it } from 'vitest';

import { isUserRejection } from './isUserRejection';

// The owner's pass of the Quasar stand: a sign-in message declined in MetaMask showed "Connection error · Cannot
// connect to the wallet" in the connect window, and over it a toast with viem's English message. Declining is an
// action of the person, told in their words, not an error
describe('isUserRejection', () => {
  it('knows a request declined in the wallet, whatever carries it', () => {
    // viem, as wagmi throws it
    expect(isUserRejection(normalizeError(new UserRejectedRequestError(new Error('User rejected the request.'))))).toBe(
      true,
    );
    // An EIP-1193 provider (MetaMask): code 4001
    expect(
      isUserRejection(
        normalizeError({ code: 4001, message: 'MetaMask Message Signature: User denied message signature.' }),
      ),
    ).toBe(true);
    // ethers
    expect(isUserRejection(normalizeError({ code: 'ACTION_REJECTED', message: 'user rejected action' }))).toBe(true);
    // The sign-in of SIWX keeps only the message of the error: `new Error(message)`
    expect(
      isUserRejection(
        normalizeError(
          new Error('User rejected the request.\n\nDetails: User rejected the request.\nVersion: viem@2.57.17'),
        ),
      ),
    ).toBe(true);
    // Wallet Standard and Solana wallets (Phantom, Solflare, Backpack)
    expect(isUserRejection(normalizeError(new Error('User rejected the request.')))).toBe(true);
    expect(isUserRejection(normalizeError(new Error('Approval Denied')))).toBe(true);
    expect(isUserRejection(normalizeError(new Error('The user declined the request')))).toBe(true);
  });

  it('takes no other failure for one', () => {
    expect(isUserRejection(normalizeError(new Error('Connector not found.')))).toBe(false);
    expect(isUserRejection(normalizeError(new Error('The wallet refused the chain')))).toBe(false);
    expect(isUserRejection(normalizeError({ code: -32603, message: 'Internal JSON-RPC error.' }))).toBe(false);
    expect(isUserRejection(undefined)).toBe(false);
    expect(isUserRejection(null)).toBe(false);
  });
});
