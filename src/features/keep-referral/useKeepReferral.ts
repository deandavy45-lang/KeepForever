import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { useMutation, useQuery } from '@/data';
import { newId, now } from '@/data/ids';
import { features } from '@/core/config/features';
import { buildReferralUrl } from './buildReferralUrl';
import { settingsKeys, type ReferralSurface } from './config';
import { isEligible } from './eligibility';

export function useKeepReferral(surface: ReferralSurface) {
  const { data } = useQuery(async (repo) => {
    const [stats, optedOut, dismissCount, lastDismissedAt] = await Promise.all([
      repo.getStats(),
      repo.getSetting(settingsKeys.optedOut),
      repo.getSetting(settingsKeys.dismissCount),
      repo.getSetting(settingsKeys.lastDismissedAt),
    ]);
    const state = { optedOut: optedOut === '1', dismissCount: Number(dismissCount ?? 0), lastDismissedAt };
    return { visible: features.keepReferral && isEligible(surface, stats, state), state };
  }, [surface]);

  const logImpression = useMutation((repo) => repo.logReferralEvent('impression', surface)).run;

  const dismiss = useMutation(async (repo) => {
    await repo.setSetting(settingsKeys.dismissCount, String((data?.state.dismissCount ?? 0) + 1));
    await repo.setSetting(settingsKeys.lastDismissedAt, now());
    await repo.logReferralEvent('dismiss', surface);
  }).run;

  const setOptOut = useMutation(async (repo, optOut: boolean) => {
    await repo.setSetting(settingsKeys.optedOut, optOut ? '1' : '0');
    if (optOut) await repo.logReferralEvent('opt_out', surface);
  }).run;

  const open = useMutation(async (repo) => {
    let ref = await repo.getSetting(settingsKeys.installRef);
    if (!ref) {
      ref = newId();
      await repo.setSetting(settingsKeys.installRef, ref);
    }
    await repo.logReferralEvent('open', surface);
    // In-app browser (SFSafariViewController / Custom Tabs): user stays in For Keeps and can close it anytime.
    await WebBrowser.openBrowserAsync(buildReferralUrl(surface, ref));
  }).run;

  return {
    visible: data?.visible ?? false,
    optedOut: data?.state.optedOut ?? false,
    logImpression: useCallback(() => void logImpression(), [logImpression]),
    dismiss,
    setOptOut,
    open,
  };
}
