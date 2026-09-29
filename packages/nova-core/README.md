# @tuwaio/nova-core

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://www.npmjs.com/package/@tuwaio/nova-core)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-core.svg)](https://github.com/TuwaIO/nova-uikit/blob/main/packages/nova-core/LICENSE)

`@tuwaio/nova-core` is the core Layer 6 (L6) package of **Nova UI Kit**, the user interface project of TUWA Stage 4 ("User Interface"). It holds what the L7 packages [`@tuwaio/nova-connect`](https://stories.tuwa.io/?path=/docs/packages-nova-connect-overview--docs) and [`@tuwaio/nova-transactions`](https://stories.tuwa.io/?path=/docs/packages-nova-transactions-overview--docs) share: the `--tuwa-*` CSS variables of the theme, a dialog built on Radix UI, network and wallet icons, and small React hooks and helpers. It has no Web3 logic and no wallet or transaction state.

---

## 🏛️ Core Capabilities

- **Theme variables:** `dist/index.css` defines the `--tuwa-*` CSS variables (colors, borders, rounded corners, status colors) for the light theme on `:root` and for the dark theme on `.dark`, the Geist Mono font (embedded, no font request), the Tailwind CSS v4 utilities of the package, prefixed with `novacore:`, and a few global rules: `scrollbar-gutter: stable` on `html`, no page scrolling while a Nova dialog is open, and no padding and background on `react-toastify` toasts (`.Toastify__toast`), which the Nova toasts draw themselves. Every Nova component reads these variables, so overriding them restyles the whole kit.
- **Dialog:** `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose` are the Radix UI primitives; `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle` and `DialogDescription` add the Nova styles and `framer-motion` animations. The connect and transaction modals of the L7 packages use them.
- **Icons:** `NetworkIcon` and `WalletIcon` render icons from `@web3icons/react` (loaded on demand), fetch missing ones from the web3icons repository on GitHub (`GithubFallbackIcon`) and show `FallbackIcon` otherwise; `NetworkIcon` recolors the icons of testnets and of the Solana devnet and testnet with `--tuwa-testnet-icons`. `SvgToImg` and `SvgImg` render an SVG as an `<img>`, so identical icons on one page do not share SVG `id`s. `CloseIcon`, `ChevronArrowWithAnim`, `ToastCloseButton` and `StarsBackground` are small shared parts.
- **Hooks and helpers:** `useCopyToClipboard` and `useMediaQuery`; `cn` (`clsx` + `tailwind-merge`), `deepMerge`, `getChainName`, `isSolanaDev`, `isTouchDevice`, `textCenterEllipsis`, the SVG helpers used by the icons and `standardButtonClasses`.

---

## 💾 Installation

```bash
pnpm add @tuwaio/nova-core react @radix-ui/react-dialog @web3icons/react @web3icons/common framer-motion clsx tailwind-merge
```

Peer dependencies: `react` (>=19.2.3), `@radix-ui/react-dialog` (1.x), `@web3icons/react` (>=4), `@web3icons/common` (>=0.11), `framer-motion`, `clsx` (2.x) and `tailwind-merge` (3.x).

Import the stylesheet once, before the stylesheets of the other Nova packages:

```css
@import '@tuwaio/nova-core/dist/index.css';
```

---

## 🚀 Usage

Most apps use `@tuwaio/nova-core` through Nova Connect and Nova Transactions and only override its CSS variables:

```css
:root {
  --tuwa-rounded-corners: 8px;
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

## 🌐 External Services

| Helper                                                     | Host                                                            | Purpose                                                                                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GithubFallbackIcon` (used by `NetworkIcon`, `WalletIcon`) | `raw.githubusercontent.com` (the `0xa3k5/web3icons` repository) | SVG of a network or wallet that the installed `@web3icons/common` does not list. The SVGs are cached in memory until the page reloads. |

The other icons come from the installed `@web3icons/react`, and the font is embedded in the stylesheet. The package does not use `localStorage`.

---

## 📚 API Reference

Every export, with signatures and types generated from the source, is documented at **[stories.tuwa.io → Packages → nova-core](https://stories.tuwa.io/?path=/docs/packages-nova-core-overview--docs)**.

## 📄 License

Licensed under the **Apache-2.0 License**. See the [LICENSE](https://github.com/TuwaIO/nova-uikit/blob/main/packages/nova-core/LICENSE) file for details.
