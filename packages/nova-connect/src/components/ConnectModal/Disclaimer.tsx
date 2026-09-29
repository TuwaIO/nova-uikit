/**
 * @file Disclaimer component with comprehensive customization options.
 */

import { cn, standardButtonClasses } from '@tuwaio/nova-core';
import React, { ComponentType, forwardRef, useCallback, useEffect, useEffectEvent, useId } from 'react';

import { useNovaConnectLabels } from '../../hooks/useNovaConnectLabels';
import { formatLabel } from '../../i18n/formatLabel';

// --- Types ---
/**
 * Action of a {@link Disclaimer} button: a URL opens in a new tab (rendered as a link), a function runs on click
 * (rendered as a button).
 */
export type DisclaimerButtonAction = string | (() => void);

// --- Component Props Types ---
/**
 * Props for a custom container.
 */
export type DisclaimerContainerProps = {
  /** Classes from `classNames.container` or the defaults, with the `className` prop */
  className?: string;
  /** The content section, the actions and a screen reader summary */
  children: React.ReactNode;
  /** `complementary` */
  role?: string;
  /** `config.ariaLabels.container`, the `aria-label` prop, or the `disclaimerLabel` label with the title */
  'aria-label'?: string;
  /** ID of the description */
  'aria-describedby'?: string;
  /** The `data-testid` prop */
  'data-testid'?: string;
  /** `polite` with `announceToScreenReader` */
  'aria-live'?: 'polite' | 'assertive' | 'off';
} & React.RefAttributes<HTMLDivElement>;

/**
 * Props for a custom content section (title, description and additional content).
 */
export type DisclaimerContentSectionProps = {
  /** Classes from `classNames.contentSection` or the defaults */
  className?: string;
  /** The title, the description and the additional content */
  children: React.ReactNode;
  /** `group` */
  role?: string;
  /** ID of the title */
  'aria-labelledby'?: string;
};

/**
 * Props for a custom title.
 */
export type DisclaimerTitleProps = {
  /** Unique ID of the title */
  id: string;
  /** Classes from `classNames.title` or the defaults */
  className?: string;
  /** The `title` prop */
  children: React.ReactNode;
  /** `heading` */
  role?: string;
  /** `3` */
  'aria-level'?: number;
};

/**
 * Props for a custom description.
 */
export type DisclaimerDescriptionProps = {
  /** Unique ID of the description */
  id: string;
  /** Classes from `classNames.description` or the defaults */
  className?: string;
  /** The `description` prop */
  children: React.ReactNode;
  /** `text` */
  role?: string;
};

/**
 * Props for a custom wrapper of the additional content (rendered when `children` is set).
 */
export type DisclaimerAdditionalContentProps = {
  /** Classes from `classNames.additionalContent` or the defaults */
  className?: string;
  /** The `children` prop */
  children: React.ReactNode;
  /** `group` */
  role?: string;
  /** `config.ariaLabels.additionalContent` or the `disclaimerAdditionalInformation` label */
  'aria-label'?: string;
};

/**
 * Props for a custom actions section.
 */
export type DisclaimerActionsProps = {
  /** Classes from `classNames.actions` or the defaults */
  className?: string;
  /** The "Learn more" button and the optional list button */
  children: React.ReactNode;
  /** `group` */
  role?: string;
  /** `config.ariaLabels.actions` or the `disclaimerActions` label */
  'aria-label'?: string;
};

/**
 * Props for a custom link button (URL actions) or action button (function actions).
 */
export type DisclaimerButtonProps = {
  /** The action */
  action: DisclaimerButtonAction;
  /** The button text */
  children: React.ReactNode;
  /** The `actionAbout` label with the title (the "Learn more" button) or the `viewAction` label (the list button) */
  'aria-label'?: string;
  /** Classes from `classNames.button` or `standardButtonClasses` of `@tuwaio/nova-core` */
  className?: string;
  /** `<data-testid>-learn-more` or `<data-testid>-list-action` */
  'data-testid'?: string;
};

/**
 * Props for a custom screen reader summary (visually hidden by default).
 */
export type DisclaimerStatusProps = {
  /** Classes from `classNames.status` or `novacon:sr-only` */
  className?: string;
  /** An English summary of the disclaimer (empty in the live region) */
  children?: React.ReactNode;
  /** `polite` in the live region rendered with `announceToScreenReader` */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** `true` in the live region */
  'aria-atomic'?: boolean;
  /** `status` in the live region */
  role?: string;
};

/**
 * Customization options of {@link Disclaimer}.
 */
export type DisclaimerCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<DisclaimerContainerProps>;
    /** Custom content section */
    ContentSection?: ComponentType<DisclaimerContentSectionProps>;
    /** Custom title component */
    Title?: ComponentType<DisclaimerTitleProps>;
    /** Custom description component */
    Description?: ComponentType<DisclaimerDescriptionProps>;
    /** Custom additional content wrapper */
    AdditionalContent?: ComponentType<DisclaimerAdditionalContentProps>;
    /** Custom actions section */
    Actions?: ComponentType<DisclaimerActionsProps>;
    /** Custom link button */
    LinkButton?: ComponentType<DisclaimerButtonProps>;
    /** Custom action button */
    ActionButton?: ComponentType<DisclaimerButtonProps>;
    /** Custom status component */
    Status?: ComponentType<DisclaimerStatusProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones (the `className` prop is still added).
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    container?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the content section, instead of the default ones.
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    contentSection?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the title, instead of the default ones.
     *
     * @param params - The layout.
     * @param params.compact - The `compact` prop.
     * @returns The classes.
     */
    title?: (params: { compact: boolean }) => string;
    /**
     * Returns the classes of the description, instead of the default ones.
     *
     * @returns The classes.
     */
    description?: () => string;
    /**
     * Returns the classes of the additional content wrapper, instead of the default ones.
     *
     * @returns The classes.
     */
    additionalContent?: () => string;
    /**
     * Returns the classes of the actions section, instead of the default ones.
     *
     * @returns The classes.
     */
    actions?: () => string;
    /**
     * Returns the classes of a button, instead of `standardButtonClasses` of `@tuwaio/nova-core`.
     *
     * @param params - The button.
     * @param params.isLink - Whether the action is a URL.
     * @param params.isPrimary - Whether this is the "Learn more" button.
     * @returns The classes.
     */
    button?: (params: { isLink: boolean; isPrimary: boolean }) => string;
    /**
     * Returns the classes of the screen reader summary, instead of the default ones.
     *
     * @returns The classes.
     */
    status?: () => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Called after mount */
    onMount?: () => void;
    /** Called on unmount */
    onUnmount?: () => void;
  };
  /** Configuration options */
  config?: {
    /** Custom button labels */
    buttonLabels?: {
      /** Text of the primary button (default: the `learnMore` label) */
      learnMore?: string;
      /** Text of the list button (default: the `listOfNetworks` label) */
      listAction?: string;
    };
    /** Custom ARIA labels */
    ariaLabels?: {
      /** ARIA label of the container (before the `aria-label` prop) */
      container?: string;
      /** ARIA label of the actions section (default: the `disclaimerActions` label) */
      actions?: string;
      /** ARIA label of the additional content (default: the `disclaimerAdditionalInformation` label) */
      additionalContent?: string;
    };
  };
};

/**
 * Props for the {@link Disclaimer} component.
 */
export interface DisclaimerProps {
  /** Main title text for the disclaimer */
  title: string;
  /** Descriptive text explaining the disclaimer content */
  description: string;
  /** Action for the primary "Learn More" button - can be URL or callback */
  learnMoreAction: DisclaimerButtonAction;
  /** Optional action for the secondary "List of Networks" button */
  listAction?: DisclaimerButtonAction;
  /** Classes added to the container classes */
  className?: string;
  /** ARIA label of the container (default: the title followed by `disclaimer`) */
  'aria-label'?: string;
  /** Uses smaller gaps, padding and title (default: `false`) */
  compact?: boolean;
  /** Additional content to display below the description */
  children?: React.ReactNode;
  /** Custom test ID for testing purposes */
  'data-testid'?: string;
  /** Makes the container a polite live region and adds an empty status region (default: `false`) */
  announceToScreenReader?: boolean;
  /** Customization options */
  customization?: DisclaimerCustomization;
}

/**
 * Type guard to determine if action is a URL string
 * @param action - The action to check
 * @returns True if action is a string (URL), false if it's a function
 */
const isLink = (action: DisclaimerButtonAction): action is string => typeof action === 'string';

// --- Default Sub-Components ---
const DefaultContainer = forwardRef<HTMLDivElement, DisclaimerContainerProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ),
);
DefaultContainer.displayName = 'DefaultContainer';

const DefaultContentSection: React.FC<DisclaimerContentSectionProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const DefaultTitle: React.FC<DisclaimerTitleProps> = ({ children, className, ...props }) => (
  <h3 className={className} {...props}>
    {children}
  </h3>
);

const DefaultDescription: React.FC<DisclaimerDescriptionProps> = ({ children, className, ...props }) => (
  <p className={className} {...props}>
    {children}
  </p>
);

const DefaultAdditionalContent: React.FC<DisclaimerAdditionalContentProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const DefaultActions: React.FC<DisclaimerActionsProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const DefaultLinkButton: React.FC<DisclaimerButtonProps> = ({
  action,
  children,
  'aria-label': ariaLabel,
  className,
  'data-testid': testId,
}) => {
  const labels = useNovaConnectLabels();

  // Type guard to ensure action is string for href
  if (!isLink(action)) {
    console.error('LinkButton received non-string action:', action);
    return null;
  }

  return (
    <a
      href={action}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel || `${children} (${labels.learnMore})`}
      data-testid={testId}
      role="button"
    >
      {children}
      {/* Screen reader indication for external link */}
      <span className="novacon:sr-only"> {labels.opensInNewTab}</span>
    </a>
  );
};

const DefaultActionButton: React.FC<DisclaimerButtonProps> = ({
  action,
  children,
  'aria-label': ariaLabel,
  className,
  'data-testid': testId,
}) => {
  const handleClick = useCallback(() => {
    if (typeof action === 'function') {
      action();
    }
  }, [action]);

  return (
    <button type="button" onClick={handleClick} className={className} aria-label={ariaLabel} data-testid={testId}>
      {children}
    </button>
  );
};

const DefaultStatus: React.FC<DisclaimerStatusProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

/**
 * An explanation box of the connect modal ("What is a wallet?", "What is a network?"): a title, a description,
 * optional extra content, a "Learn more" button and an optional second button. A URL action opens in a new tab, a
 * function action runs on click.
 *
 * Props: {@link DisclaimerProps}; the ref is forwarded to the container.
 *
 * @example
 * ```tsx
 * import { Disclaimer } from '@tuwaio/nova-connect/components';
 *
 * export const WalletDisclaimer = (
 *   <Disclaimer
 *     title="What is a wallet?"
 *     description="Wallets let you send, receive and hold digital assets."
 *     learnMoreAction={() => console.log('show the about screen')}
 *     listAction="https://ethereum.org/wallets/find-wallet/"
 *     compact
 *     customization={{
 *       classNames: {
 *         container: ({ compact }) => (compact ? 'custom-compact' : 'custom-full'),
 *       },
 *     }}
 *   />
 * );
 * ```
 */
export const Disclaimer = forwardRef<HTMLDivElement, DisclaimerProps>(
  (
    {
      title,
      description,
      learnMoreAction,
      listAction,
      className,
      'aria-label': ariaLabel,
      compact = false,
      children,
      'data-testid': testId,
      announceToScreenReader = false,
      customization,
    },
    ref,
  ) => {
    // Get localized labels for UI text
    const labels = useNovaConnectLabels();

    // Generate unique ID using React's useId hook
    const uniqueId = useId();

    // Extract customization options
    const {
      Container: CustomContainer = DefaultContainer,
      ContentSection: CustomContentSection = DefaultContentSection,
      Title: CustomTitle = DefaultTitle,
      Description: CustomDescription = DefaultDescription,
      AdditionalContent: CustomAdditionalContent = DefaultAdditionalContent,
      Actions: CustomActions = DefaultActions,
      LinkButton: CustomLinkButton = DefaultLinkButton,
      ActionButton: CustomActionButton = DefaultActionButton,
      Status: CustomStatus = DefaultStatus,
    } = customization?.components ?? {};

    const customHandlers = customization?.handlers;
    const customConfig = customization?.config;

    /**
     * Memoized container classes based on compact mode
     */
    /**
     * Container classes based on compact mode
     */
    const containerClasses = cn(
      customization?.classNames?.container?.({ compact }) ??
        cn(
          'novacon:p-2 novacon:rounded-[var(--tuwa-rounded-corners)] novacon:border novacon:border-[var(--tuwa-border-primary)] novacon:flex novacon:flex-col',
          compact ? 'novacon:gap-2 novacon:sm:p-3 novacon:sm:gap-3' : 'novacon:gap-2 novacon:sm:p-4 novacon:sm:gap-4',
        ),
      className,
    );

    /**
     * Memoized content classes based on compact mode
     */
    /**
     * Content classes based on compact mode
     */
    const contentClasses =
      customization?.classNames?.contentSection?.({ compact }) ??
      cn('novacon:flex novacon:flex-col', compact ? 'novacon:gap-1' : 'novacon:gap-2');

    /**
     * Memoized title classes based on compact mode
     */
    /**
     * Title classes based on compact mode
     */
    const titleClasses =
      customization?.classNames?.title?.({ compact }) ??
      cn(
        'novacon:font-bold novacon:font-mono novacon:text-[var(--tuwa-text-primary)]',
        compact ? 'novacon:text-base' : 'novacon:text-lg',
      );

    /**
     * Generate unique ID for the disclaimer content using React's useId
     */
    /**
     * Generate unique ID for the disclaimer content using React's useId
     */
    const disclaimerId = (() => {
      const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-');
      return `disclaimer-${sanitizedTitle}-${uniqueId}`;
    })();

    /**
     * Generate button test IDs based on main test ID
     */
    /**
     * Generate button test IDs based on main test ID
     */
    const buttonTestIds = {
      learnMore: testId ? `${testId}-learn-more` : undefined,
      listAction: testId ? `${testId}-list-action` : undefined,
    };

    /**
     * Handle rendering of action buttons with proper type checking
     */
    const renderActionButton = useCallback(
      (action: DisclaimerButtonAction, buttonText: string, ariaLabel: string, testId?: string, isPrimary = false) => {
        const isLinkAction = isLink(action);
        const buttonClasses = cn(
          customization?.classNames?.button?.({ isLink: isLinkAction, isPrimary }) ?? standardButtonClasses,
        );

        if (isLinkAction) {
          return (
            <CustomLinkButton action={action} aria-label={ariaLabel} data-testid={testId} className={buttonClasses}>
              {buttonText}
            </CustomLinkButton>
          );
        } else {
          return (
            <CustomActionButton action={action} aria-label={ariaLabel} data-testid={testId} className={buttonClasses}>
              {buttonText}
            </CustomActionButton>
          );
        }
      },
      [customization, CustomLinkButton, CustomActionButton],
    );

    // The handlers are read through Effect Events, so a new `handlers` object on every render does not re-run the effect
    const onMount = useEffectEvent(() => customHandlers?.onMount?.());
    const onUnmount = useEffectEvent(() => customHandlers?.onUnmount?.());
    useEffect(() => {
      onMount();
      return () => onUnmount();
    }, []);

    return (
      <CustomContainer
        ref={ref}
        className={containerClasses}
        role="complementary"
        aria-label={customConfig?.ariaLabels?.container ?? ariaLabel ?? formatLabel(labels.disclaimerLabel, { title })}
        aria-describedby={`${disclaimerId}-description`}
        data-testid={testId}
        {...(announceToScreenReader && { 'aria-live': 'polite' as const })}
      >
        {/* Content Section */}
        <CustomContentSection className={contentClasses} role="group" aria-labelledby={`${disclaimerId}-title`}>
          {/* Title */}
          <CustomTitle id={`${disclaimerId}-title`} className={titleClasses} role="heading" aria-level={3}>
            {title}
          </CustomTitle>

          {/* Description */}
          <CustomDescription
            id={`${disclaimerId}-description`}
            className={
              customization?.classNames?.description?.() ?? 'novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]'
            }
            role="text"
          >
            {description}
          </CustomDescription>

          {/* Additional Content */}
          {children && (
            <CustomAdditionalContent
              className={customization?.classNames?.additionalContent?.() ?? 'novacon:mt-1'}
              role="group"
              aria-label={customConfig?.ariaLabels?.additionalContent ?? labels.disclaimerAdditionalInformation}
            >
              {children}
            </CustomAdditionalContent>
          )}
        </CustomContentSection>

        {/* Actions Section */}
        <CustomActions
          className={customization?.classNames?.actions?.() ?? 'novacon:flex novacon:gap-3 novacon:justify-end'}
          role="group"
          aria-label={customConfig?.ariaLabels?.actions ?? labels.disclaimerActions}
        >
          {/* Primary Learn More Button */}
          {renderActionButton(
            learnMoreAction,
            customConfig?.buttonLabels?.learnMore ?? labels.learnMore,
            formatLabel(labels.actionAbout, {
              action: customConfig?.buttonLabels?.learnMore ?? labels.learnMore,
              topic: title.toLowerCase(),
            }),
            buttonTestIds.learnMore,
            true,
          )}

          {/* Optional Secondary Action Button */}
          {listAction &&
            renderActionButton(
              listAction,
              customConfig?.buttonLabels?.listAction ?? labels.listOfNetworks,
              formatLabel(labels.viewAction, {
                action: (customConfig?.buttonLabels?.listAction ?? labels.listOfNetworks).toLowerCase(),
              }),
              buttonTestIds.listAction,
              false,
            )}
        </CustomActions>

        {/* Screen reader summary */}
        <CustomStatus className={customization?.classNames?.status?.() ?? 'novacon:sr-only'}>
          {formatLabel(labels.disclaimerSummary, { topic: title.toLowerCase() })} {description}
          {learnMoreAction &&
            ` ${formatLabel(labels.actionAvailable, { action: customConfig?.buttonLabels?.learnMore ?? labels.learnMore })}`}
          {listAction &&
            ` ${formatLabel(labels.actionAvailable, { action: customConfig?.buttonLabels?.listAction ?? labels.listOfNetworks })}`}
        </CustomStatus>

        {/* Hidden live region for dynamic content updates */}
        {announceToScreenReader && (
          <CustomStatus
            className={customization?.classNames?.status?.() ?? 'novacon:sr-only'}
            aria-live="polite"
            aria-atomic={true}
            role="status"
          >
            {/* This will announce content changes to screen readers */}
          </CustomStatus>
        )}
      </CustomContainer>
    );
  },
);

Disclaimer.displayName = 'Disclaimer';
