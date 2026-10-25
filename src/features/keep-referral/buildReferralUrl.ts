import { env } from '@/core/config/env';
import { keepReferralConfig, type ReferralSurface } from './config';

/**
 * Carries only campaign attribution and an anonymous per-install token.
 * No names, emails, photos, or vault contents ever leave the device through this link,
 * which keeps it outside App Tracking Transparency and Play "data sharing" disclosures.
 */
export function buildReferralUrl(surface: ReferralSurface, installRef: string): string {
  const url = new URL(env.keepReferralUrl);
  for (const [k, v] of Object.entries(keepReferralConfig.utm)) url.searchParams.set(k, v);
  url.searchParams.set('utm_content', surface);
  url.searchParams.set('ref', installRef);
  return url.toString();
}
