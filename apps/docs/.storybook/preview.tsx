import '../src/styles/app.css';

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import { defaultLabels as transactionsLabels } from '@tuwaio/nova-transactions';
import { NovaTransactionsLabelsProvider } from '@tuwaio/nova-transactions/providers';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Introduction', 'Theming', 'ConnectButton', 'Nova Core', 'Nova Transactions', 'API_Reference'],
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
    // Adds .dark class to body in iframe when theme is switched
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <NovaTransactionsLabelsProvider labels={transactionsLabels}>
        <Story />
      </NovaTransactionsLabelsProvider>
    ),
  ],
};

export default preview;
