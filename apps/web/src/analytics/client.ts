'use client';

import posthog from 'posthog-js';
import type { AnalyticsEvent, EventPayloads } from './events';

export function trackEvent<K extends AnalyticsEvent>(event: K, payload: EventPayloads[K]) {
  {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics] dev track:', event, payload);
    }
    posthog.capture(event, payload);
  }
}
