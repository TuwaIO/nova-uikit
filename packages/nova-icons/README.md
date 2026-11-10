# Nova Icons

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-icons.svg)](https://www.npmjs.com/package/@tuwaio/nova-icons)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-icons.svg)](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)

The icons of Nova UI Kit in the TUWA retro pixel style: React components drawn on a 16 × 16 pixel grid with crisp edges, in the color of the text. They have the names and props of Heroicons (`XMarkIcon`, `className`, `title`), so an icon of one replaces the other.

> **Alpha.** The set is being drawn: a few icons for now, more with every release. Nova UI Kit itself still uses Heroicons.

## Installation

```bash
pnpm add @tuwaio/nova-icons
```

`react` 19.2.3 or newer is a peer dependency.

## Usage

```tsx
import { WalletIcon, XMarkIcon } from '@tuwaio/nova-icons';

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Close">
      <XMarkIcon className="h-4 w-4" />
    </button>
  );
}

export function Balance() {
  return <WalletIcon title="Wallet" titleId="balance-wallet" className="h-5 w-5" />;
}
```

An icon is `1em` square unless its class sets a size, and hidden from screen readers unless it has a `title`. Its lit pixels take the color of `--tuwa-icon-accent`, and the color of the text when the theme sets none.

Each icon is a module of its own and the package has no side effects, so a bundler keeps only the icons an app imports.

## 🗄️ Browser Storage

None.

## 🌐 External Services

None.

## License

[Apache-2.0](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)
