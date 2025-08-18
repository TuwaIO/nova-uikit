import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

export const tuwaTheme = create({
  base: 'light',

  brandTitle: 'TUWA UI Components',
  brandUrl: 'https://docs.tuwa.io/',
  brandImage: './logo.svg',
  brandTarget: '_self',

  colorPrimary: '#6366f1',
  colorSecondary: '#8b5cf6',

  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,

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
  brandUrl: 'https://docs.tuwa.io/',
  brandImage: './logo-dark.svg',
  brandTarget: '_self',

  colorPrimary: '#8b5cf6',
  colorSecondary: '#6366f1',

  appBg: '#0f172a',
  appContentBg: '#1e293b',
  appBorderColor: '#334155',
  appBorderRadius: 8,

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

addons.setConfig({
  theme: tuwaTheme,
});

addons.setConfig({
  toolbar: {
    theme: {
      items: [
        { value: 'light', title: 'Light Theme' },
        { value: 'dark', title: 'Dark Theme' },
      ],
    },
  },
});

addons.setConfig({
  toolbar: {
    'tuwa/theme-switcher': {
      icon: 'paintbrush',
      title: 'Switch Theme',
    },
    'tuwa/docs-link': {
      icon: 'document',
      title: 'Documentation',
      onClick: () => window.open('https://docs.tuwa.io', '_blank'),
    },
  },
});
