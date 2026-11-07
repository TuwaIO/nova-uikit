/**
 * Stops the page from scrolling while a dialog is open, on `html` as well as on `body`: `overflow` on `body` reaches the
 * viewport only while `html` leaves its own `overflow` visible, so a page with `html { overflow-x: clip }` kept scrolling
 * behind the dialog. The count lives on the element, as a dialog can open over another and two copies of this package can
 * be on one page: closing the upper one must not release the page under the lower one.
 *
 * Side effects: sets the `NovaModalOpen` class on `html` and `body`, and `data-nova-modals-open` on `html`, until the
 * returned function is called.
 *
 * @returns The function that releases this hold.
 * @internal
 */
export function lockPageScroll(): () => void {
  const { documentElement, body } = document;
  documentElement.dataset.novaModalsOpen = String(Number(documentElement.dataset.novaModalsOpen ?? 0) + 1);
  documentElement.classList.add('NovaModalOpen');
  body.classList.add('NovaModalOpen');

  return () => {
    const left = Number(documentElement.dataset.novaModalsOpen ?? 1) - 1;
    if (left > 0) {
      documentElement.dataset.novaModalsOpen = String(left);
      return;
    }
    delete documentElement.dataset.novaModalsOpen;
    documentElement.classList.remove('NovaModalOpen');
    body.classList.remove('NovaModalOpen');
  };
}
