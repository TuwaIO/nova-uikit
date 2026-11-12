# Nova Icons

[![NPM Version](https://img.shields.io/npm/v/@tuwaio/nova-icons.svg)](https://www.npmjs.com/package/@tuwaio/nova-icons)
[![License](https://img.shields.io/npm/l/@tuwaio/nova-icons.svg)](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)

The icons of Nova UI Kit in the TUWA retro pixel style: React components drawn on a 16 × 16 pixel grid with crisp edges and two-pixel lines, in the color of the text. They have the names, the import paths and the props of Heroicons (`@heroicons/react/24/outline` → `@tuwaio/nova-icons/24/outline`, `XMarkIcon`, `className`, `title`), so replacing the package name in a named import replaces the icon. The default imports of single Heroicons (`@heroicons/react/24/outline/XMarkIcon`) have no counterpart: import the icon by name from its path.

The set has every icon the TUWA apps use, more with every release; see them all in the [gallery](https://stories.tuwa.io/?path=/story/nova-icons-gallery--gallery). The Nova components draw these icons by default (see `NovaIconsProvider` of [`@tuwaio/nova-core`](https://stories.tuwa.io/?path=/docs/packages-nova-core-overview--docs) for the Heroicons look).

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

The paths are those of Heroicons: `24/outline`, and `24/solid`, `20/solid` and `16/solid`, which lead to the same solid icons, drawn once for small sizes. `@tuwaio/nova-icons/tuwa` has icons of TUWA's own, which Heroicons does not have (`import { TransactionsIcon } from '@tuwaio/nova-icons/tuwa'`), and `@tuwaio/nova-icons/brands` the marks of the services TUWA links to, for links to them: `GitHubIcon`, `XIcon` (the mark of X, not a close mark, which is `XMarkIcon`), `TelegramIcon`, `DiscordIcon` and `NpmIcon`. The marks belong to their owners and are drawn in one color, the color of the text. The main entry `@tuwaio/nova-icons` has the outline icons, those of TUWA and the marks.

An icon is `1em` square unless its class sets a size, and hidden from screen readers unless it has a `title`. Its lit pixels (the clasp of the wallet, the keyhole of a lock) take the color of `--tuwa-icon-accent` (Nova sets it to the bright fill of the brand: the TUWA orange in the light theme, the cyan of the logo in the dark one), else of `--tuwa-text-accent`, the accent that the Nova and Quasar themes set for the light and the dark theme, else the TUWA orange mixed with the color of the text, which reads on a light and on a dark page. Set `--tuwa-icon-accent: currentColor` to draw an icon in one color.

## Motion

An icon can play one motion, once, when it appears: `motion="assemble"` (the icon assembles from its pixels: each one flies in to its place from a spot nearby, for an empty state or a large icon) or `motion="breathe"` (the lit pixels dim and come back, next to something that waits). The motions are plain CSS: import the stylesheet once.

```css
@import '@tuwaio/nova-icons/motion.css';
```

Without the stylesheet, and for a reader who asks for less motion (`prefers-reduced-motion`), the icons stay still.

A pixel drawing of your own can assemble in the same way: give each pixel `data-px` and the `style` of `pixelFlight(x, y)`, and its parent `data-motion="assemble"`. `--nova-px-start` on the parent holds the whole picture back.

```tsx
import { pixelFlight } from '@tuwaio/nova-icons';

const PIXELS = [
  [1, 1],
  [2, 1],
  [2, 2],
] as const;

export function Spark() {
  return (
    <svg viewBox="0 0 4 4" width={32} height={32} shapeRendering="crispEdges" data-motion="assemble" aria-hidden>
      {PIXELS.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill="currentColor"
          data-px=""
          style={pixelFlight(x, y)}
        />
      ))}
    </svg>
  );
}
```

Each icon is a module of its own and the package has no side effects but its stylesheet, so a bundler keeps only the icons an app imports.

## 🗄️ Browser Storage

None.

## 🌐 External Services

None.

## License

[Apache-2.0](https://github.com/TuwaIO/nova-uikit/blob/main/LICENSE)
