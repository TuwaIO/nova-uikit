/**
 * @file Internal React Context and hook for the pre-submission error toast system.
 *
 * ## Architecture
 *
 * `NovaTransactionsProvider` does **not** render `children` — it is a UI-only
 * element (toast containers + modals) placed alongside the application tree, not
 * wrapping it. This means React context cannot be used to pass a function from
 * the provider to sibling components like `TxActionButton`.
 *
 * The solution uses the fact that `toast()` from `react-toastify` is already a
 * **global function** — it communicates with any mounted `ToastContainer` via an
 * internal event bus, regardless of where in the tree the caller lives.
 *
 * - The **context** stores only the optional `customization` and the `enabled` flag.
 *   It is provided by `NovaTransactionsProvider` for components that happen to be
 *   inside its subtree (if the consumer wraps content).
 * - The **hook** builds and fires the toast directly using `toast()`, so it works
 *   from **anywhere in the app** as long as a `ToastContainer` with
 *   `VALIDATION_ERROR_CONTAINER_ID` is mounted.
 */

import { createContext, JSX, useCallback, useContext } from 'react';
import { toast, ToastContentProps } from 'react-toastify';

import { ToastValidationError, ToastValidationErrorCustomization } from '../components/ToastValidationError';

// =============================================================================
// Shared constant — used by both the context and the ToastContainer in the provider.
// =============================================================================

/**
 * The `containerId` used for the top-center pre-submission validation error toasts.
 *
 * Export this constant to allow consumers to render their own `ToastContainer`
 * with this ID if they need full layout control over the container placement.
 */
export const VALIDATION_ERROR_CONTAINER_ID = 'nova-validation-errors';

// =============================================================================
// Context — stores only the optional customization and feature flag.
// =============================================================================

/**
 * The shape of the value stored in `NovaTransactionsErrorContext`.
 * The context is intentionally minimal — the toast firing logic lives in the hook.
 */
export type NovaTransactionsErrorContextValue = {
  /**
   * Optional customization for the `ToastValidationError` component body.
   * Forwarded from `NovaTransactionsProvider`'s `customization.validationErrorToast` prop.
   */
  customization?: ToastValidationErrorCustomization;
  /**
   * Whether the validation error toast feature is enabled.
   * Mirrors `NovaTransactionsProvider`'s `features.validationErrorToast` prop.
   * @defaultValue `true`
   */
  enabled: boolean;
};

const defaultContextValue: NovaTransactionsErrorContextValue = { enabled: true };

/**
 * Internal context that forwards `customization` and the `enabled` flag from
 * `NovaTransactionsProvider` to any descendant component.
 *
 * The default value keeps `enabled: true` and uses no customization, so
 * components rendered **outside** a `NovaTransactionsProvider` receive a
 * fully-functional hook with default styling.
 */
export const NovaTransactionsErrorContext = createContext<NovaTransactionsErrorContextValue>(defaultContextValue);

// =============================================================================
// Hook — fires toast() directly (global), reads customization from context.
// =============================================================================

/**
 * Hook that returns `showPreSubmitErrorToast` — a function that fires the
 * top-center validation error toast.
 *
 * **Works from anywhere in the React tree**, not just inside
 * `NovaTransactionsProvider`. It calls `toast()` directly (react-toastify's
 * global API), so as long as a `ToastContainer` with
 * `VALIDATION_ERROR_CONTAINER_ID` is mounted, the toast will appear.
 *
 * When rendered inside a `NovaTransactionsProvider`, the hook additionally picks
 * up any `customization.validationErrorToast` settings via context.
 *
 * @returns `{ showPreSubmitErrorToast }` — call with any caught error value.
 *
 * @example
 * ```tsx
 * const { showPreSubmitErrorToast } = useNovaTransactionsError();
 *
 * const handleAction = async () => {
 *   try {
 *     await executeTxAction({ ... });
 *   } catch (e) {
 *     showPreSubmitErrorToast(e);
 *     throw e;
 *   }
 * };
 * ```
 */
export function useNovaTransactionsError(): {
  showPreSubmitErrorToast: (error: unknown) => void;
} {
  const { customization, enabled } = useContext(NovaTransactionsErrorContext);

  const showPreSubmitErrorToast = useCallback(
    (error: unknown) => {
      if (!enabled) return;

      const message = error instanceof Error ? error.message : String(error);
      const rawError =
        error instanceof Error ? JSON.stringify({ name: error.name, message: error.message }, null, 2) : message;
      const fieldName = (error as { field?: string }).field;

      toast(
        (props: ToastContentProps): JSX.Element => (
          <ToastValidationError
            {...props}
            message={message}
            rawError={rawError}
            fieldName={fieldName}
            customization={customization}
          />
        ),
        {
          toastId: `nova-pre-submit-${Date.now()}`,
          type: 'error',
          containerId: VALIDATION_ERROR_CONTAINER_ID,
          closeOnClick: false,
        },
      );
    },
    [enabled, customization],
  );

  return { showPreSubmitErrorToast };
}
