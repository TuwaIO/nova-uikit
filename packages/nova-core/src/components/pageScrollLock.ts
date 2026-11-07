/**
 * Stops the page from scrolling while a dialog is open, on `html` as well as on `body`: `overflow` on `body` reaches the
 * viewport only while `html` leaves its own `overflow` visible, so a page with `html { overflow-x: clip }` kept scrolling
 * behind the dialog. The count lives on the element, as a dialog can open over another and two copies of this package can
 * be on one page: closing the upper one must not release the page under the lower one.
 *
 * Side effects: sets the `NovaModalOpen` class on `html` and `body`, `data-nova-modals-open` on `html`, and `NovaModalGutter` on
 * `html` when the scrollbar takes room, until the returned function is called.
 *
 * @returns The function that releases this hold.
 * @internal
 */
export function lockPageScroll(): () => void {
  const { documentElement, body } = document;
  documentElement.dataset.novaModalsOpen = String(Number(documentElement.dataset.novaModalsOpen ?? 0) + 1);
  // Measured before it goes: a scrollbar that takes room leaves its width behind, and an overlay one, or none, has nothing to keep
  if (window.innerWidth > documentElement.clientWidth) documentElement.classList.add('NovaModalGutter');
  documentElement.classList.add('NovaModalOpen');
  body.classList.add('NovaModalOpen');

  return () => {
    const left = Number(documentElement.dataset.novaModalsOpen ?? 1) - 1;
    if (left > 0) {
      documentElement.dataset.novaModalsOpen = String(left);
      return;
    }
    delete documentElement.dataset.novaModalsOpen;
    documentElement.classList.remove('NovaModalOpen', 'NovaModalGutter');
    body.classList.remove('NovaModalOpen');
  };
}
