/**
 * Runtime configuration. Only EXPO_PUBLIC_* variables are inlined into the bundle,
 * so never put secrets here. Supabase anon keys are safe to ship because RLS protects data.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  keepReferralUrl:
    process.env.EXPO_PUBLIC_KEEP_REFERRAL_URL ?? 'https://thekeep.example.com/welcome',
} as const;

export const isCloudSyncConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
