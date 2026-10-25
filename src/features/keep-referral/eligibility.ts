import type { VaultStats } from '@/data';
import { keepReferralConfig as cfg, type ReferralSurface } from './config';

export interface ReferralState {
  optedOut: boolean;
  dismissCount: number;
  lastDismissedAt: string | null;
}

const DAY = 86_400_000;

/**
 * Pure decision function: should a proactive referral surface render right now?
 * The Settings row is always available (user-initiated), and is not gated here.
 */
export function isEligible(surface: ReferralSurface, stats: VaultStats, s: ReferralState, nowMs = Date.now()): boolean {
  if (surface === 'settings_row') return true;
  if (s.optedOut || s.dismissCount >= cfg.maxDismissals) return false;
  if (s.lastDismissedAt && nowMs - Date.parse(s.lastDismissedAt) < cfg.cooldownDaysAfterDismiss * DAY) return false;

  if (surface === 'book_export') return stats.bookCount > 0;

  const tenureOk = stats.firstMemoryAt != null && nowMs - Date.parse(stats.firstMemoryAt) >= cfg.minDaysSinceFirstMemory * DAY;
  return stats.memoryCount >= cfg.minMemories && tenureOk;
}
