import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// ─── Shared Constants ────────────────────────────────────────────────────────

const STORAGE_KEY = 'tuwa-storybook-theme';
const CHANNEL_EVENT = 'tuwa/set-theme';

// ─── SVG Icons (matches @heroicons/react/24/solid) ───────────────────────────

const SunIcon = ({ size = 18, color = 'currentColor', style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM6.161 5.1a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06Zm10.618 0a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM3 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm15 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-2.25A.75.75 0 0 1 18 12Zm-11.839 4.84a.75.75 0 0 1 1.06 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59Zm10.618 0 1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 1.06-1.06ZM12 18.75a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
  </svg>
);

const MoonIcon = ({ size = 18, color = 'currentColor', style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
  </svg>
);

// ─── ThemeSwitcher (inline-style replica of docs-ui ThemeSwitcher) ───────────

const TRACK_W = 56;
const TRACK_H = 28;
const INDICATOR_SIZE = 24;
const ICON_SIZE = 16;
const BORDER_RADIUS = 6;

const ThemeSwitcher = ({ isDark, onToggle }) => {
  const [hovered, setHovered] = React.useState(false);

  const indicatorLeft = isDark ? TRACK_W - INDICATOR_SIZE - 4 : 2;

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: BORDER_RADIUS,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        background: isDark
          ? (hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)')
          : (hovered ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'),
        cursor: 'pointer',
        padding: '3px',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        outline: 'none',
        flexShrink: 0,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Sliding indicator */}
      <div
        style={{
          position: 'absolute',
          top: 1,
          left: indicatorLeft,
          width: INDICATOR_SIZE,
          height: INDICATOR_SIZE,
          borderRadius: BORDER_RADIUS - 1,
          background: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
          zIndex: 10,
        }}
      />

      {/* Icons row */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SunIcon
            size={ICON_SIZE}
            color={!isDark ? '#eab308' : (hovered ? '#facc15' : '#64748b')}
            style={{ transition: 'color 0.3s ease', position: 'relative', left: -1 }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MoonIcon
            size={ICON_SIZE}
            color={isDark ? '#818cf8' : (hovered ? '#a5b4fc' : '#64748b')}
            style={{ transition: 'color 0.3s ease', position: 'relative', left: 1 }}
          />
        </div>
      </div>
    </button>
  );
};

// ─── Storybook Themes ────────────────────────────────────────────────────────

export const tuwaTheme = create({
  base: 'light',
  brandTitle: 'TUWA UI Components',
  brandUrl: 'https://www.tuwa.io/',
  brandImage: 'https://cdn.jsdelivr.net/gh/TuwaIO/workflows@main/preview/logo_v2.svg',
  brandTarget: '_self',
  colorPrimary: '#6366f1',
  colorSecondary: '#8b5cf6',
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,
  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontCode: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  textColor: '#1f2937',
  textInverseColor: '#ffffff',
  barTextColor: '#6b7280',
  barSelectedColor: '#6366f1',
  barBg: '#f9fafb',
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#1f2937',
  inputBorderRadius: 6,
});

export const tuwaDarkTheme = create({
  base: 'dark',
  brandTitle: 'TUWA UI Components',
  brandUrl: 'https://www.tuwa.io/',
  brandImage: 'https://cdn.jsdelivr.net/gh/TuwaIO/workflows@main/preview/logo_v2.svg',
  brandTarget: '_self',
  colorPrimary: '#8b5cf6',
  colorSecondary: '#6366f1',
  appBg: '#0f172a',
  appContentBg: '#1e293b',
  appBorderColor: '#334155',
  appBorderRadius: 8,
  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontCode: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  textColor: '#f1f5f9',
  textInverseColor: '#0f172a',
  barTextColor: '#94a3b8',
  barSelectedColor: '#8b5cf6',
  barBg: '#1e293b',
  inputBg: '#334155',
  inputBorder: '#475569',
  inputTextColor: '#f1f5f9',
  inputBorderRadius: 6,
});

// ─── Resolve initial theme (sessionStorage > system preference) ──────────────

function getInitialDark() {
  if (typeof window === 'undefined') return false;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  // No stored preference — follow system
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
}

const initialIsDark = getInitialDark();

// Persist immediately so preview iframe can read it on its own mount
if (typeof window !== 'undefined') {
  sessionStorage.setItem(STORAGE_KEY, initialIsDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-tuwa-theme', initialIsDark ? 'dark' : 'light');
}

// ─── Set initial manager theme (runs once on module load) ────────────────────

addons.setConfig({
  theme: initialIsDark ? tuwaDarkTheme : tuwaTheme,
});

// ─── Unified Theme Toggle ────────────────────────────────────────────────────

const UnifiedThemeTool = () => {
  const [isDark, setIsDark] = React.useState(getInitialDark);

  // Broadcast to preview iframe whenever theme changes (including initial mount)
  React.useEffect(() => {
    try {
      const channel = addons.getChannel();
      channel.emit(CHANNEL_EVENT, isDark ? 'dark' : 'light');
    } catch {
      // Channel not ready yet — preview will read from sessionStorage
    }
  }, [isDark]);

  // Also listen for the preview requesting current theme (handshake)
  React.useEffect(() => {
    try {
      const channel = addons.getChannel();
      const handleRequest = () => {
        channel.emit(CHANNEL_EVENT, isDark ? 'dark' : 'light');
      };
      channel.on('tuwa/request-theme', handleRequest);
      return () => channel.off('tuwa/request-theme', handleRequest);
    } catch {
      // Channel not ready
    }
  }, [isDark]);

  const handleToggle = React.useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      // 1. Update manager UI
      addons.setConfig({ theme: next ? tuwaDarkTheme : tuwaTheme });
      // 2. Persist
      sessionStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      // 3. Set data attribute for CSS logo targeting
      document.documentElement.setAttribute('data-tuwa-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px' }}>
      <ThemeSwitcher isDark={isDark} onToggle={handleToggle} />
    </div>
  );
};

// ─── Register ────────────────────────────────────────────────────────────────

addons.register('tuwa/theme-tools', () => {
  addons.add('tuwa/theme-tools/toggle', {
    title: 'Theme',
    type: types.TOOL,
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => <UnifiedThemeTool />,
  });
});

// ─── System preference change listener ───────────────────────────────────────

addons.register('tuwa/system-theme-sync', (api) => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', (e) => {
      const next = e.matches;
      sessionStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      document.documentElement.setAttribute('data-tuwa-theme', next ? 'dark' : 'light');
      api.setOptions({ theme: next ? tuwaDarkTheme : tuwaTheme });
      try {
        addons.getChannel().emit(CHANNEL_EVENT, next ? 'dark' : 'light');
      } catch {
        // noop
      }
    });
  }
});
