import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new BrowserTracing(),
    ],
    tracesSampleRate: 0.1,
  });
}

export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    contexts: {
      app: context,
    },
  });
}
