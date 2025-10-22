export * from './utils';
export * from '@tuwaio/satellite-react/evm';

// Re-export viem types directly when available
export type { Chain } from 'viem/chains';
// Import types for extension
import type { Chain } from 'viem/chains';

// Extend the main interface with EVM-specific config
// This will override the default `any` type with specific Chain[] typing
// eslint-disable-next-line
// @ts-ignore - Need for declaration merging
declare module '@tuwaio/nova-connect' {
  interface AllChainConfigs {
    /**
     * EVM chains configuration - enhanced from default any type
     * @override Replaces default `any` with specific Chain typing when viem is available
     */
    // eslint-disable-next-line
    // @ts-ignore - Need for declaration merging
    appChains?: readonly [Chain, ...Chain[]];
  }
}
