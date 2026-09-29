/**
 * @file LegalDisclaimer component for displaying Terms and Privacy Policy links with comprehensive customization.
 */

import { cn } from '@tuwaio/nova-core';
import { ComponentType, ReactNode } from 'react';

import { useNovaConnect, useNovaConnectLabels } from '../../hooks';

// --- Types ---

/**
 * The legal links of {@link LegalDisclaimer} (`legal` of `NovaConnectProvider`).
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
 * Props for a custom container.
 */
export type LegalDisclaimerContainerProps = {
  /** Classes from `classNames.container` or the defaults */
  className?: string;
  /** The text */
  children: ReactNode;
  /** The links */
  disclaimerData: LegalDisclaimerData;
  /** `contentinfo` */
  role?: string;
  /** `config.ariaLabels.container` or the `legalInformation` label */
  'aria-label'?: string;
};

/**
 * Props for a custom text (a paragraph by default).
 */
export type LegalDisclaimerTextProps = {
  /** Classes from `classNames.text` or the defaults */
  className?: string;
  /** The `legalIntro` label, the links, the separator and a final period */
  children: ReactNode;
  /** The links */
  disclaimerData: LegalDisclaimerData;
};

/**
 * Props for a custom terms of service link.
 */
export type LegalDisclaimerTermsLinkProps = {
  /** Classes from `classNames.termsLink` or the defaults */
  className?: string;
  /** `termsUrl` */
  href: string;
  /** The `legalTerms` label */
  children: ReactNode;
  /** The links */
  disclaimerData: LegalDisclaimerData;
  /** `_blank` unless `config.links.openInNewTab` is `false` */
  target?: string;
  /** `config.links.rel` or `noopener noreferrer`, with `target` */
  rel?: string;
  /**
   * With `handlers.onTermsClick`, prevents the navigation and calls the handler.
   *
   * @param e - The click event.
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Props for a custom privacy policy link.
 */
export type LegalDisclaimerPrivacyLinkProps = {
  /** Classes from `classNames.privacyLink` or the defaults */
  className?: string;
  /** `privacyUrl` */
  href: string;
  /** The `legalPrivacy` label */
  children: ReactNode;
  /** The links */
  disclaimerData: LegalDisclaimerData;
  /** `_blank` unless `config.links.openInNewTab` is `false` */
  target?: string;
  /** `config.links.rel` or `noopener noreferrer`, with `target` */
  rel?: string;
  /**
   * With `handlers.onPrivacyClick`, prevents the navigation and calls the handler.
   *
   * @param e - The click event.
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Props for a custom separator between the two links.
 */
export type LegalDisclaimerSeparatorProps = {
  /** Classes from `classNames.separator` (none by default) */
  className?: string;
  /** `config.display.separatorText`, or the `legalAnd` label with spaces */
  children?: ReactNode;
  /** The links */
  disclaimerData: LegalDisclaimerData;
};

/**
 * Customization options of {@link LegalDisclaimer}.
 */
export type LegalDisclaimerCustomization = {
  /** Custom components */
  components?: {
    /** Custom container wrapper */
    Container?: ComponentType<LegalDisclaimerContainerProps>;
    /** Custom text component */
    Text?: ComponentType<LegalDisclaimerTextProps>;
    /** Custom terms link component */
    TermsLink?: ComponentType<LegalDisclaimerTermsLinkProps>;
    /** Custom privacy link component */
    PrivacyLink?: ComponentType<LegalDisclaimerPrivacyLinkProps>;
    /** Custom separator component between terms and privacy */
    Separator?: ComponentType<LegalDisclaimerSeparatorProps>;
  };
  /** Custom class name generators */
  classNames?: {
    /**
     * Returns the classes of the container, instead of the default ones.
     *
     * @param params - The disclaimer.
     * @param params.disclaimerData - The links.
     * @returns The classes.
     */
    container?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /**
     * Returns the classes of the text, instead of the default ones.
     *
     * @param params - The disclaimer.
     * @param params.disclaimerData - The links.
     * @returns The classes.
     */
    text?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /**
     * Returns the classes of the terms link, instead of the default ones.
     *
     * @param params - The disclaimer.
     * @param params.disclaimerData - The links.
     * @returns The classes.
     */
    termsLink?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /**
     * Returns the classes of the privacy link, instead of the default ones.
     *
     * @param params - The disclaimer.
     * @param params.disclaimerData - The links.
     * @returns The classes.
     */
    privacyLink?: (params: { disclaimerData: LegalDisclaimerData }) => string;
    /**
     * Returns the classes of the separator, instead of the default ones.
     *
     * @param params - The disclaimer.
     * @param params.disclaimerData - The links.
     * @returns The classes.
     */
    separator?: (params: { disclaimerData: LegalDisclaimerData }) => string;
  };
  /** Custom event handlers */
  handlers?: {
    /**
     * Replaces the navigation of the terms link: call `originalHandler(url)` to open it in a new tab.
     *
     * @param disclaimerData - The links.
     * @param originalHandler - Opens a URL in a new tab.
     */
    onTermsClick?: (disclaimerData: LegalDisclaimerData, originalHandler: (url: string) => void) => void;
    /**
     * Replaces the navigation of the privacy link: call `originalHandler(url)` to open it in a new tab.
     *
     * @param disclaimerData - The links.
     * @param originalHandler - Opens a URL in a new tab.
     */
    onPrivacyClick?: (disclaimerData: LegalDisclaimerData, originalHandler: (url: string) => void) => void;
  };
  /** Configuration options */
  config?: {
    /** Custom ARIA labels */
    ariaLabels?: {
      /**
       * Returns the ARIA label of the container (default: the `legalInformation` label).
       *
       * @param disclaimerData - The links.
       * @returns The label.
       */
      container?: (disclaimerData: LegalDisclaimerData) => string;
    };
    /** Link behavior configuration */
    links?: {
      /** Whether to open links in a new tab (default: `true`) */
      openInNewTab?: boolean;
      /** `rel` of links opened in a new tab (default: `noopener noreferrer`) */
      rel?: string;
    };
    /** Display configuration */
    display?: {
      /** Show the terms link when there is a `termsUrl` (default: `true`) */
      showTerms?: boolean;
      /** Show the privacy link when there is a `privacyUrl` (default: `true`) */
      showPrivacy?: boolean;
      /** Text between the two links (default: the `legalAnd` label with spaces) */
      separatorText?: string;
    };
  };
};

/**
 * Props for the {@link LegalDisclaimer} component.
 */
export interface LegalDisclaimerProps {
  /** Customization options */
  customization?: LegalDisclaimerCustomization;
}

// --- Default Sub-Components ---

const DefaultContainer = (props: LegalDisclaimerContainerProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { role, 'aria-label': ariaLabel, disclaimerData, ...restProps } = props;
  return <div {...restProps} role={role} aria-label={ariaLabel} />;
};
DefaultContainer.displayName = 'DefaultContainer';

const DefaultText = (props: LegalDisclaimerTextProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { disclaimerData, ...restProps } = props;
  return <p {...restProps} />;
};
DefaultText.displayName = 'DefaultText';

const DefaultTermsLink = (props: LegalDisclaimerTermsLinkProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { target, rel, onClick, disclaimerData, ...restProps } = props;
  return <a target={target} rel={rel} onClick={onClick} {...restProps} />;
};
DefaultTermsLink.displayName = 'DefaultTermsLink';

const DefaultPrivacyLink = (props: LegalDisclaimerPrivacyLinkProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { target, rel, onClick, disclaimerData, ...restProps } = props;
  return <a target={target} rel={rel} onClick={onClick} {...restProps} />;
};
DefaultPrivacyLink.displayName = 'DefaultPrivacyLink';

const DefaultSeparator = (props: LegalDisclaimerSeparatorProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `disclaimerData` is used in the default implementation, but not in the type signature
  const { disclaimerData, ...restProps } = props;
  return <span {...restProps} />;
};
DefaultSeparator.displayName = 'DefaultSeparator';

/**
 * The legal line under the wallet list: "By connecting your wallet, you agree to our Terms of Service and Privacy
 * Policy", with the links from `legal` of `NovaConnectProvider` (read through `useNovaConnect`). Renders nothing
 * without `legal.termsUrl` and `legal.privacyUrl`.
 *
 * @param props - See {@link LegalDisclaimerProps}.
 * @returns The legal line, or `null` without links.
 *
 * @example
 * ```tsx
 * import { LegalDisclaimer } from '@tuwaio/nova-connect/components';
 *
 * export const Legal = (
 *   <LegalDisclaimer
 *     customization={{
 *       classNames: { termsLink: () => 'text-blue-500 font-semibold' },
 *       handlers: {
 *         onTermsClick: (disclaimerData, originalHandler) => {
 *           console.log('terms clicked');
 *           originalHandler(disclaimerData.termsUrl ?? '');
 *         },
 *       },
 *       config: { display: { separatorText: ' | ' } },
 *     }}
 *   />
 * );
 * ```
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

  const ariaLabel = customConfig?.ariaLabels?.container?.(disclaimerData) ?? labels.legalInformation;

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
