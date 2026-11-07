/**
 * @file The client entry of the `@web3icons/react` icons (`dist/web3-icons.*`). Its build starts with 'use client'
 * (tsup.config.ts), and the main entry imports the built file instead of bundling it: a server that imports `cn` or
 * `getChainName` stops at this client boundary instead of compiling the 2,222 icons of `dynamicIconImports`.
 * @internal
 */
export { TokenIconLazy } from './components/TokenIconLazy';
export { Web3IconLazy } from './components/Web3IconLazy';
