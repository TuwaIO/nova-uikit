/**
 * @file LegalDisclaimer component for displaying Terms and Privacy Policy links.
 */

import { memo } from 'react';

import { useNovaConnect, useNovaConnectLabels } from '../../hooks';

/**
 * LegalDisclaimer component - Displays Terms of Service and Privacy Policy links.
 *
 * Renders legal disclaimer text with links based on the `legal` configuration
 * passed to NovaConnectProvider. Returns null if neither termsUrl nor privacyUrl
 * is provided.
 *
 * @example
 * ```tsx
 * <NovaConnectProvider legal={{ termsUrl: '/terms', privacyUrl: '/privacy' }}>
 *   <ConnectModal /> // LegalDisclaimer renders inside
 * </NovaConnectProvider>
 * ```
 */
export const LegalDisclaimer = memo(() => {
  const { legal } = useNovaConnect();
  const labels = useNovaConnectLabels();

  // Return null if no legal links are provided
  if (!legal?.termsUrl && !legal?.privacyUrl) {
    return null;
  }

  const hasTerms = Boolean(legal.termsUrl);
  const hasPrivacy = Boolean(legal.privacyUrl);
  const hasBoth = hasTerms && hasPrivacy;

  return (
    <div
      className="novacon:border-t novacon:border-[var(--tuwa-border-primary)] novacon:pt-3 novacon:mt-2"
      role="contentinfo"
      aria-label="Legal information"
    >
      <p className="novacon:text-xs novacon:text-center novacon:text-[var(--tuwa-text-secondary)]">
        {labels.legalIntro}{' '}
        {hasTerms && (
          <a
            href={legal.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="novacon:underline novacon:hover:text-[var(--tuwa-text-primary)] novacon:transition-colors"
          >
            {labels.legalTerms}
          </a>
        )}
        {hasBoth && ` ${labels.legalAnd} `}
        {hasPrivacy && (
          <a
            href={legal.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="novacon:underline novacon:hover:text-[var(--tuwa-text-primary)] novacon:transition-colors"
          >
            {labels.legalPrivacy}
          </a>
        )}
        .
      </p>
    </div>
  );
});

LegalDisclaimer.displayName = 'LegalDisclaimer';
