import { cn } from '../utils';

/**
 * Props for the FallbackIcon component.
 */
export interface FallbackIconProps {
  /**
   * Whether to show a pulse animation to indicate a loading state.
   * @default false
   */
  animate?: boolean;
  /**
   * Text content to display inside the fallback circle (e.g., "?", "!", or empty).
   * @default ''
   */
  content?: string;
  /**
   * Additional CSS class names to apply to the container.
   */
  className?: string;
}

/**
 * Shared base styling for the fallback/loading container.
 * Defines shape, background color, and layout.
 */
const FALLBACK_CLASS =
  'novacore:flex novacore:items-center novacore:justify-center novacore:w-full novacore:h-full novacore:rounded-full novacore:text-[var(--tuwa-text-secondary)] novacore:bg-[var(--tuwa-bg-muted)]';

/**
 * A reusable placeholder component used for Suspense fallbacks (loading)
 * or Error fallbacks (when an icon is missing or fails to load).
 *
 * @param props - {@link FallbackIconProps}
 * @returns The rendered fallback element.
 */
export const FallbackIcon = ({ animate = false, content = '', className }: FallbackIconProps) => (
  <div
    className={cn(FALLBACK_CLASS, 'Nova_Web3_Icon', className, {
      'novacore:animate-pulse': animate,
    })}
  >
    {content}
  </div>
);
