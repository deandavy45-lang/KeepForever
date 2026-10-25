/**
 * Feature flags. Flip these to ship modules independently.
 * Each feature folder under src/features/ reads its own flag and renders nothing when off.
 */
export const features = {
  keepReferral: true,
  printOrdering: false, // courier binding: enable once a fulfillment partner is wired up
  cloudSync: false, // enable once Supabase project + auth are configured
} as const;
