/**
 * @file Holds the top edge of a centered dialog in place while its content changes height. Kept apart from `Modal.tsx` so
 * that it can be tested without a DOM.
 */

/**
 * Where the top edge of a dialog goes.
 *
 * @internal
 * @param anchor - Where it was when the dialog opened, centered on the screen.
 * @param height - The height of the dialog now.
 * @param viewport - The height of the screen.
 * @param margin - The room to keep under the dialog.
 * @returns The top edge, in pixels: where it was, unless the dialog would run past the bottom of the screen, and then only as
 * far up as it takes.
 */
export function dialogTop(anchor: number, height: number, viewport: number, margin: number): number {
  return Math.max(0, Math.min(anchor, viewport - height - margin));
}

/**
 * Parameters of {@link watchDialogAnchor}.
 *
 * @internal
 */
export type WatchDialogAnchorParams = {
  /** The dialog, centered by its classes on a wide screen. */
  dialog: HTMLElement;
  /** Its content, whose height is observed. */
  content: HTMLElement;
  /** The room to keep under the dialog, in pixels (default: `16`). */
  margin?: number;
};

/**
 * Keeps the top edge of a dialog where it opened. A dialog centered on the screen moves up and down by half of any change of
 * its height, and takes along everything in it, such as tabs a person is pressing. On a narrow screen the dialog is a sheet at
 * the bottom, and stays one.
 *
 * Side effects: while active, sets `top` and `translate` on the dialog, observes the content with a `ResizeObserver` and
 * listens to `resize` of the window. Does nothing without `ResizeObserver` or `matchMedia`.
 *
 * @internal
 * @param params - The dialog and its content.
 * @param params.dialog - The dialog.
 * @param params.content - Its content.
 * @param params.margin - The room to keep under the dialog, in pixels.
 * @returns A function that stops and gives the position back to the classes.
 */
export function watchDialogAnchor({ dialog, content, margin = 16 }: WatchDialogAnchorParams): () => void {
  if (typeof ResizeObserver === 'undefined' || typeof window === 'undefined' || !window.matchMedia)
    return () => undefined;

  const wide = window.matchMedia('(min-width: 640px)');
  let anchor: number | undefined;

  const release = () => {
    dialog.style.removeProperty('top');
    dialog.style.removeProperty('translate');
    anchor = undefined;
  };

  const place = () => {
    if (!wide.matches) return release();
    // Before anything is set the classes center it, so this is the place it opened at
    anchor ??= dialog.getBoundingClientRect().top;
    dialog.style.translate = '-50% 0';
    dialog.style.top = `${dialogTop(anchor, dialog.offsetHeight, window.innerHeight, margin)}px`;
  };

  // A new size of the screen: centered again, from the height it has now
  const reposition = () => {
    release();
    place();
  };

  const observer = new ResizeObserver(place);
  observer.observe(content);
  window.addEventListener('resize', reposition);
  place();

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', reposition);
    release();
  };
}
