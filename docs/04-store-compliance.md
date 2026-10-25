# 04 · App Store & Google Play compliance

App: **Keep Forever** (bundle/package `za.co.thekeepvault.keepforever`).

Status key: ✅ handled in this build · 🔜 needed before submission · ⚠️ decision/legal review needed.
Guideline numbers refer to Apple's App Review Guidelines and Google Play Developer Policy as of late 2026; re-check at submission.

## Positioning of The Keep (confirmed 2026-10-25)

- **Entities:** The Keep is operated by The Keep Technologies (Pty) Ltd / The Keep Foundation NPC,
  in the same corporate group as Keep Forever.
- **Monetization:** Keep Forever is a standalone consumer utility. The Keep is an external
  estate/legacy ecosystem paid through its own web gateways (`thekeepvault.co.za`,
  `admin.thekeepvault.co.za`). No Keep purchase happens inside Keep Forever.
- **In-app framing:** an informational referral and account-link bridge to an external legacy
  vault partner service.

### How the build enforces that

| Rule | Where |
|---|---|
| No prices, plans, or "buy" buttons for The Keep anywhere in the app | `legacy.tsx`, `KeepCard.tsx` |
| Links open the external site in the system in-app browser; checkout stays on The Keep's web gateway | `useKeepReferral.ts` |
| "Visit The Keep" → `thekeepvault.co.za`; "I already have a Keep account" → `admin.thekeepvault.co.za` | `env.ts`, `.env.example` |
| Labelled as a separate partner service, dismissible, opt-out in Settings | `KeepCard.tsx`, `settings.tsx` |
| No vault data leaves the app through the link (UTM tags + anonymous install ref only) | `buildReferralUrl.ts` |

### Guideline basis

✅ **Apple 3.1.3(e), goods and services outside the app.** Estate planning, will custody, and
professional legacy services are consumed outside the app, so they may be sold on the web. This is
the rule to cite in App Review notes. 3.1.3(a) "reader apps" and 3.1.3(b) "multiplatform services"
don't fit Keep Forever (it doesn't unlock content bought elsewhere), so don't rely on them.

⚠️ **Keep it informational.** If Keep Forever ever unlocks a feature because the user paid The Keep
(for example "Keep members get unlimited storage"), that becomes digital content and needs IAP
under 3.1.1. Keep any paid Keep Forever features (storage tiers) on StoreKit / Play Billing.

⚠️ **Tracking (ATT).** The Keep companies are separate legal entities in the same group. The build
avoids tracking by default: nothing identifying is sent, and the install ref is only joined to a
person when they sign in on The Keep and choose to link Keep Forever. Have counsel confirm that the
group structure plus this consent step keeps you outside Apple's "tracking" definition; if not,
show the ATT prompt before attaching the ref.

✅ **Suggested App Review note:** "The Keep is an external estate-planning and legacy-vault service
from our corporate group. Keep Forever links to its website for information and sign-in only. No
digital content or features in Keep Forever are sold or unlocked through The Keep (3.1.3(e))."

## Apple App Store

| Area | Guideline | Status |
|---|---|---|
| Photo access via system picker, purpose strings set | 5.1.1 | ✅ `app.json` infoPlist + image-picker plugin |
| No location from photos | 5.1.1 | ✅ `exif: false` |
| In-app account / data deletion | 5.1.1(v) | ✅ local "Delete all my data"; 🔜 also delete the cloud account when sync ships |
| Data sharing needs consent | 5.1.2 | ✅ no vault data sent to The Keep |
| Privacy nutrition label | App Store Connect | 🔜 "Data not collected" until cloud sync; then Photos, User ID (linked, app functionality) |
| Privacy manifest (required-reason APIs) | — | 🔜 add `ios.privacyManifests` in `app.json` for AsyncStorage/UserDefaults when Supabase auth ships |
| Sign in with Apple if Google sign-in is offered | 4.8 | 🔜 when auth is added |
| Physical print orders paid outside IAP | 3.1.5(a) | ✅ fulfillment adapter opens partner checkout |
| Cloud storage subscription (if any) must use IAP | 3.1.1 | ⚠️ use StoreKit (e.g. via RevenueCat) for any paid storage tier |
| Cross-promotion clearly labelled, not deceptive | 2.3 / 5.6 | ✅ "From our partner service, The Keep", dismissible, opt-out |
| Minimum functionality | 4.2 | ✅ full offline vault, albums, books |
| Encryption export declaration | — | ✅ `ITSAppUsesNonExemptEncryption: false` (HTTPS only) |

## Google Play

| Area | Policy | Status |
|---|---|---|
| Photo & video permissions | Photo and Video Permissions policy | ✅ Android Photo Picker only; `READ_MEDIA_*` blocked in `app.json` |
| Data safety form | User Data | 🔜 mirror the Apple label |
| Account deletion in-app **and** via web link | User Data | ✅ in-app; 🔜 web deletion page once accounts exist |
| Physical goods payments | Payments | ✅ outside Play Billing |
| Digital subscriptions | Payments | ⚠️ Play Billing (or user-choice billing where eligible) |
| Deceptive behavior / ads | Ads & Deceptive Behavior | ✅ referral is not an ad network, labelled, dismissible |
| Target API level | Target API | ✅ handled by Expo SDK 58 |

## Other legal

- 🔜 Privacy policy + terms (required by both stores). Cover photos of minors, POPIA (South Africa, primary market), GDPR/UK GDPR/CCPA rights.
- 🔜 Name the responsible party and Information Officer under POPIA in the privacy policy.
- ⚠️ Estate-planning claims in The Keep copy ("qualified professionals", "will custody") must be
  reviewed for each launch country's legal-services advertising rules.
- ⚠️ Memorial/deceased-user content: define what happens to a vault when the owner dies (the
  hand-off to The Keep is the product answer; the Terms need to say it).
