import type { ComponentType, Ref } from 'react';

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
 * @returns The key of the icon in `dynamicIconImports` of `@web3icons/react`.
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
 * Loads one icon component of `@web3icons/react` through its `dynamicIconImports` map, so only that icon (and the
 * map) are downloaded. Unlike the `@web3icons/react/dynamic` components, it does not load the metadata of every
 * network, wallet, exchange and token: the caller already knows the `filePath`.
 *
 * @param filePath - The `filePath` of the icon in the `@web3icons/common` metadata, such as `'network:ethereum'`.
 * @returns The same promise for every call with the same icon; it resolves to the component, or `null` when the icon
 * does not exist or fails to load.
 * @internal
 */
export function loadWeb3Icon(filePath: string): Promise<Web3IconComponent | null> {
  const key = getWeb3IconKey(filePath);
  let icon = iconCache.get(key);
  if (!icon) {
    icon = import('@web3icons/react/dynamicIconImports')
      .then(async ({ default: imports }) => {
        const importIcon = imports[key];
        return importIcon ? ((await importIcon()).default as Web3IconComponent) : null;
      })
      .catch(() => null);
    iconCache.set(key, icon);
  }
  return icon;
}
