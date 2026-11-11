# @tuwaio/nova-core

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](https://github.com/TuwaIO/nova-uikit/blob/main/packages/nova-core/LICENSE)

`@tuwaio/nova-core` is the core Layer 6 (L6) package of **Nova UI Kit**, the user interface project of TUWA Stage 4 ("User Interface"). It holds what the L7 packages [`@tuwaio/nova-connect`](https://stories.tuwa.io/?path=/docs/packages-nova-connect-overview--docs) and [`@tuwaio/nova-transactions`](https://stories.tuwa.io/?path=/docs/packages-nova-transactions-overview--docs) share: the `--tuwa-*` CSS variables of the theme, a dialog built on Radix UI, network and wallet icons, and small React hooks and helpers. It has no Web3 logic and no wallet or transaction state; Solana cluster names come from `@tuwaio/orbit-core`, which has no dependencies of its own.

---

## 🏛️ Core Capabilities

- **Theme variables:** `dist/index.css` defines the `--tuwa-*` CSS variables (colors, lines, corners, status colors, the scanlines) for the light theme on `:root` and for the dark theme on `.dark`, the Geist Mono font (files next to the stylesheet, no font request to another host), the Tailwind CSS v4 utilities of the package, prefixed with `novacore:`, and rules for its own parts only: no page scrolling while a Nova dialog is open (the width of the scrollbar is kept only then), the toasts of Nova clickable above a dialog, and the `tuwa-scanlines` class. The page of the host, its fonts and its own toasts are left alone. Every Nova component reads these variables, so overriding them restyles the whole kit.
- **Dialog:** `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose` are the Radix UI primitives; `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle` and `DialogDescription` add the Nova styles and `framer-motion` animations. The connect and transaction modals of the L7 packages use them.
- **Icons:** `NetworkIcon` and `WalletIcon` render icons from `@web3icons/react`, loaded on demand one icon at a time (only the network and wallet metadata of `@web3icons/common` is bundled, not the token list, and only the about 300 icons that networks and wallets use can be loaded, so the bundler of your app does not build a chunk for each of the 2,000 token icons), fetch missing ones from the web3icons repository on GitHub (`GithubFallbackIcon`) and show `FallbackIcon` otherwise; `NetworkIcon` draws testnets and the Solana devnet and testnet on a `--tuwa-testnet-icons` background, their white mark in the color of the mainnet background. The icon loader is a separate client module (`'use client'`), so server code (React Server Components, route handlers) that imports `cn`, `getChainName` or other helpers does not compile the icons. `SvgToImg` and `SvgImg` render an SVG as an `<img>`, so identical icons on one page do not share SVG `id`s. `CloseIcon`, `ChevronArrowWithAnim`, `ToastCloseButton` and `StarsBackground` are small shared parts.
- **Motion of states:** `QuasarLoader` is the loader of the TUWA ecosystem, the Quasar mark in a whole and a compact form; `MorphText` and `MorphIcon` change a text or an icon in place, with the letters both versions share gliding to their new places; `StatusEdge` is the strip of a status color along the top of a card. `DrawnCheck` and `DrawnCross` are the marks of a result, which draw themselves; `CopyIcon` folds into a check mark once a text is copied; the arrow of `ExternalLinkIcon` moves out when its link is hovered; `AnimatedHeight` lets a box glide to the height of its content, and `anchorTop` of `DialogContent` keeps the top edge of a dialog where it opened, so that a change of height moves nothing but the bottom. All of them hold still with `prefers-reduced-motion`.
- **Hooks and helpers:** `useCopyToClipboard` and `useMediaQuery`; `cn` (`clsx` + `tailwind-merge`), `deepMerge`, `getChainName`, `isSolanaDev`, `isTouchDevice`, `textCenterEllipsis`, the SVG helpers used by the icons, and the classes of the shared parts of the look: `standardButtonClasses` (a secondary button), `primaryButtonClasses` (the main button), `sectionLabelClasses` (the label of a section) and `chipClasses` (a status chip). The helpers are also exported by `@tuwaio/nova-core/utils`, which imports no React, no component and no icon: use it in code that needs only the helpers (server code, libraries such as a site layout), so its bundler compiles none of the icons.

---

## 💾 Installation

```bash
pnpm add @tuwaio/nova-core @tuwaio/orbit-core react @radix-ui/react-dialog @web3icons/react @web3icons/common framer-motion clsx tailwind-merge
```

Peer dependencies: `@tuwaio/orbit-core` (>=0.4), `react` (>=19.2.3), `@radix-ui/react-dialog` (1.x), `@web3icons/react` (>=4.1.24), `@web3icons/common` (>=0.11), `framer-motion`, `clsx` (2.x) and `tailwind-merge` (3.x); `@heroicons/react` (2.x) is optional, for the Heroicons set (see Icons below).

Import the stylesheet once, before the stylesheets of the other Nova packages:

```css
@import '@tuwaio/nova-core/dist/index.css';
```

---

## 🖋️ The Look: Paper and Ink

The default theme is flat and square, in the manner of printed paper:

- **Colors:** warm paper and ink. In the light theme the dialogs are raised paper (`--tuwa-bg-primary`, `#faf9f7`) on paper (`--tuwa-bg-secondary`, `#f2f1ee`) with a sunken layer (`--tuwa-bg-muted`, `#e9e8e4`), the text is ink (`#101014`), and the accent is the TUWA blue (`#0052ff`). The dark theme turns the same scale over. Primary, secondary and accent text hold WCAG 2.2 AA (4.5:1) on all three surfaces in both themes, and `nova-core` tests each of these pairs; `--tuwa-text-tertiary` is for hints and decorations, below 4.5:1.
- **Corners:** `--tuwa-rounded-corners` is `0px`, and `--tuwa-rounded-full`, the radius of the parts that are round in most kits (avatars, the icons of wallets, tokens and networks, dots), is `0px` as well.
- **Lines instead of shadows:** parts are drawn with lines of 1 px (`--tuwa-border-primary`, `--tuwa-border-strong` for the frame of a secondary button), lists are cells on shared lines, and nothing has a soft shadow or a gradient of color: a light that runs along a frame (a wait, Connect another wallet) is one solid segment.
- **Type:** the labels of buttons, chips and sections are monospace capitals with spacing (`primaryButtonClasses`, `standardButtonClasses`, `chipClasses`, `sectionLabelClasses`). Names and addresses keep their case.
- **Scanlines:** dialogs and toasts carry faint lines across them, a retro screen (`tuwa-scanlines`, colored by `--tuwa-scanline`).
- **Icons of actions:** under the pointer the icon of a link to another site takes the accent, and the icons of an exit and a bin turn red; on a filled button (`tuwa-solid`, part of `primaryButtonClasses`) an icon keeps the color of the label. Give `tuwa-solid` to a filled button of your own.

Every rule is a variable: the Theming page lists them all with their values.

## 🚀 Usage

Most apps use `@tuwaio/nova-core` through Nova Connect and Nova Transactions and only override its CSS variables:

```css
:root {
  /* Round corners and round avatars and icons again */
  --tuwa-rounded-corners: 8px;
  --tuwa-rounded-full: 9999px;
  /* No scanlines */
  --tuwa-scanline: transparent;
}

.dark {
  --tuwa-bg-primary: #050505;
}
```

The variables and a full theme example are on the **[Theming](https://stories.tuwa.io/?path=/docs/theming--docs)** page. The components and helpers can also be used directly:

```tsx
import { cn, NetworkIcon, textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';

export function AddressChip({ address, chainId }: { address: string; chainId: number }) {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(address)}
      className={cn('flex items-center gap-2', isCopied && 'opacity-70')}
    >
      <span className="h-4 w-4">
        <NetworkIcon chainId={chainId} />
      </span>
      {isCopied ? 'Copied' : textCenterEllipsis(address, 6, 4)}
    </button>
  );
}
```

---

## 🎨 Icons

The Nova components draw their icons from an icon set: by default the pixel icons of [`@tuwaio/nova-icons`](https://stories.tuwa.io/?path=/docs/packages-nova-icons-overview--docs), a dependency of this package. `heroicons` of `@tuwaio/nova-core/heroicons` is the set of Heroicons that Nova drew before; it needs `@heroicons/react` (2.x), an optional peer dependency, and only an app that imports it loads Heroicons. Give a set to `NovaIconsProvider`, or to the `icons` prop of `NovaConnectProvider` and `NovaTransactionsProvider`:

```tsx
import { NovaIconsProvider } from '@tuwaio/nova-core';
import { heroicons } from '@tuwaio/nova-core/heroicons';
import type { ReactNode } from 'react';

export function ClassicNova({ children }: { children: ReactNode }) {
  return <NovaIconsProvider icons={heroicons}>{children}</NovaIconsProvider>;
}
```

`useNovaIcons` returns the set of the closest provider, and `NovaSetIcon` draws one of its icons by name (`<NovaSetIcon solid="ArrowPathIcon" />`). What Nova draws itself follows the `look` of the set, `pixel` or `classic`, or a `look` prop of its own: `QuasarLoader`, `StarsBackground` (pixel stars, or round and four-pointed ones), `DrawnCheck` and `DrawnCross`, `CopyIcon`, `ExternalLinkIcon`, `ExitIcon`, `TrashIcon`, `CloseIcon`, `ChevronArrowWithAnim` and `ToastCloseButton`. The pixel ones are drawn on a grid with crisp edges and move in CSS.

---

## 🔊 Sounds

`playNovaSound` of `@tuwaio/nova-core/utils` plays short tones synthesized with the Web Audio API, with no files and no requests. Nothing plays unless it is asked for: `NovaSoundsProvider` (which the `sounds` prop of the Nova Connect and Nova Transactions providers renders) sets them for the components under it, and `useNovaSounds` plays them from a component of yours.

## 🌐 External Services

| Helper                                                                  | Host                                                            | Purpose                                                                                                                                |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GithubFallbackIcon` (used by `NetworkIcon`, `WalletIcon`, `TokenIcon`) | `raw.githubusercontent.com` (the `0xa3k5/web3icons` repository) | SVG of a network or wallet that the installed `@web3icons/common` does not list. The SVGs are cached in memory until the page reloads. |

The other icons come from the installed `@web3icons/react`, and the fonts are files next to the stylesheet (`dist/fonts`), served from your own origin by your bundler: a face is fetched only when the page uses it, and cached once. The package does not use `localStorage`.

---

## 📚 API Reference

Every export, with signatures and types generated from the source, is documented at **[stories.tuwa.io → Packages → nova-core](https://stories.tuwa.io/?path=/docs/packages-nova-core-overview--docs)**.

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](https://github.com/TuwaIO/nova-uikit/blob/main/packages/nova-core/LICENSE) file for details.
