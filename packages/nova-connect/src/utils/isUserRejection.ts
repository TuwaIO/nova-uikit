import type { TuwaErrorState } from '@tuwaio/orbit-core';

/** The codes of a request the person declined: EIP-1193 (`4001`), and ethers (`ACTION_REJECTED`). */
const DECLINED_CODES: readonly unknown[] = [4001, 'ACTION_REJECTED'];

/** The names of such errors: viem's `UserRejectedRequestError`, as `normalizeError` keeps it. */
const DECLINED_NAMES: readonly unknown[] = ['UserRejectedRequestError'];

/**
 * The words of wallets for a request the person declined: viem and EIP-1193 wallets ("User rejected the request",
 * "User denied message signature"), Wallet Standard and Solana wallets ("User rejected the request", "Approval
 * Denied"). The sign-in of SIWX keeps only the message of the error, so the words are all that is left of it there.
 */
const DECLINED_WORDS =
  /\b(?:user (?:rejected|denied|declined|cancell?ed|refused)|rejected the request|declined the request|request (?:was )?(?:rejected|denied|declined|cancell?ed)|denied (?:message|transaction) signature|approval denied)\b/i;

/**
 * Whether a failed wallet request is the person declining it in the wallet (the connection, the sign-in message, a
 * network switch), not a failure: an action of theirs, which the interface tells in their words and does not toast as
 * an error.
 *
 * @param error - The error as the Satellite store keeps it (`connectionError`, `switchNetworkError`: `normalizeError`
 *   of `@tuwaio/orbit-core`), or none.
 * @returns `true` for a request declined in the wallet.
 */
export function isUserRejection(error: TuwaErrorState | null | undefined): boolean {
  if (!error) return false;
  const raw: Record<string, unknown> = error.raw ?? {};
  const cause = raw.cause && typeof raw.cause === 'object' ? (raw.cause as Record<string, unknown>) : {};
  if ([raw.code, cause.code].some((code) => DECLINED_CODES.includes(code))) return true;
  if ([raw.name, raw.originalType, cause.name].some((name) => DECLINED_NAMES.includes(name))) return true;
  return [error.message, raw.shortMessage, raw.details, raw.message].some(
    (text) => typeof text === 'string' && DECLINED_WORDS.test(text),
  );
}
