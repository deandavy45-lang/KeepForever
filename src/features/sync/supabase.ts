import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isCloudSyncConfigured } from '@/core/config/env';

let client: SupabaseClient | null = null;

/**
 * Lazily created Supabase client for optional cloud backup and multi-device family sharing.
 * Returns null when EXPO_PUBLIC_SUPABASE_* are unset, so the app stays fully offline.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isCloudSyncConfigured) return null;
  client ??= createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
  return client;
}
