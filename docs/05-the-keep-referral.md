# 05 · The Keep referral bridge

All rules live in `src/features/keep-referral/config.ts`; the decision is a pure function
(`eligibility.ts`) so it is easy to test and audit.

## Surfaces

| Surface | When it shows | Gated? |
|---|---|---|
| `timeline_card` | Top of the timeline | Yes: ≥10 memories, ≥14 days since first memory, not dismissed in the last 60 days, <2 dismissals, not opted out |
| `book_export` | On a book after its PDF has been exported | Yes: same dismissal/opt-out rules, needs ≥1 book |
| `settings_row` | Settings → Legacy → The Keep | No: always available, user-initiated |

## Flow

1. Card → **explainer screen** (`/legacy`): what The Keep is, that it is separate, and
   "what we share: nothing from your vault".
2. "Visit The Keep" opens the **in-app browser** (SFSafariViewController / Chrome Custom Tabs).
   The user can close it and land back where they were.
3. URL: `EXPO_PUBLIC_KEEP_REFERRAL_URL?utm_source=forkeeps&utm_medium=app&utm_campaign=legacy_referral&utm_content=<surface>&ref=<install uuid>`.
4. On The Keep, after sign-up, the user may choose "Connect my For Keeps vault". The Keep's
   backend sets `keep_referrals.keep_account_linked_at` with the service role. Vault transfer is a
   separate, explicit, user-approved step (future).

## Metrics

Local `referral_events` (impression, open, dismiss, opt_out) give the funnel per surface.
Report only aggregates. Suggested targets to tune the thresholds: open-rate per impression
≥ 4%, opt-out rate < 2%, no change in D30 retention between users who saw the card and those who didn't.

## Tuning

Change thresholds in `config.ts`; turn the whole bridge off with `features.keepReferral = false`.
