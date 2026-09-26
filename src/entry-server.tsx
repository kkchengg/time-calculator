import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';

import App from './App';
import { I18nProvider } from './i18n/i18n-context';

/** Renders the app to static HTML for the build-time prerender step. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}
