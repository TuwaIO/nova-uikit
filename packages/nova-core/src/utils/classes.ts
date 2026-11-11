/**
 * Classes of the standard secondary button of Nova (Tailwind utilities with the `novacore:` prefix, styled with the
 * `--tuwa-standart-button-*` variables): paper and ink, no fill, a frame of `--tuwa-border-strong`, a monospace label in
 * capitals with spacing. The connect modal uses them for its buttons.
 */
export const standardButtonClasses =
  'novacore:cursor-pointer novacore:rounded-[var(--tuwa-rounded-corners)] novacore:border novacore:border-[var(--tuwa-border-strong)] novacore:bg-[var(--tuwa-standart-button-bg)] novacore:px-3 novacore:py-2 novacore:flex novacore:items-center novacore:justify-center novacore:gap-1.5 novacore:text-xs novacore:font-mono novacore:font-bold novacore:uppercase novacore:tracking-[0.12em] novacore:text-[var(--tuwa-text-primary)] novacore:transition-colors novacore:hover:bg-[var(--tuwa-standart-button-hover)] novacore:disabled:cursor-not-allowed novacore:disabled:opacity-50 novacore:min-h-[36px]';

/**
 * Classes of the main button of Nova: one solid color (`--tuwa-button-primary-bg`, `--tuwa-text-on-accent`), square, a
 * monospace label in capitals with spacing, the same size as {@link standardButtonClasses}. `tuwa-solid` marks it as filled:
 * the icons of an action in it (a link to another site, an exit, a bin) keep the color of its label under the pointer.
 * Give `tuwa-solid` to a filled button of your own for the same.
 */
export const primaryButtonClasses =
  'tuwa-solid novacore:cursor-pointer novacore:rounded-[var(--tuwa-rounded-corners)] novacore:border novacore:border-[var(--tuwa-button-primary-bg)] novacore:bg-[var(--tuwa-button-primary-bg)] novacore:px-3 novacore:py-2 novacore:flex novacore:items-center novacore:justify-center novacore:gap-1.5 novacore:text-xs novacore:font-mono novacore:font-bold novacore:uppercase novacore:tracking-[0.12em] novacore:text-[var(--tuwa-text-on-accent)] novacore:transition-colors novacore:hover:border-[var(--tuwa-button-primary-bg-hover)] novacore:hover:bg-[var(--tuwa-button-primary-bg-hover)] novacore:disabled:cursor-not-allowed novacore:disabled:opacity-50 novacore:min-h-[36px]';

/**
 * Classes of the label of a section in a Nova dialog: small monospace capitals with spacing, in the secondary ink.
 */
export const sectionLabelClasses =
  'novacore:m-0 novacore:font-mono novacore:text-[11px] novacore:font-bold novacore:uppercase novacore:tracking-[0.12em] novacore:leading-4 novacore:text-[var(--tuwa-text-secondary)]';

/**
 * Classes of a status chip of Nova (Pending, Success, Recent, Active…): square, a frame of 1 px, small monospace capitals
 * with spacing. The colors (text, tint and frame) are the caller's.
 */
export const chipClasses =
  'novacore:inline-flex novacore:items-center novacore:gap-1 novacore:rounded-[var(--tuwa-rounded-corners)] novacore:border novacore:px-1.5 novacore:py-0.5 novacore:font-mono novacore:text-[10px] novacore:font-bold novacore:uppercase novacore:tracking-[0.12em] novacore:leading-3';
