/** Where the toasts a person closed are kept in `localStorage`. */
const STORAGE_KEY = 'nova-transactions:closedToasts';
/** How many are kept: nothing else ever clears them. */
const MOST_KEPT = 50;

/**
 * The transactions whose toast a person closed while they were pending.
 *
 * @returns Their keys. Empty when the storage is closed or holds something else: a toast coming back is the worst of it.
 */
export function closedToasts(): ReadonlySet<string> {
  try {
    const kept: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(kept) ? kept.filter((key): key is string => typeof key === 'string') : []);
  } catch {
    return new Set();
  }
}

/**
 * Remembers that a person closed the toast of a pending transaction, so that a page load does not open it again. A change of
 * its state still does.
 *
 * @param txKey - The key of the transaction. Side effect: written to `localStorage`, under `nova-transactions:closedToasts`.
 */
export function rememberClosedToast(txKey: string): void {
  try {
    const keys = [...closedToasts()].filter((key) => key !== txKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys, txKey].slice(-MOST_KEPT)));
  } catch {
    // The storage is closed: the toast only comes back at the next page load
  }
}
