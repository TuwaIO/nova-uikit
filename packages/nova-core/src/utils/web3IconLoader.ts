import type { ComponentType, Ref } from 'react';

import { web3IconImports } from './web3IconImports';

/**
 * An icon component of `@web3icons/react`, with the props Nova passes to it.
 * @internal
 */
export type Web3IconComponent = ComponentType<{
  ref?: Ref<SVGSVGElement>;
  variant?: 'background' | 'branded' | 'mono';
  className?: string;
}>;

/** Icon components by key, loaded once per page. */
const iconCache = new Map<string, Promise<Web3IconComponent | null>>();

/**
 * Builds the component name of an icon of `@web3icons/react` from the `filePath` of its `@web3icons/common` metadata
 * (`'network:arbitrum-one'` → `'NetworkArbitrumOne'`, `'token:SHIB'` → `'TokenSHIB'`), as the library itself does.
 *
 * @param filePath - The `filePath` of a network, wallet, token or exchange in the metadata.
 * @returns The component name of the icon, its key in `web3IconImports`.
 * @internal
 */
export function getWeb3IconKey(filePath: string): string {
  const [type = '', name = ''] = filePath.split(':');
  const componentName =
    type === 'token'
      ? name.replace(/[- ]+/g, '_').toUpperCase()
      : (name.match(/[a-z0-9]+/gi) ?? []).map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join('');
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}${componentName}`;
}

/**
 * Loads one icon component of `@web3icons/react` through `web3IconImports`, so only that icon is downloaded. Unlike
 * the `@web3icons/react/dynamic` components, it does not load the metadata of every network, wallet, exchange and
 * token: the caller already knows the `filePath`.
 *
 * @param filePath - The `filePath` of the icon in the network or wallet metadata of `@web3icons/common`, such as
 * `'network:ethereum'`.
 * @returns The same promise for every call with the same icon; it resolves to the component, or `null` when
 * `web3IconImports` has no such icon or it fails to load.
 * @internal
 */
export function loadWeb3Icon(filePath: string): Promise<Web3IconComponent | null> {
  const key = getWeb3IconKey(filePath);
  let icon = iconCache.get(key);
  if (!icon) {
    const importIcon = web3IconImports[key];
    icon = importIcon
      ? importIcon()
          .then((module) => module.default as Web3IconComponent)
          .catch(() => null)
      : Promise.resolve(null);
    iconCache.set(key, icon);
  }
  return icon;
}
