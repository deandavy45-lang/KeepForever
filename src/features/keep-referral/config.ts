/**
 * Every rule that decides when For Keeps mentions The Keep lives here, so product,
 * legal, and app-review owners can audit the funnel in one file.
 */
export const keepReferralConfig = {
  /** Never shown before the family has real value in the vault. */
  minMemories: 10,
  minDaysSinceFirstMemory: 14,
  /** After a dismissal, stay quiet this long before the timeline card may return. */
  cooldownDaysAfterDismiss: 60,
  /** After this many dismissals the proactive card retires for good (Settings row remains). */
  maxDismissals: 2,
  utm: { utm_source: 'forkeeps', utm_medium: 'app', utm_campaign: 'legacy_referral' },
} as const;

export type ReferralSurface = 'timeline_card' | 'book_export' | 'settings_row';

export const settingsKeys = {
  optedOut: 'keep.optedOut',
  dismissCount: 'keep.dismissCount',
  lastDismissedAt: 'keep.lastDismissedAt',
  installRef: 'keep.installRef',
} as const;
