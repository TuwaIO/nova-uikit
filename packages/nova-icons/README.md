# Nova Icons

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-icons.svg)](https://www.npmjs.com/package/@tuwaio/nova-icons)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-icons.svg)](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)

The icons of Nova UI Kit in the TUWA retro pixel style: React components drawn on a 16 × 16 pixel grid with crisp edges and two-pixel lines, in the color of the text. They have the names, the import paths and the props of Heroicons (`@heroicons/react/24/outline` → `@tuwaio/nova-icons/24/outline`, `XMarkIcon`, `className`, `title`), so replacing the package name in the imports replaces the icons.

> **Alpha.** The set has the icons the TUWA apps use; more come with every release. Nova UI Kit itself still uses Heroicons.

## Installation

```bash
pnpm add @tuwaio/nova-icons
```

`react` 19.2.3 or newer is a peer dependency.

## Usage

```tsx
import { WalletIcon, XMarkIcon } from '@tuwaio/nova-icons/24/outline';
import { CheckCircleIcon } from '@tuwaio/nova-icons/24/solid';

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Close">
      <XMarkIcon className="h-4 w-4" />
    </button>
  );
}

export function Paid() {
  return <CheckCircleIcon title="Paid" titleId="invoice-paid" className="h-5 w-5 text-green-600" />;
}

export function WaitingForWallet() {
  return <WalletIcon motion="breathe" className="h-5 w-5" />;
}
```

The paths are those of Heroicons: `24/outline`, and `24/solid`, `20/solid` and `16/solid`, which lead to the same solid icons, drawn once for small sizes. `@tuwaio/nova-icons/tuwa` has icons of TUWA's own, which Heroicons does not have (`import { TransactionsIcon } from '@tuwaio/nova-icons/tuwa'`). The main entry `@tuwaio/nova-icons` has the outline icons and those of TUWA.

An icon is `1em` square unless its class sets a size, and hidden from screen readers unless it has a `title`. Its lit pixels (the clasp of the wallet, the keyhole of a lock) take the color of `--tuwa-icon-accent`, else of `--tuwa-text-accent`, the accent that the Nova and Quasar themes set for the light and the dark theme, else the TUWA blue mixed with the color of the text, which reads on a light and on a dark page. Set `--tuwa-icon-accent: currentColor` to draw an icon in one color.

## Motion

An icon can play one motion, once, when it appears: `motion="assemble"` (the pixels gather, for an empty state or a large icon) or `motion="breathe"` (the lit pixels dim and come back, next to something that waits). The motions are plain CSS: import the stylesheet once.

```css
@import '@tuwaio/nova-icons/motion.css';
```

Without the stylesheet, and for a reader who asks for less motion (`prefers-reduced-motion`), the icons stay still.

Each icon is a module of its own and the package has no side effects but its stylesheet, so a bundler keeps only the icons an app imports.

## 🗄️ Browser Storage

None.

## 🌐 External Services

None.

## License

[Apache-2.0](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)
