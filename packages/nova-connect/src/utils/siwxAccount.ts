/**
 * @file SIWX sessions that belong to an account rather than to one chain: the `'account'` scope of `NovaSiwxWatcher`.
 */

import { parseCaip10AccountId } from '@tuwaio/orbit-core';

/**
 * The account of a CAIP-10 account ID without its chain: the namespace and the address, with an `eip155` address in
 * lower case and any other address (Solana base58) as it is.
 *
 * @param accountId - A CAIP-10 account ID, such as `eip155:8453:0xAbc…` or `solana:EtWTRABZ…:4sGj…`.
 * @returns `<namespace>:<address>`, or `accountId` itself when it is not a CAIP-10 account ID.
 * @internal
 */
export function accountKey(accountId: string): string {
  const account = parseCaip10AccountId(accountId);
  if (!account) return accountId;
  return `${account.namespace}:${account.namespace === 'eip155' ? account.address.toLowerCase() : account.address}`;
}

/**
 * Whether a SIWX session was signed by an account, on any chain of its namespace: the same namespace and address
 * (`eip155` addresses compared in lower case, Solana addresses exactly). A network or cluster switch of that account
 * keeps the session.
 *
 * @param session - The SIWX session (`session` of `useSiwxSessionStore` from `@tuwaio/siwx-react`), whose `address` is
 * a CAIP-10 account ID.
 * @param accountId - The CAIP-10 account ID of the connected wallet.
 * @returns `true` for the same account; `false` for another one, without a session, or when an ID is not CAIP-10.
 * @internal
 */
export function isSessionForAccount(session: { address: string } | null | undefined, accountId: string): boolean {
  if (!session) return false;
  const signed = parseCaip10AccountId(session.address);
  const connected = parseCaip10AccountId(accountId);
  if (!signed || !connected || signed.namespace !== connected.namespace) return false;
  return accountKey(session.address) === accountKey(accountId);
}
