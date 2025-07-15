import { PostHog } from 'posthog-node';
import type { AnalyticsEvent, EventPayloads } from './events';

// TODO: this needs to be moved somewhere else, but ok for now
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!POSTHOG_API_KEY) {
  throw new Error('POSTHOG_API_KEY is not defined in environment variables.');
}
const posthog = new PostHog(POSTHOG_API_KEY, { host: 'https://us.i.posthog.com' });

export function trackEvent<K extends AnalyticsEvent>(
  event: K,
  payload: EventPayloads[K],
  distinctId: string = 'general' // Optionally allow passing a real user ID
) {
  posthog.capture({
    event,
    distinctId,
    properties: payload,
  });
}
