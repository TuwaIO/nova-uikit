/**
 * @file LegalDisclaimer component for displaying Terms and Privacy Policy links with comprehensive customization.
 */

import { cn } from '@tuwaio/nova-core';
import { ComponentType, ReactNode } from 'react';

import { useNovaConnect, useNovaConnectLabels } from '../../hooks';

// --- Types ---

/**
 * Legal disclaimer data for customization context
 */
export interface LegalDisclaimerData {
  /** Whether terms URL is available */
  hasTerms: boolean;
  /** Whether privacy URL is available */
  hasPrivacy: boolean;
  /** Whether both URLs are available */
  hasBoth: boolean;
  /** Terms URL */
  termsUrl?: string;
  /** Privacy URL */
  privacyUrl?: string;
}

/**
 * Props for custom container component
 */
type ContainerProps = {
  className?: string;
  children: ReactNode;
  disclaimerData: LegalDisclaimerData;
  role?: string;
  'aria-label'?: string;
};

/**
 * Props for custom text component
 */
type TextProps = {
  className?: string;
  children: ReactNode;
  disclaimerData: LegalDisclaimerData;
};

/**
 * Props for custom terms link component
 */
type TermsLinkProps = {
  className?: string;
  href: string;
  children: ReactNode;
  disclaimerData: LegalDisclaimerData;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Props for custom privacy link component
 */
type PrivacyLinkProps = {
  className?: string;
  href: string;
  children: ReactNode;
  disclaimerData: LegalDisclaimerData;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Props for custom separator component
 */
type SeparatorProps = {
  className?: string;
  children?: ReactNode;
  disclaimerData: LegalDisclaimerData;
};

/**
 * Customization options for LegalDisclaimer component
 */
export type LegalDisclaimerCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<ContainerProps>;
    /** Custom text component */
    Text?: ComponentType<TextProps>;
    /** Custom terms link component */
    TermsLink?: ComponentType<TermsLinkProps>;
    /** Custom privacy link component */
    PrivacyLink?: ComponentType<PrivacyLinkProps>;
    /** Custom separator component between terms and privacy */
    Separator?: ComponentType<SeparatorProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /** Function to generate container classes */
    container?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /** Function to generate text classes */
    text?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /** Function to generate terms link classes */
    termsLink?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /** Function to generate privacy link classes */
    privacyLink?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /** Function to generate separator classes */
    separator?: (params: { disclaimerData: LegalDisclaimerData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /** Custom click handler for terms link */
    onTermsClick?: (disclaimerData: LegalDisclaimerData, originalHandler: (url: string) => void) => void;
    /** Custom click handler for privacy link */
    onPrivacyClick?: (disclaimerData: LegalDisclaimerData, originalHandler: (url: string) => void) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      container?: (disclaimerData: LegalDisclaimerData) => string;
    };
    /** Link behavior configuration */
    links?: {
      /** Whether to open links in new tab */
      openInNewTab?: boolean;
      /** Custom rel attribute for security */
      rel?: string;
    };
    /** Display configuration */
    display?: {
      /** Show terms link */
      showTerms?: boolean;
      /** Show privacy link */
      showPrivacy?: boolean;
      /** Custom separator text */
      separatorText?: string;
    };
  };
};

/**
 * Props for LegalDisclaimer component
 */
export interface LegalDisclaimerProps {
  /** Customization options */
  customization?: LegalDisclaimerCustomization;
}

// --- Default Sub-Components ---

const DefaultContainer = (props: ContainerProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { role, 'aria-label': ariaLabel, disclaimerData, ...restProps } = props;
  return <div {...restProps} role={role} aria-label={ariaLabel} />;
};
DefaultContainer.displayName = 'DefaultContainer';

const DefaultText = (props: TextProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { disclaimerData, ...restProps } = props;
  return <p {...restProps} />;
};
DefaultText.displayName = 'DefaultText';

const DefaultTermsLink = (props: TermsLinkProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { target, rel, onClick, disclaimerData, ...restProps } = props;
  return <a target={target} rel={rel} onClick={onClick} {...restProps} />;
};
DefaultTermsLink.displayName = 'DefaultTermsLink';

const DefaultPrivacyLink = (props: PrivacyLinkProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { target, rel, onClick, disclaimerData, ...restProps } = props;
  return <a target={target} rel={rel} onClick={onClick} {...restProps} />;
};
DefaultPrivacyLink.displayName = 'DefaultPrivacyLink';

const DefaultSeparator = (props: SeparatorProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { disclaimerData, ...restProps } = props;
  return <span {...restProps} />;
};
DefaultSeparator.displayName = 'DefaultSeparator';

/**
 * LegalDisclaimer component - Displays Terms of Service and Privacy Policy links with full customization.
 *
 * Renders legal disclaimer text with links based on the `legal` configuration
 * passed to NovaConnectProvider. Returns null if neither termsUrl nor privacyUrl
 * is provided.
 *
 * Features:
 * - Customizable container, text, and link components
 * - Dynamic styling through classNames generators
 * - Custom event handlers for link clicks
 * - Configurable link behavior and display options
 * - Full accessibility support with ARIA labels
 * - Screen reader friendly content structure
 *
 * @example Basic usage
 * ```tsx
 * <LegalDisclaimer />
 * ```
 *
 * @example With full customization
 * ```tsx
 * <LegalDisclaimer
 *   customization={{
 *     components: {
 *       Container: CustomContainer,
 *       TermsLink: CustomTermsLink
 *     },
 *     classNames: {
 *       termsLink: ({ disclaimerData }) =>
 *         'text-blue-500 font-semibold',
 *       privacyLink: ({ disclaimerData }) =>
 *         'text-blue-500 font-semibold'
 *     },
 *     handlers: {
 *       onTermsClick: (disclaimerData, originalHandler) => {
 *         analytics.track('terms_clicked');
 *         originalHandler(disclaimerData.termsUrl!);
 *       }
 *     },
 *     config: {
 *       display: {
 *         separatorText: ' | '
 *       },
 *       links: {
 *         openInNewTab: true
 *       }
 *     }
 *   }}
 * />
 * ```
 *
 * @public
 */
export function LegalDisclaimer({ customization }: LegalDisclaimerProps) {
  const { legal } = useNovaConnect();
  const labels = useNovaConnectLabels();

  // Return null if no legal links are provided
  if (!legal?.termsUrl && !legal?.privacyUrl) {
    return null;
  }

  // Extract customization options
  const {
    Container: CustomContainer = DefaultContainer,
    Text: CustomText = DefaultText,
    TermsLink: CustomTermsLink = DefaultTermsLink,
    PrivacyLink: CustomPrivacyLink = DefaultPrivacyLink,
    Separator: CustomSeparator = DefaultSeparator,
  } = customization?.components ?? {};

  const customHandlers = customization?.handlers;
  const customConfig = customization?.config;

  // Build disclaimer data inline
  const disclaimerData: LegalDisclaimerData = {
    hasTerms: Boolean(legal?.termsUrl),
    hasPrivacy: Boolean(legal?.privacyUrl),
    hasBoth: Boolean(legal?.termsUrl) && Boolean(legal?.privacyUrl),
    termsUrl: legal?.termsUrl,
    privacyUrl: legal?.privacyUrl,
  };

  // Build CSS classes inline
  const cssClasses = {
    container:
      customization?.classNames?.container?.({ disclaimerData }) ??
      cn('novacon:border-t novacon:border-[var(--tuwa-border-primary)]', 'novacon:pt-3 novacon:mt-2'),

    text:
      customization?.classNames?.text?.({ disclaimerData }) ??
      cn('novacon:text-xs novacon:text-center', 'novacon:text-[var(--tuwa-text-secondary)]'),

    termsLink:
      customization?.classNames?.termsLink?.({ disclaimerData }) ??
      cn('novacon:underline novacon:transition-colors', 'novacon:hover:text-[var(--tuwa-text-primary)]'),

    privacyLink:
      customization?.classNames?.privacyLink?.({ disclaimerData }) ??
      cn('novacon:underline novacon:transition-colors', 'novacon:hover:text-[var(--tuwa-text-primary)]'),

    separator: customization?.classNames?.separator?.({ disclaimerData }) ?? '',
  };

  // Handle terms link click
  const handleTermsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (customHandlers?.onTermsClick) {
      e.preventDefault();
      customHandlers.onTermsClick(disclaimerData, (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
  };

  // Handle privacy link click
  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (customHandlers?.onPrivacyClick) {
      e.preventDefault();
      customHandlers.onPrivacyClick(disclaimerData, (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
  };

  // Configuration defaults
  const openInNewTab = customConfig?.links?.openInNewTab !== false;
  const linkRel = customConfig?.links?.rel ?? 'noopener noreferrer';
  const showTerms = customConfig?.display?.showTerms !== false;
  const showPrivacy = customConfig?.display?.showPrivacy !== false;
  const separatorText = customConfig?.display?.separatorText ?? ` ${labels.legalAnd} `;

  const ariaLabel = customConfig?.ariaLabels?.container?.(disclaimerData) ?? 'Legal information';

  return (
    <CustomContainer
      className={cssClasses.container}
      disclaimerData={disclaimerData}
      role="contentinfo"
      aria-label={ariaLabel}
    >
      <CustomText className={cssClasses.text} disclaimerData={disclaimerData}>
        {labels.legalIntro}{' '}
        {showTerms && disclaimerData.hasTerms && (
          <>
            <CustomTermsLink
              className={cssClasses.termsLink}
              href={disclaimerData.termsUrl!}
              target={openInNewTab ? '_blank' : undefined}
              rel={openInNewTab ? linkRel : undefined}
              onClick={handleTermsClick}
              disclaimerData={disclaimerData}
            >
              {labels.legalTerms}
            </CustomTermsLink>
          </>
        )}
        {showTerms && showPrivacy && disclaimerData.hasBoth && (
          <CustomSeparator className={cssClasses.separator} disclaimerData={disclaimerData}>
            {separatorText}
          </CustomSeparator>
        )}
        {showPrivacy && disclaimerData.hasPrivacy && (
          <>
            <CustomPrivacyLink
              className={cssClasses.privacyLink}
              href={disclaimerData.privacyUrl!}
              target={openInNewTab ? '_blank' : undefined}
              rel={openInNewTab ? linkRel : undefined}
              onClick={handlePrivacyClick}
              disclaimerData={disclaimerData}
            >
              {labels.legalPrivacy}
            </CustomPrivacyLink>
          </>
        )}
        .
      </CustomText>
    </CustomContainer>
  );
}

LegalDisclaimer.displayName = 'LegalDisclaimer';
