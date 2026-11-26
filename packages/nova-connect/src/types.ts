/**
 * Chain configuration types of the networks the app imports. Importing `@tuwaio/nova-connect/evm` adds `appChains`
 * (the viem chains of your wagmi config, `readonly [Chain, ...Chain[]]`); importing `@tuwaio/nova-connect/solana` adds
 * `solanaRPCUrls` (the RPC URLs by `SolanaClusterMoniker` from `@tuwaio/orbit-solana`). Read the resulting types through
 * {@link NovaConnectAppChains} and {@link NovaConnectSolanaRPCUrls}.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NovaConnectChainConfigTypes {}

/**
 * Type of `appChains`: the viem chains (`readonly [Chain, ...Chain[]]`) when `@tuwaio/nova-connect/evm` is imported,
 * otherwise a list of objects with a numeric `id` (a list of viem chains fits too).
 */
export type NovaConnectAppChains = NovaConnectChainConfigTypes extends { appChains: infer T }
  ? T
  : readonly { readonly id: number }[];

/**
 * Type of `solanaRPCUrls`: an RPC URL, or several, for each cluster moniker (`SolanaClusterMoniker` from
 * `@tuwaio/orbit-solana`) when `@tuwaio/nova-connect/solana` is imported, otherwise for each cluster name.
 */
export type NovaConnectSolanaRPCUrls = NovaConnectChainConfigTypes extends { solanaRPCUrls: infer T }
  ? T
  : Readonly<Partial<Record<string, string | readonly string[]>>>;

/**
 * Chain configuration of the app, passed to `NovaConnectProvider` as `appChains` and `solanaRPCUrls`. The provider
 * renders the connect and connected modals only when at least one of them is set, and a wallet connects to the first
 * EVM chain or the first Solana cluster of these lists.
 */
export interface AllChainConfigs {
  /** EVM chains of the app, the viem chains of your wagmi config. See {@link NovaConnectAppChains}. */
  appChains?: NovaConnectAppChains;

  /**
   * Solana RPC URL for each cluster moniker, or several, for example `{ devnet: 'https://api.devnet.solana.com' }`: the same
   * object the Satellite adapter takes. Nova Connect reads the clusters alone and calls no URL. See
   * {@link NovaConnectSolanaRPCUrls}.
   */
  solanaRPCUrls?: NovaConnectSolanaRPCUrls;
}

/**
 * Alias of {@link AllChainConfigs}.
 */
export type InitialChains = AllChainConfigs;
