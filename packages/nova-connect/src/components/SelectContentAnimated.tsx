/**
 * @file Animated select content component with comprehensive customization capabilities.
 */

import * as Select from '@radix-ui/react-select';
import { cn } from '@tuwaio/nova-core';
import { AnimatePresence, type Easing, motion } from 'framer-motion';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { useNovaConnectLabels } from '../hooks/useNovaConnectLabels';
import { ToBottomButton, ToBottomButtonCustomization } from './ToBottomButton';
import { ToTopButton, ToTopButtonCustomization } from './ToTopButton';

/**
 * Props for the {@link SelectContentAnimated} component: the props of `Select.Content` of `@radix-ui/react-select`
 * (`position` defaults to `popper`; `style` overrides the `maxHeight` style) and these options.
 */
export interface SelectContentAnimatedProps extends ComponentPropsWithoutRef<typeof Select.Content> {
  /** Classes added to the default classes of `Select.Content` */
  className?: string;
  /** Classes added to the default classes of the animated panel around the items */
  contentClassName?: string;
  /** Classes of `Select.Viewport` */
  viewportClassName?: string;
  /** ARIA label of the list (default: the `chainListContainer` label) */
  'aria-label'?: string;
  /** Uses a plain fade instead of the scale and slide animation (default: `false`) */
  reduceMotion?: boolean;
  /** Maximum height in pixels (default: `300`) */
  maxHeight?: number;
  /** Duration of the open and close animation in seconds (default: `0.2`) */
  animationDuration?: number;
  /** Whether to render the scroll buttons of Radix Select (default: `true`) */
  showScrollButtons?: boolean;
  /** Custom props for the ToTopButton */
  topButtonProps?: Omit<ComponentPropsWithoutRef<typeof ToTopButton>, 'ref'>;
  /** Custom props for the ToBottomButton */
  bottomButtonProps?: Omit<ComponentPropsWithoutRef<typeof ToBottomButton>, 'ref'>;
  /** Customization options for ToTopButton */
  topButtonCustomization?: ToTopButtonCustomization;
  /** Customization options for ToBottomButton */
  bottomButtonCustomization?: ToBottomButtonCustomization;
}

/**
 * The dropdown of a Radix Select (`@radix-ui/react-select`) with a Framer Motion open and close animation, a maximum
 * height and the Nova scroll buttons. It renders `Select.Portal` and `Select.Content`, so use it inside
 * `Select.Root`. `ChainSelector` uses it for the desktop chain list.
 *
 * Props: {@link SelectContentAnimatedProps}; the ref is forwarded to `Select.Content`.
 *
 * @example
 * ```tsx
 * import * as Select from '@radix-ui/react-select';
 * import { SelectContentAnimated } from '@tuwaio/nova-connect/components';
 *
 * export const OptionSelect = (
 *   <Select.Root>
 *     <Select.Trigger>Select an option</Select.Trigger>
 *     <SelectContentAnimated maxHeight={400} animationDuration={0.3} contentClassName="novacon:p-2">
 *       <Select.Item value="option1">Option 1</Select.Item>
 *       <Select.Item value="option2">Option 2</Select.Item>
 *     </SelectContentAnimated>
 *   </Select.Root>
 * );
 * ```
 */
export const SelectContentAnimated = forwardRef<
  Omit<ElementRef<typeof Select.Content>, 'style'>,
  SelectContentAnimatedProps
>(
  (
    {
      className,
      contentClassName,
      viewportClassName,
      children,
      position = 'popper',
      'aria-label': ariaLabel,
      reduceMotion = false,
      maxHeight = 300,
      animationDuration = 0.2,
      showScrollButtons = true,
      topButtonProps,
      bottomButtonProps,
      topButtonCustomization,
      bottomButtonCustomization,
      ...props
    },
    forwardedRef,
  ) => {
    const labels = useNovaConnectLabels();

    // Memoize animation configuration based on reduce motion preference
    // Animation configuration based on reduce motion preference
    const animationConfig = (() => {
      if (reduceMotion) {
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.15, layout: { duration: 0 } },
        };
      }

      return {
        initial: { opacity: 0, scaleY: 0.8, y: -5 },
        animate: { opacity: 1, scaleY: 1, y: 0 },
        exit: { opacity: 0, scaleY: 0.8, y: -5 },
        transition: {
          duration: animationDuration,
          ease: 'easeOut' as Easing,
          layout: {
            duration: 0.15,
            ease: 'easeOut' as Easing,
          },
        },
      };
    })();

    // Memoize content container classes (additive approach)
    const contentClasses = cn(
      // Default styles always applied
      'novacon:p-1 novacon:bg-[var(--tuwa-bg-secondary)] novacon:rounded-[var(--tuwa-rounded-corners)] novacon:shadow-xl',
      'novacon:ring-1 novacon:ring-[var(--tuwa-border-primary)] novacon:overflow-hidden',
      // Custom classes added to defaults
      contentClassName,
    );

    // Select content classes (additive approach)
    const selectContentClasses = cn(
      // Default styles always applied
      'novacon:overflow-hidden',
      'novacon:w-[--radix-select-trigger-width]',
      'novacon:data-[state=open]:animate-in novacon:data-[state=closed]:animate-out',
      'novacon:data-[state=closed]:fade-out-0 novacon:data-[state=open]:fade-in-0',
      'novacon:data-[state=closed]:zoom-out-95 novacon:data-[state=open]:zoom-in-95',
      'novacon:data-[side=bottom]:slide-in-from-top-2 novacon:data-[side=left]:slide-in-from-right-2',
      'novacon:data-[side=right]:slide-in-from-left-2 novacon:data-[side=top]:slide-in-from-bottom-2',
      // Custom classes added to defaults
      className,
    );

    // Viewport classes (additive approach)
    const viewportClasses = cn(
      // Default viewport styles (minimal by default)
      '',
      // Custom classes added
      viewportClassName,
    );

    // Inline styles for containers
    const selectContentStyles = {
      // Apply maxHeight as inline style (can be overridden by style prop)
      maxHeight: `${maxHeight}px`,
    };

    // Generate ARIA label
    const finalAriaLabel = ariaLabel || labels.chainListContainer;

    return (
      <Select.Portal>
        <Select.Content
          className={selectContentClasses}
          style={selectContentStyles}
          // @ts-expect-error - type changed for better using
          ref={forwardedRef}
          position={position}
          role="listbox"
          aria-label={finalAriaLabel}
          {...props}
        >
          {/* Scroll to top button - only render if showScrollButtons is true */}
          {showScrollButtons && (
            <Select.ScrollUpButton asChild>
              <ToTopButton customization={topButtonCustomization} {...topButtonProps} />
            </Select.ScrollUpButton>
          )}

          {/* Main content viewport */}
          <Select.Viewport role="presentation" className={viewportClasses}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                initial={animationConfig.initial}
                animate={animationConfig.animate}
                exit={animationConfig.exit}
                transition={animationConfig.transition}
                className={contentClasses}
                layout={!reduceMotion}
                role="group"
                aria-live="polite"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Select.Viewport>

          {/* Scroll to bottom button - only render if showScrollButtons is true */}
          {showScrollButtons && (
            <Select.ScrollDownButton asChild>
              <ToBottomButton customization={bottomButtonCustomization} {...bottomButtonProps} />
            </Select.ScrollDownButton>
          )}
        </Select.Content>
      </Select.Portal>
    );
  },
);

SelectContentAnimated.displayName = 'SelectContentAnimated';
