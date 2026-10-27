import '../src/styles/app.css';

import { DocsContainer } from '@storybook/addon-docs/blocks';
import type { Preview } from '@storybook/react-vite';
import { defaultLabels as transactionsLabels } from '@tuwaio/nova-transactions';
import { NovaTransactionsLabelsProvider } from '@tuwaio/nova-transactions/providers';
import React, { useEffect, useState } from 'react';
import { addons } from 'storybook/preview-api';
import { create } from 'storybook/theming/create';

import { DocsFooter } from './DocsFooter';

/** Shared constants — must match manager.jsx */
const STORAGE_KEY = 'tuwa-storybook-theme';
const CHANNEL_EVENT = 'tuwa/set-theme';

/**
 * Resolves the initial theme from sessionStorage (written by the manager only after the user
 * switches the theme) or falls back to system preference.
 */
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return 'dark';
    if (stored === 'light') return 'light';
    if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return 'dark';
  }
  return 'light';
}

/**
 * Applies the theme to the iframe document root.
 */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
  }
}

// ─── Theme Definitions ────────────────────────────────────────────────────────

const LOGO_LIGHT = 'https://tuwa.io/brand/logo_v2.svg';
const LOGO_DARK = 'https://tuwa.io/brand/logo_glow.svg';

const tuwaTheme = create({
  base: 'light',
  brandTitle: 'TUWA UI Components',
  brandUrl: 'https://www.tuwa.io/',
  brandImage: LOGO_LIGHT,
  brandTarget: '_self',
  colorPrimary: '#0052ff',
  colorSecondary: '#0052ff',
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,
  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontCode: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  textColor: '#1f2937',
  textInverseColor: '#ffffff',
  barTextColor: '#6b7280',
  barSelectedColor: '#0052ff',
  barBg: '#f9fafb',
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#1f2937',
  inputBorderRadius: 6,
});

const tuwaDarkTheme = create({
  base: 'dark',
  brandTitle: 'TUWA UI Components',
  brandUrl: 'https://www.tuwa.io/',
  brandImage: LOGO_DARK,
  brandTarget: '_self',
  colorPrimary: '#0052ff',
  colorSecondary: '#38bdf8',
  appBg: '#0a0e27',
  appContentBg: '#0d1230',
  appBorderColor: '#1e293b',
  appBorderRadius: 8,
  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontCode: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  textColor: '#f1f5f9',
  textInverseColor: '#0a0e27',
  barTextColor: '#94a3b8',
  barSelectedColor: '#38bdf8',
  barBg: '#0a0e27',
  inputBg: '#11183c',
  inputBorder: '#334155',
  inputTextColor: '#f1f5f9',
  inputBorderRadius: 6,
});

// ─── Themed Docs Container ────────────────────────────────────────────────────
// This wraps MDX pages and auto-docs. By using DocsContainer, Storybook natively
// themes the entire Docs UI (tables, backgrounds, copy buttons) perfectly.

const ThemedDocsContainer = ({ children, context }: any) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let channel: ReturnType<typeof addons.getChannel>;
    try {
      channel = addons.getChannel();
    } catch {
      return;
    }

    const handleThemeChange = (newTheme: string) => {
      setTheme(newTheme === 'dark' ? 'dark' : 'light');
    };

    channel.on(CHANNEL_EVENT, handleThemeChange);
    channel.emit('tuwa/request-theme');

    return () => {
      channel.off(CHANNEL_EVENT, handleThemeChange);
    };
  }, []);

  return (
    <DocsContainer context={context} theme={theme === 'dark' ? tuwaDarkTheme : tuwaTheme}>
      {children}
      <DocsFooter />
    </DocsContainer>
  );
};

// ─── Theme Injector for Component Previews ────────────────────────────────────
// This decorator ensures the `.dark` class is set on <html> for standard stories.

const ThemeInjector = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let channel: ReturnType<typeof addons.getChannel>;
    try {
      channel = addons.getChannel();
    } catch {
      return;
    }

    const handleThemeChange = (newTheme: string) => {
      setTheme(newTheme === 'dark' ? 'dark' : 'light');
    };

    channel.on(CHANNEL_EVENT, handleThemeChange);
    channel.emit('tuwa/request-theme');

    return () => {
      channel.off(CHANNEL_EVENT, handleThemeChange);
    };
  }, []);

  return <>{children}</>;
};

// Apply theme immediately at module level (before React mounts)
applyTheme(getInitialTheme());

// ─── Preview Configuration ─────────────────────────────────────────────────────

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    docs: {
      container: ThemedDocsContainer,
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Theming',
          'ConnectButton',
          'Nova Core',
          'Nova Transactions',
          'Packages',
          [
            'Overview',
            'nova-core',
            ['Overview', '*'],
            'nova-connect',
            ['Overview', 'connect', ['Overview', '*'], '*', ['Overview', '*']],
            'nova-transactions',
            ['Overview', 'transactions', ['Overview', '*'], '*', ['Overview', '*']],
          ],
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    status: {
      statuses: {
        stable: {
          background: '#10b981',
          color: '#ffffff',
          description: 'Stable API',
        },
        beta: {
          background: '#f59e0b',
          color: '#ffffff',
          description: 'Beta version',
        },
        deprecated: {
          background: '#ef4444',
          color: '#ffffff',
          description: 'Will be removed',
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeInjector>
        <Story />
      </ThemeInjector>
    ),
    (Story) => (
      <NovaTransactionsLabelsProvider labels={transactionsLabels}>
        <Story />
      </NovaTransactionsLabelsProvider>
    ),
  ],
};

export default preview;
