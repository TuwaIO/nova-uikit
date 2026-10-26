import React from 'react';

// The policies in force, in the order of `footerPolicies` of @tuwaio/docs-ui (packages/docs-ui/src/policies.ts in
// TuwaIO/docs); the Storybook does not depend on docs-ui, which needs Next.js. Add a policy here when it is published there.
const POLICIES = [
  { slug: 'terms', title: 'Terms of Service' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'cookie', title: 'Cookie Policy' },
  { slug: 'security', title: 'Security Policy' },
  { slug: 'dpa', title: 'Data Processing Addendum' },
];

const POLICIES_INDEX_URL = 'https://docs.tuwa.io/policies';

// The default footer links of the documentation sites (`baseFooterLinks` of @tuwaio/docs-ui).
const LINKS = [
  {
    title: 'NPM',
    href: 'https://npmjs.com/org/tuwaio',
    className: 'tuwa-docs-footer__social--npm',
    path: 'M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113l.017-13.847z',
  },
  {
    title: 'GitHub',
    href: 'https://github.com/TuwaIO',
    className: '',
    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
];

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

/**
 * The footer of every docs page, like the footer of the TUWA documentation sites: the TUWA logo and the npm and GitHub
 * organizations, the TUWA description and license, the policies on tuwa.io, the list of all policies on the docs hub
 * and the copyright line. `sb-unstyled` keeps the typography of the docs pages off it; the styles are in
 * `src/styles/app.css` (`.tuwa-docs-footer`).
 */
export function DocsFooter() {
  return (
    <footer className="sb-unstyled tuwa-docs-footer">
      <div className="tuwa-docs-footer__row">
        <a href="https://tuwa.io" {...external} aria-label="TUWA" className="tuwa-docs-footer__logo">
          <img src="https://tuwa.io/brand/logo_glow.svg" alt="TUWA" height={24} />
        </a>
        <nav aria-label="TUWA on the web" className="tuwa-docs-footer__links">
          {LINKS.map((link) => (
            <a
              key={link.title}
              href={link.href}
              {...external}
              className={`tuwa-docs-footer__link tuwa-docs-footer__social ${link.className}`}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={link.path} />
              </svg>
              <span>{link.title}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="tuwa-docs-footer__row tuwa-docs-footer__divided">
        <div className="tuwa-docs-footer__about">
          <p className="tuwa-docs-footer__description">
            The modular, headless-first Web3 infrastructure. Build self-custodial applications on open-source, portable
            building blocks.
          </p>
          <p className="tuwa-docs-footer__license">Licensed under Apache 2.0. Open source and free to use.</p>
        </div>
        <nav aria-label="Policies" className="tuwa-docs-footer__links tuwa-docs-footer__policies">
          {POLICIES.map((policy) => (
            <a
              key={policy.slug}
              href={`https://tuwa.io/${policy.slug}`}
              {...external}
              className="tuwa-docs-footer__link"
            >
              {policy.title}
            </a>
          ))}
          <a href={POLICIES_INDEX_URL} {...external} className="tuwa-docs-footer__link tuwa-docs-footer__link--strong">
            All policies
          </a>
        </nav>
      </div>

      <div className="tuwa-docs-footer__copyright tuwa-docs-footer__divided">
        © 2025 - {new Date().getFullYear()} TUWA. All rights reserved.
      </div>
    </footer>
  );
}
