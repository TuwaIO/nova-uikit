import { describe, expect, it } from 'vitest';

import { accountKey, isSessionForAccount } from './siwxAccount';

const EVM = '0x1234567890AbcdEF1234567890aBcdef12345678';
const SOLANA = '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZAMdL4VZHirAn';
const SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
const SOLANA_DEVNET = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';

describe('accountKey', () => {
  it('drops the chain: an EVM address in lower case, a Solana address as it is', () => {
    expect(accountKey(`eip155:1:${EVM}`)).toBe(`eip155:${EVM.toLowerCase()}`);
    expect(accountKey(`eip155:8453:${EVM.toLowerCase()}`)).toBe(`eip155:${EVM.toLowerCase()}`);
    expect(accountKey(`${SOLANA_MAINNET}:${SOLANA}`)).toBe(`solana:${SOLANA}`);
    expect(accountKey(`${SOLANA_DEVNET}:${SOLANA}`)).toBe(`solana:${SOLANA}`);
  });

  it('keeps a value that is not a CAIP-10 account ID', () => {
    expect(accountKey('not-an-account')).toBe('not-an-account');
  });
});

describe('isSessionForAccount', () => {
  const session = (address: string, chainId: string) => ({ address: `${chainId}:${address}`, chainId });

  it('matches the same EVM account on any chain, in any letter case', () => {
    expect(isSessionForAccount(session(EVM.toLowerCase(), 'eip155:1'), `eip155:8453:${EVM}`)).toBe(true);
    expect(isSessionForAccount(session(EVM, 'eip155:42161'), `eip155:56:${EVM.toLowerCase()}`)).toBe(true);
  });

  it('matches the same Solana account on any cluster, and a session signed with a cluster name', () => {
    expect(isSessionForAccount(session(SOLANA, SOLANA_MAINNET), `${SOLANA_DEVNET}:${SOLANA}`)).toBe(true);
    expect(isSessionForAccount(session(SOLANA, 'solana:devnet'), `${SOLANA_MAINNET}:${SOLANA}`)).toBe(true);
  });

  it('refuses another account, another namespace, a Solana address in another case, and no session', () => {
    expect(isSessionForAccount(session(EVM, 'eip155:1'), `eip155:1:0x${'9'.repeat(40)}`)).toBe(false);
    expect(isSessionForAccount(session(EVM, 'eip155:1'), `${SOLANA_DEVNET}:${SOLANA}`)).toBe(false);
    expect(isSessionForAccount(session(SOLANA, SOLANA_DEVNET), `${SOLANA_DEVNET}:${SOLANA.toLowerCase()}`)).toBe(false);
    expect(isSessionForAccount(null, `eip155:1:${EVM}`)).toBe(false);
    expect(isSessionForAccount(session(EVM, 'eip155:1'), 'not-an-account')).toBe(false);
  });
});
