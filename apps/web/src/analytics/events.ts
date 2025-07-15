const EVENTS = {
  LANDING: {
    CTA: 'landing_cta',
    SCROLL: 'landing_scroll',
  },
  SIGNUP: {
    SUCCESS: 'signup_success',
    FAIL: 'signup_fail',
  },
} as const;

type EventValue<T> =
  T extends Record<any, infer U> ? (U extends string ? U : EventValue<U>) : never;

export type AnalyticsEvent = EventValue<typeof EVENTS>;

export type EventPayloads = {
  landing_cta: { source: string };
  signup_success: { userId: string };
  signup_fail: { reason: string };
  landing_scroll: { position: number };
};
