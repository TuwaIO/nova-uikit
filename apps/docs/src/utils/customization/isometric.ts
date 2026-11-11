// Isometric: class names for every part of Nova UI Kit (the `customization` props). A line drawing: boxes and buttons
// get an extruded left and bottom face, and a button presses in, half way under the pointer and all the way while held.
// Lines take `--tuwa-border-primary`, the fill of header bars and buttons `--tuwa-button-gradient-from`, and every color
// comes from the `--tuwa-*` variables; it is drawn for the theme of isometric.css. It is the kit of the playground of the docs hub.
// The faces are layered box-shadows: ink layers draw the silhouette, layers in the surface color one pixel smaller
// hollow it out. A scroll area clips them, so boxes in lists keep room for their faces (`faceRoom`), and modals stay flat.
// Some Nova parts add these classes to their own defaults instead of replacing them, so colors are marked important (`!`).
// Tailwind CSS generates these classes from this file: keep each class a complete string literal.
import type { NovaConnectProviderCustomization } from '@tuwaio/nova-connect';
import type {
  ChainListRendererCustomization,
  ConnectButtonCustomization,
  ConnectCardCustomization,
  ConnectedModalCustomization,
  IconButtonCustomization,
  StatusIconCustomization,
} from '@tuwaio/nova-connect/components';
import { cn } from '@tuwaio/nova-core/utils';
import type { TransactionsHistoryCustomization } from '@tuwaio/nova-transactions';
import type { NovaTransactionsProviderProps } from '@tuwaio/nova-transactions/providers';
import type { Transaction } from '@tuwaio/pulsar-core';

/** The `customization` prop of `NovaTransactionsProvider`. */
export type NovaTransactionsCustomization = NonNullable<NovaTransactionsProviderProps<Transaction>['customization']>;

// Set on every container: square corners and the sans type for all its parts, over Nova's round avatars and dots and
// its monospace labels
const drawing = '**:rounded-none! **:font-sans!';
const focus =
  'focus:outline-none focus-visible:ring-[length:var(--tuwa-ring-width)]! focus-visible:ring-offset-2 focus-visible:ring-[var(--tuwa-text-accent)]!';

// Outlined faces, 4px deep
const faces =
  'shadow-[-1px_1px_0_-1px_var(--tuwa-bg-secondary),-2px_2px_0_-1px_var(--tuwa-bg-secondary),-3px_3px_0_-1px_var(--tuwa-bg-secondary),-4px_4px_0_-1px_var(--tuwa-bg-secondary),-1px_1px_0_0_var(--tuwa-border-primary),-2px_2px_0_0_var(--tuwa-border-primary),-3px_3px_0_0_var(--tuwa-border-primary),-4px_4px_0_0_var(--tuwa-border-primary)]!';
// Outlined faces, 8px deep, for toasts
const deepFaces =
  'shadow-[-1px_1px_0_-1px_var(--tuwa-bg-secondary),-2px_2px_0_-1px_var(--tuwa-bg-secondary),-3px_3px_0_-1px_var(--tuwa-bg-secondary),-4px_4px_0_-1px_var(--tuwa-bg-secondary),-5px_5px_0_-1px_var(--tuwa-bg-secondary),-6px_6px_0_-1px_var(--tuwa-bg-secondary),-7px_7px_0_-1px_var(--tuwa-bg-secondary),-8px_8px_0_-1px_var(--tuwa-bg-secondary),-1px_1px_0_0_var(--tuwa-border-primary),-2px_2px_0_0_var(--tuwa-border-primary),-3px_3px_0_0_var(--tuwa-border-primary),-4px_4px_0_0_var(--tuwa-border-primary),-5px_5px_0_0_var(--tuwa-border-primary),-6px_6px_0_0_var(--tuwa-border-primary),-7px_7px_0_0_var(--tuwa-border-primary),-8px_8px_0_0_var(--tuwa-border-primary)]!';
// A key: it sinks to 2px faces under the pointer and to none while held; a disabled one stays flat. Nova's own scaling
// is switched off
const press = cn(
  faces,
  'scale-100! transition-[translate,box-shadow,background-color,color,opacity] duration-200 ease-out not-disabled:active:duration-75',
  'not-disabled:hover:-translate-x-[2px] not-disabled:hover:translate-y-[2px] not-disabled:hover:shadow-[-1px_1px_0_-1px_var(--tuwa-bg-secondary),-2px_2px_0_-1px_var(--tuwa-bg-secondary),-1px_1px_0_0_var(--tuwa-border-primary),-2px_2px_0_0_var(--tuwa-border-primary)]!',
  'not-disabled:active:-translate-x-[4px] not-disabled:active:translate-y-[4px] not-disabled:active:shadow-none!',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none!',
);
// A key that stays down: a selected tab, an open selector
const pressed = 'scale-100! -translate-x-[4px] translate-y-[4px] shadow-none!';
// Room for the faces of a box in a scroll area or a list
const faceRoom = 'ml-[4px] mb-[4px] w-[calc(100%-4px)]';

// Its own type: some Nova parts add these classes to their defaults, which set monospace capitals with spacing (the look of
// paper and ink); the line drawing keeps plain words
const plain = 'normal-case! tracking-normal!';

const text = {
  normal: 'font-normal',
  strong: 'font-semibold',
  primary: 'text-[var(--tuwa-text-primary)]!',
  secondary: 'text-[var(--tuwa-text-secondary)]!',
  onInk: 'text-[var(--tuwa-text-on-accent)]!',
  error: 'text-[var(--tuwa-error-icon)]!',
};

const surface = {
  base: 'bg-[var(--tuwa-bg-secondary)]!',
  ink: 'bg-[var(--tuwa-button-gradient-from)]!',
  border: 'border! border-[var(--tuwa-border-primary)]!',
};

// A frame with faces, for a part of its own size
const framed = cn(surface.base, surface.border, faces);
// A box with faces that fills the width of its list or section
const box = cn(faceRoom, framed);
const sectionTitle = cn(text.strong, text.secondary, 'text-xs uppercase tracking-wider');

const buttonBase = cn(
  'cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm',
  plain,
  surface.border,
  focus,
);
const button = {
  // Filled: the icons in it keep their color under the pointer
  primary: cn('tuwa-solid', buttonBase, text.strong, surface.ink, text.onInk, press),
  outline: cn(buttonBase, text.normal, surface.base, text.primary, press),
  danger: cn(buttonBase, text.normal, surface.base, text.primary, 'hover:text-[var(--tuwa-error-icon)]!', press),
  link: cn(
    'cursor-pointer text-sm underline underline-offset-2 transition-opacity hover:opacity-70',
    plain,
    text.primary,
  ),
  quiet: cn('cursor-pointer text-sm transition-opacity hover:opacity-70', plain, text.secondary),
  // A square icon button: copy, close, remove
  icon: cn(
    'cursor-pointer p-1 transition-colors scale-100! [&_svg]:text-current bg-transparent! hover:bg-[var(--tuwa-bg-muted)]!',
    plain,
    text.secondary,
    'hover:text-[var(--tuwa-text-primary)]!',
    focus,
  ),
  // An icon button on an ink bar: a surface square under the pointer, a ring in its own color on focus
  iconOnInk: cn(
    'cursor-pointer p-1 transition-colors scale-100! [&_svg]:text-current bg-transparent! hover:bg-[var(--tuwa-bg-secondary)]!',
    text.onInk,
    'hover:text-[var(--tuwa-text-primary)]!',
    'focus:outline-none focus:ring-0! focus-visible:ring-[length:var(--tuwa-ring-width)]! focus-visible:ring-[var(--tuwa-text-on-accent)]!',
  ),
  copy: cn('cursor-pointer transition-colors', plain, text.secondary, 'hover:text-[var(--tuwa-text-primary)]!'),
};

// Nova's dialog panel draws the frame of every modal; the header is an ink bar, like the head of a table
const modal = {
  container: cn(drawing, surface.base),
  header: cn(surface.ink, text.onInk, 'border-b! border-[var(--tuwa-border-primary)]!'),
  title: cn(text.strong, text.onInk, 'text-base'),
  footer: cn(surface.base, 'border-t! border-[var(--tuwa-border-primary)]!'),
};

// The chain list of the selector and of the connected modal: an ink bar marks the current chain
const chainList: ChainListRendererCustomization = {
  classNames: {
    item: ({ isActive, isMobile }) =>
      cn(
        'flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm outline-none ring-0! ring-offset-0!',
        isMobile && 'justify-between',
        isActive
          ? cn(
              surface.ink,
              text.onInk,
              'hover:bg-[var(--tuwa-button-gradient-from)]! focus:bg-[var(--tuwa-button-gradient-from)]!',
            )
          : cn('bg-transparent! hover:bg-[var(--tuwa-bg-muted)]! focus:bg-[var(--tuwa-bg-muted)]!', text.primary),
      ),
    chainName: () => cn(text.normal, 'text-current!'),
    activeIndicatorWrapper: () => 'text-current! opacity-80',
    activeIndicator: () => 'h-2 w-2 bg-[var(--tuwa-success-icon)]!',
  },
};

const connectCard: ConnectCardCustomization = {
  classNames: {
    container: ({ cardData }) =>
      cn(
        'group relative flex cursor-pointer items-center justify-between p-3',
        cardData.isTouch ? 'h-[120px] w-[120px] flex-col justify-center p-2 text-center' : faceRoom,
        surface.base,
        surface.border,
        press,
        focus,
      ),
    title: () => cn(text.normal, text.primary),
    subtitle: () => cn(text.normal, text.secondary, 'text-xs'),
    // The badge gives way to the chevron under the pointer
    recentBadgeWrapper: () => 'absolute top-1 right-1 transition-opacity group-hover:opacity-0',
    chevron: () =>
      cn(
        'h-5 w-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100',
        text.primary,
      ),
  },
  // The badge's frame is a light line that an ink stroke runs along, as if the line were being drawn
  recentBadge: {
    classNames: { container: () => cn('relative overflow-hidden px-2 py-0.5 text-xs', text.secondary) },
    config: {
      animated: true,
      gradient: {
        stops: [
          { position: 0, color: 'var(--tuwa-border-secondary)' },
          { position: 20, color: 'var(--tuwa-border-primary)' },
          { position: 40, color: 'var(--tuwa-border-secondary)' },
        ],
      },
    },
  },
  // The badges of a wallet's networks on its icon
  networkIcons: {
    classNames: {
      networkIcon: ({ networkData }) =>
        cn('flex h-4 w-4 items-center justify-center', surface.base, surface.border, networkData.index > 0 && '-ml-1'),
      overflowIndicator: () =>
        cn('-ml-1 flex h-4 w-4 items-center justify-center text-[8px]', surface.base, surface.border),
    },
  },
};

// The switch keys on the avatar of the connected modal; the faces show the press, so Nova's scaling is off
const switchKey = cn(
  'absolute bottom-[-10px] z-[11] flex cursor-pointer items-center gap-1 p-1.5 leading-[0] [&_img]:h-6! [&_img]:w-6! [&_svg]:h-5! [&_svg]:w-5!',
  surface.base,
  surface.border,
  text.primary,
  press,
  focus,
);
const still: IconButtonCustomization['variants'] = {
  button: { idle: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 1 }, loading: { scale: 1 } },
};

const connectedModal: ConnectedModalCustomization = {
  classNames: {
    // The element around the dialog panel keeps a gap of its own, so it gets no surface
    dialogContent: () => cn('w-full sm:max-w-md', drawing),
    header: () => cn(modal.header, 'p-4'),
    // The back button sits in the title, on the ink bar: it turns into a surface square under the pointer, as the close
    // button does
    dialogTitle: () =>
      cn(
        modal.title,
        '[&_button]:cursor-pointer [&_button]:scale-100! [&_button]:bg-transparent! [&_button]:text-[var(--tuwa-text-on-accent)]! [&_button]:ring-0! [&_button]:outline-none',
        '[&_button:hover]:bg-[var(--tuwa-bg-secondary)]! [&_button:hover]:text-[var(--tuwa-text-primary)]!',
        '[&_button:focus-visible]:outline-1 [&_button:focus-visible]:outline-solid [&_button:focus-visible]:outline-[var(--tuwa-text-on-accent)]',
      ),
    closeButton: () => button.iconOnInk,
    mainContent: () => surface.base,
    footer: () => cn(modal.footer, 'p-4'),
  },
  childCustomizations: {
    mainContent: {
      classNames: {
        container: () => cn('flex flex-col items-center justify-center gap-3 p-4', surface.base),
        transactionsButton: () => cn(button.primary, 'min-h-10 px-6'),
      },
      childCustomizations: {
        walletAvatar: {
          classNames: { container: () => cn('relative h-32 w-32 shrink-0 overflow-hidden', surface.border) },
        },
        nameAndBalance: {
          classNames: {
            walletNameDisplay: () => cn(text.strong, text.primary, 'text-lg'),
            copyButton: () => button.icon,
          },
        },
        switchWalletButton: {
          customization: { classNames: { button: () => cn(switchKey, 'left-[-10px]') }, variants: still },
        },
        switchNetworkButton: {
          customization: { classNames: { button: () => cn(switchKey, 'right-[-10px]') }, variants: still },
        },
      },
    },
    chainList: { chainListRenderer: chainList },
    connections: {
      classNames: {
        container: () => cn('flex flex-col gap-6 p-4', surface.base),
        activeSectionTitle: () => cn(sectionTitle, text.primary, 'mb-2'),
        activeSectionWrapper: () => cn('overflow-hidden', box),
        recentSectionTitle: () => cn(sectionTitle, 'mb-2'),
        activeRowWalletName: () => cn(text.strong, text.primary),
        activeRowConnectorName: () => cn(text.normal, text.secondary, 'text-xs'),
        activeRowCopyButton: () => button.icon,
        activeRowExplorerButton: () => button.icon,
        activeRowDisconnectButton: () => cn(button.danger, 'mt-4 px-3 py-1.5 text-xs'),
        connectedRowDisconnectButton: () => button.icon,
        recentRowContainer: () => cn('flex items-center justify-between p-3', box),
        recentRowWalletName: () => cn(text.normal, text.primary, 'text-sm'),
        recentRowConnectButton: () => cn(button.outline, 'px-3 py-1.5 text-xs'),
        recentRowRemoveButton: () => button.icon,
        addWalletButton: () =>
          cn(
            'mt-2 w-full cursor-pointer border! border-dashed! border-[var(--tuwa-border-primary)]! p-3 text-sm transition-colors',
            'bg-transparent! hover:bg-[var(--tuwa-bg-muted)]! hover:text-[var(--tuwa-text-primary)]!',
            text.secondary,
          ),
      },
    },
    footer: {
      classNames: {
        container: () =>
          cn(
            'flex w-full flex-col-reverse flex-wrap items-center justify-between gap-4 p-4 sm:flex-row *:grow',
            modal.footer,
          ),
        disconnectButton: () => cn(button.danger, 'min-h-10'),
        explorerLink: () => cn(button.outline, 'min-h-10'),
      },
    },
  },
};

/** The `customization` prop of `NovaConnectProvider`: the connect and connected modals and the error toasts. */
export const isoConnect: NovaConnectProviderCustomization = {
  modals: {
    connectModal: {
      classNames: {
        modalContainer: () => modal.container,
        header: () => modal.header,
        title: () => modal.title,
        infoButton: () => cn(button.iconOnInk, 'mr-1'),
        closeButton: () => button.iconOnInk,
        mainContent: () => surface.base,
        footer: () => modal.footer,
        backButton: () => cn(button.outline, 'min-h-10'),
        actionButton: () => cn(button.primary, 'min-h-10'),
      },
      childComponents: {
        // The network tabs are keys: the selected one stays down, in ink
        networkTabs: {
          classNames: {
            tabList: () =>
              'mb-2 flex gap-3 overflow-x-auto border-b border-[var(--tuwa-border-primary)] pt-1 pr-1 pb-[9px] pl-[5px]',
            tabButton: ({ isSelected }) =>
              cn(
                'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm',
                surface.border,
                focus,
                isSelected ? cn(surface.ink, text.onInk, pressed) : cn(surface.base, text.secondary, press),
              ),
            iconContainer: () =>
              'h-5 w-5 [&>div]:h-5! [&>div]:w-5! [&>div]:bg-transparent! [&_img]:h-5 [&_img]:w-5 [&_svg]:h-5 [&_svg]:w-5',
            indicator: () => 'hidden',
            tabText: () => 'block overflow-hidden whitespace-nowrap',
          },
        },
        connectorsSelections: {
          // The impersonated wallet is a key like the others
          impersonateCard: connectCard,
          disclaimer: {
            classNames: {
              button: ({ isPrimary }) => cn(isPrimary ? button.primary : button.outline, 'min-h-9 px-3 py-1.5'),
            },
          },
          // Keys with faces need room between them: Nova's cards share their lines of 1 px instead
          connectorsBlock: {
            installed: {
              classNames: { title: () => cn(sectionTitle, text.primary) },
              connectCard,
              config: { layout: { mouseGap: 'gap-2' } },
            },
            popular: {
              classNames: { title: () => sectionTitle },
              connectCard,
              config: { layout: { mouseGap: 'gap-2' } },
            },
          },
        },
        networkSelections: {
          classNames: { title: () => cn(text.normal, text.primary, 'mb-2') },
          connectCard,
          config: { scroll: { gap: { mouse: 'gap-2' } } },
        },
        // The wallet in a frame that pulses amber while it connects and turns green or red after; the message under it
        // says the rest, so Nova's round spinner and corner badges are left out
        connecting: {
          classNames: {
            statusContainer: ({ statusData }) =>
              cn(
                'relative flex min-h-[150px] min-w-[150px] items-center justify-center border-2 p-6 transition-colors duration-300',
                surface.base,
                statusData.state === 'error'
                  ? 'border-[var(--tuwa-error-icon)]'
                  : statusData.state === 'success'
                    ? 'border-[var(--tuwa-success-icon)]'
                    : 'border-[var(--tuwa-border-secondary)]',
              ),
            spinner: () => 'absolute -inset-[2px] animate-pulse border-2 border-[var(--tuwa-pending-icon)]',
            statusIcon: () => 'hidden',
            statusMessage: ({ statusData }) =>
              cn(text.strong, 'text-lg', statusData.state === 'error' ? text.error : text.primary),
            errorMessage: () => cn(text.normal, text.error, 'text-center text-sm leading-relaxed'),
          },
        },
        aboutWallets: {
          classNames: {
            title: () => cn(text.strong, text.primary, 'text-xl'),
            description: () => cn(text.normal, text.secondary, 'text-sm'),
            indicator: ({ isActive }) =>
              cn(
                'h-2 cursor-pointer transition-all duration-300',
                isActive
                  ? 'w-6 bg-[var(--tuwa-text-primary)]!'
                  : 'w-2 bg-[var(--tuwa-border-primary)]! hover:bg-[var(--tuwa-text-secondary)]!',
              ),
          },
        },
        getWallet: {
          classNames: {
            starsBackground: () => 'hidden',
            gradientOverlay: () => 'hidden',
            title: () => cn(text.strong, text.primary, 'mb-2 text-xl'),
            description: () => cn(text.normal, text.secondary, 'text-sm'),
          },
        },
        rememberWallet: {
          classNames: {
            text: () => cn(text.normal, text.primary, 'text-sm leading-tight'),
            box: ({ checked }) =>
              cn(
                'relative flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-colors',
                'peer-focus-visible:ring-[length:var(--tuwa-ring-width)] peer-focus-visible:ring-[var(--tuwa-text-accent)]',
                surface.border,
                checked ? cn(surface.ink, text.onInk) : 'bg-transparent! group-hover:bg-[var(--tuwa-bg-muted)]!',
              ),
            infoButton: () => cn(button.icon, 'flex h-5 w-5 items-center justify-center p-0'),
            // A box with faces, without the arrow of Nova's tooltip
            tooltip: () =>
              cn(
                'pointer-events-none absolute right-0 bottom-full z-20 mb-3 w-max max-w-[240px] px-3 py-2 text-left text-xs leading-snug [&>span]:hidden',
                surface.base,
                surface.border,
                text.primary,
                faces,
              ),
          },
        },
      },
    },
    connectedModal,
  },
  errors: {
    toastCloseButton: { className: button.icon },
    toastErrorCustomization: {
      classNames: {
        container: () => cn('w-full p-4', drawing, surface.base, 'border! border-[var(--tuwa-error-icon)]!', deepFaces),
        title: () => cn(text.strong, text.error, 'truncate text-sm'),
        description: () => cn(text.error, 'mt-1 break-words text-xs opacity-80'),
      },
    },
  },
};

// A transaction status on the connect button, in a square of its color
const statusIcon = (colors: string): StatusIconCustomization => ({
  classNames: { container: () => cn('flex h-6 w-6 items-center justify-center border', colors) },
});

/** The `customization` prop of `ConnectButton`, with its network selector and connected state. */
export const isoConnectButton: ConnectButtonCustomization = {
  classNames: {
    container: () => cn('flex items-center gap-3', drawing),
    button: ({ buttonData }) =>
      cn(
        buttonBase,
        'min-h-11',
        press,
        buttonData.isConnected ? cn(text.normal, surface.base, text.primary) : cn(text.strong, surface.ink, text.onInk),
      ),
  },
  childComponents: {
    connectedContent: {
      classNames: {
        balanceContainer: () => text.secondary,
        mainContent: () => '[&_span]:text-[var(--tuwa-text-primary)] [&_svg]:text-[var(--tuwa-text-primary)]',
        // While a transaction is pending, an amber frame pulses around the avatar in place of the spinning ring
        loadingAnimation: () =>
          'inset-[-4px]! animate-pulse border-2 border-[var(--tuwa-pending-icon)] before:hidden! after:hidden!',
      },
      childCustomizations: {
        walletAvatar: {
          classNames: { container: () => cn('relative z-2 h-6 w-6 shrink-0 overflow-hidden', surface.border) },
        },
        statusIcon: {
          succeed: statusIcon(
            'border-[var(--tuwa-success-icon)] bg-[var(--tuwa-success-bg)] text-[var(--tuwa-success-icon)]',
          ),
          failed: statusIcon('border-[var(--tuwa-error-icon)] bg-[var(--tuwa-error-bg)] text-[var(--tuwa-error-icon)]'),
          replaced: statusIcon(
            'border-[var(--tuwa-border-primary)] bg-[var(--tuwa-info-bg)] text-[var(--tuwa-info-icon)]',
          ),
        },
      },
    },
    chainSelector: {
      triggerButton: {
        classNames: {
          // An open selector stays down while its list is shown
          button: ({ isOpen }) =>
            cn(buttonBase, 'min-h-11', text.normal, surface.base, text.primary, isOpen ? pressed : press),
          arrowWrapper: () => '[&_svg]:text-[var(--tuwa-text-primary)]',
        },
      },
      // On the frame of Nova's list: the scroll buttons are inside it
      selectContent: { className: cn('w-[210px] ring-0!', drawing, surface.base, surface.border, faces) },
      chainListRenderer: chainList,
    },
  },
};

const detailsSection = cn(
  box,
  '[&_dl>div]:border-[var(--tuwa-border-secondary)]! [&_dt]:normal-case! [&_dt]:tracking-normal! [&_dt]:font-normal!',
);

/** The `customization` prop of `TransactionsHistory`, also used by the history modal. */
export const isoHistory: TransactionsHistoryCustomization<Transaction> = {
  classNames: {
    container: cn('flex flex-col gap-y-3', drawing),
    titleText: cn(text.strong, text.primary),
    listWrapper: cn('max-h-[400px] overflow-y-auto', surface.base, surface.border),
    placeholderContainer: cn('p-8 text-center', box),
    placeholderTitle: cn(text.strong, text.primary),
    placeholderMessage: cn(text.normal, text.secondary, 'mt-1 text-sm'),
    itemContainer:
      'flex flex-col gap-2 border-b border-[var(--tuwa-border-primary)] p-3 transition-colors last:border-b-0 hover:bg-[var(--tuwa-bg-muted)]',
    itemIconWrapper: cn('flex h-10 w-10 shrink-0 items-center justify-center', surface.border),
    itemTitle: cn(text.strong, text.primary, 'text-sm'),
    itemTimestamp: cn(text.normal, text.secondary, 'mb-1 block text-xs'),
    itemDescription: cn(text.normal, text.secondary, 'mt-1 text-xs'),
    itemStatusBadge: cn(text.normal, plain, 'text-xs'),
    itemHashLabel: cn(text.strong, text.primary, 'pr-1 text-sm'),
    itemHashLink: cn(text.normal, text.primary, 'flex items-center gap-x-1 underline underline-offset-2'),
    itemHashCopyButton: button.copy,
  },
  // The transaction details: an ink bar over sections that are boxes alike, with light lines between their rows. The status
  // keeps the color of its state, and its row is no box: it has no padding of its own
  detailsCustomization: {
    classNames: {
      container: drawing,
      header: modal.header,
      backButton: button.iconOnInk,
      closeButton: button.iconOnInk,
      title: cn(text.strong, text.onInk),
      subtitle: cn(text.normal, text.onInk, 'opacity-70'),
      actionButton: button.outline,
      sectionHeader: cn(sectionTitle, text.primary),
      metadataSection: detailsSection,
      contextSection: detailsSection,
      executionSection: detailsSection,
      networkBadge: cn(text.normal, text.primary, surface.base, surface.border, 'px-2 py-0.5'),
      stopTrackingContainer: box,
      stopTrackingHint: cn(text.normal, text.secondary),
      stopTrackingButton: button.link,
    },
  },
};

/** The `customization` prop of `NovaTransactionsProvider`: toasts, the tracking modal and the history modal. */
export const isoTransactions: NovaTransactionsCustomization = {
  toastCloseButton: { className: button.icon },
  toast: {
    classNames: {
      container: cn(drawing, surface.base, surface.border, deepFaces),
      title: cn(text.strong, text.primary, 'text-sm'),
      description: cn(text.normal, text.secondary, 'mt-1 text-xs'),
      transactionKey: 'border-[var(--tuwa-border-primary)]!',
      hashLabel: cn(text.strong, text.primary, 'pr-1 text-sm'),
      hashLink: cn(text.normal, text.primary, 'underline underline-offset-2'),
      hashCopyButton: button.copy,
      statusBadge: cn(text.normal, plain, 'text-xs'),
      speedUpButton: button.link,
      cancelButton: button.quiet,
      txInfoButton: cn(button.primary, 'min-h-8 px-3 py-1'),
    },
  },
  transactionsInfoModal: {
    classNames: {
      contentWrapper: modal.container,
      header: cn(modal.header, 'p-4'),
      headerTitle: modal.title,
      closeButton: button.iconOnInk,
    },
    historyCustomization: isoHistory,
  },
  trackingTxModal: {
    classNames: {
      container: modal.container,
      header: modal.header,
      headerTitle: modal.title,
      closeButton: button.iconOnInk,
      main: surface.base,
      footer: cn(modal.footer, 'p-4'),
      speedUpButton: button.link,
      cancelButton: button.quiet,
      retryButton: button.primary,
      allTransactionsButton: button.outline,
      closeModalButton: button.outline,
    },
    // The status icon in a square of its color; the spinning one keeps its frame clear and fills the same box
    statusVisualCustomization: {
      iconClassNames: {
        icon: 'box-content h-10! w-10! border-2 p-3',
        statusOverrides: {
          succeed: 'border-[var(--tuwa-success-icon)] bg-[var(--tuwa-success-bg)]',
          failed: 'border-[var(--tuwa-error-icon)] bg-[var(--tuwa-error-bg)]',
          replaced: 'border-[var(--tuwa-info-icon)] bg-[var(--tuwa-info-bg)]',
          processing: 'h-16! w-16! border-transparent p-0',
          initializing: 'border-[var(--tuwa-pending-icon)] bg-[var(--tuwa-pending-bg)]',
        },
      },
    },
    infoBlockCustomization: {
      classNames: {
        container: cn(surface.base, surface.border),
        rowLabel: cn(text.normal, plain, text.secondary),
        rowValue: cn(text.strong, text.primary),
        separator: 'border-[var(--tuwa-border-primary)]!',
      },
    },
    errorBlockCustomization: {
      classNames: {
        container: cn(surface.base, 'border! border-[var(--tuwa-error-icon)]!'),
        title: cn(text.strong, text.error),
        icon: text.error,
        messageText: cn(text.normal, text.primary, 'text-xs'),
      },
    },
  },
};

/** The parts of the drawing, for the stories that draw a part of their own. */
export const iso = { box, button, drawing, faces, faceRoom, framed, modal, press, sectionTitle, surface, text };
