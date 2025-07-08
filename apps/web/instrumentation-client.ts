import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  ui_host: 'https://us.posthog.com',
  defaults: '2025-05-24',
  capture_exceptions: false,
  debug: process.env.NODE_ENV === 'development',
});
