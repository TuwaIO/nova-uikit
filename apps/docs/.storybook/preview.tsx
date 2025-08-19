import '../src/styles/app.css';

import type { Preview } from '@storybook/react-vite';
import { defaultLabels } from '@tuwaio/nova-transactions';
import { LabelsProvider } from '@tuwaio/nova-transactions/providers';

// @ts-expect-error - theme is a valid option
import { tuwaTheme } from './manager';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Introduction', 'NovaProvider', 'UI Components', 'API_Reference'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: tuwaTheme,
    },
    globalTypes: {
      theme: {
        description: 'Global theme for components',
        defaultValue: 'light',
        toolbar: {
          title: 'Theme',
          icon: 'paintbrush',
          items: ['light', 'dark'],
          dynamicTitle: true,
        },
      },
    },
    status: {
      statuses: {
        stable: {
          background: '#10b981',
          color: '#ffffff',
          description: 'Production ready',
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
      <LabelsProvider labels={defaultLabels}>
        <Story />
      </LabelsProvider>
    ),
  ],
};

export default preview;
