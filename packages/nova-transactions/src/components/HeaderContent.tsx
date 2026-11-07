/**
 * @file The content of the header row shared by `TransactionDetails` and `TransactionsInfoModal`: the back button,
 * the title with its subtitle and the close button.
 */

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@tuwaio/nova-core/utils';
import { ReactNode } from 'react';

/**
 * Props of {@link HeaderContent}.
 *
 * @internal
 */
export type HeaderContentProps = {
  /** The title element (an `h3`, or `DialogTitle` in a dialog). */
  title: ReactNode;
  /** Text under the title, shown from the `sm` breakpoint on. */
  subtitle?: string;
  /** Called by the back button; without it there is no back button. */
  onBack?: () => void;
  /** Accessible name of the back button. */
  backLabel: string;
  /** The close button, if any. */
  closeButton?: ReactNode;
  /** Classes of the parts. */
  classNames?: {
    /** The back button. */
    backButton?: string;
    /** The subtitle. */
    subtitle?: string;
  };
};

/** Classes of a header title: one line with an ellipsis. */
export const headerTitleClassName =
  'novatx:m-0 novatx:truncate novatx:font-mono novatx:text-lg novatx:font-bold novatx:leading-tight novatx:tracking-tight novatx:text-[var(--tuwa-text-primary)] novatx:sm:text-xl';

/** Classes of the borderless close button of a header. */
export const headerCloseButtonClassName =
  'novatx:flex novatx:h-9 novatx:w-9 novatx:shrink-0 novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:rounded-[var(--tuwa-rounded-corners)] novatx:text-[var(--tuwa-text-secondary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]';

/**
 * The back button, the title with its subtitle and the close button of a header row. The caller renders the row
 * itself (`DialogHeader` in a dialog), so the title can be a `DialogTitle`.
 *
 * @param props - See {@link HeaderContentProps}.
 * @returns The parts of the header row.
 * @internal
 */
export function HeaderContent({ title, subtitle, onBack, backLabel, closeButton, classNames }: HeaderContentProps) {
  return (
    <>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
          className={cn(
            'novatx:flex novatx:h-9 novatx:w-9 novatx:shrink-0 novatx:cursor-pointer novatx:items-center novatx:justify-center novatx:rounded-[var(--tuwa-rounded-corners)] novatx:border novatx:border-[var(--tuwa-border-primary)] novatx:bg-[var(--tuwa-bg-primary)] novatx:text-[var(--tuwa-text-secondary)] novatx:transition-colors novatx:hover:bg-[var(--tuwa-bg-muted)] novatx:hover:text-[var(--tuwa-text-primary)]',
            classNames?.backButton,
          )}
        >
          <ArrowLeftIcon className="novatx:h-4 novatx:w-4" aria-hidden="true" />
        </button>
      )}
      <div className="novatx:flex novatx:min-w-0 novatx:flex-1 novatx:flex-col novatx:gap-0.5">
        {title}
        {subtitle && (
          <p
            className={cn(
              'novatx:m-0 novatx:hidden novatx:truncate novatx:text-[13px] novatx:text-[var(--tuwa-text-secondary)] novatx:sm:block',
              classNames?.subtitle,
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {closeButton}
    </>
  );
}
