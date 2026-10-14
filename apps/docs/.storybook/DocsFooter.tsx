import React from 'react';

// The policies in force, in the order of `publishedPolicies` of @tuwaio/docs-ui (packages/docs-ui/src/policies.ts in
// TuwaIO/docs); the Storybook does not depend on docs-ui, which needs Next.js. Add a policy here when it is published there.
const POLICIES = [
  { slug: 'terms', title: 'Terms of Service' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'cookie', title: 'Cookie Policy' },
  { slug: 'security', title: 'Security Policy' },
  { slug: 'dpa', title: 'Data Processing Addendum' },
];

const POLICIES_INDEX_URL = 'https://docs.tuwa.io/policies';

const linkStyle: React.CSSProperties = { color: 'inherit', textDecoration: 'none' };

/**
 * The footer of every docs page, like the footer of the TUWA documentation sites: the TUWA description and license,
 * the policies on tuwa.io, the list of all policies on the docs hub and the copyright line.
 */
export function DocsFooter() {
  return (
    <footer
      style={{
        marginTop: 64,
        paddingTop: 24,
        borderTop: '1px solid var(--tuwa-border-primary, #e5e7eb)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontSize: 12,
        lineHeight: 1.6,
        color: 'var(--tuwa-text-secondary, #6b7280)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <p style={{ margin: 0 }}>
            The modular, headless-first Web3 infrastructure. Build self-custodial applications on open-source, portable
            building blocks.
          </p>
          <p style={{ margin: 0 }}>Licensed under Apache 2.0. Open source and free to use.</p>
        </div>
        <nav
          aria-label="Policies"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '8px 16px' }}
        >
          {POLICIES.map((policy) => (
            <a
              key={policy.slug}
              href={`https://tuwa.io/${policy.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {policy.title}
            </a>
          ))}
          <a
            href={POLICIES_INDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, fontWeight: 600 }}
          >
            All policies
          </a>
        </nav>
      </div>
      <p style={{ margin: 0, textAlign: 'center' }}>© 2025 - {new Date().getFullYear()} TUWA. All rights reserved.</p>
    </footer>
  );
}
