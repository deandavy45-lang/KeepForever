/**
 * Runtime configuration. Only EXPO_PUBLIC_* variables are inlined into the bundle,
 * so never put secrets here. Supabase anon keys are safe to ship because RLS protects data.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  /** The Keep public site: where the referral bridge introduces new families. */
  keepReferralUrl: process.env.EXPO_PUBLIC_KEEP_REFERRAL_URL ?? 'https://thekeepvault.co.za',
  /** The Keep account portal: for families who already have a Keep account. */
  keepAccountUrl: process.env.EXPO_PUBLIC_KEEP_ACCOUNT_URL ?? 'https://admin.thekeepvault.co.za',
} as const;

export const isCloudSyncConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
