export const EVENTS = {
  LANDING: {
    CTA: 'landing_cta',
    SCROLL: 'landing_scroll',
  },
  SIGNUP: {
    CLICK: 'sign_click_google',
    SUCCESS: 'sign_success',
    FAIL: 'sign_fail',
  },
} as const;

type EventValue<T> =
  T extends Record<string, infer U> ? (U extends string ? U : EventValue<U>) : never;

export type AnalyticsEvent = EventValue<typeof EVENTS>;

export type EventPayloads = {
  landing_cta: { source: string };
  sign_success: { userId: string };
  sign_click_google: { source: string };
  sign_fail: { reason: string };
  landing_scroll: { position: number };
};
