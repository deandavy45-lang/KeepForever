# 04 · App Store & Google Play compliance

Status key: ✅ handled in this build · 🔜 needed before submission · ⚠️ decision/legal review needed.
Guideline numbers refer to Apple's App Review Guidelines and Google Play Developer Policy as of late 2026; re-check at submission.

## Highest-risk item first

⚠️ **The Keep link and Apple's payment rules (3.1.1 / 3.1.3).** Linking to a separate service is
fine when it is informational and the service is a real-world/professional one (estate planning,
legal custody). It becomes a problem if For Keeps shows The Keep's *prices* or a *buy* button for a
*digital* subscription. Keep the in-app surface informational ("Learn about The Keep"), keep pricing
and checkout on The Keep's own site, and have counsel confirm how The Keep's product is classified.
US-storefront rules on external purchase links have loosened since 2025; other storefronts vary.

⚠️ **Tracking (ATT / Play data sharing).** The referral URL carries only UTM tags and an anonymous
per-install token. If The Keep is a *different legal entity* and later joins that token to a named
account, Apple may treat it as cross-company tracking. Either keep it first-party (same company),
or ask for ATT consent before attaching the token.

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

- 🔜 Privacy policy + terms (required by both stores). Cover photos of minors, GDPR/UK GDPR/CCPA rights.
- ⚠️ Estate-planning claims in The Keep copy ("qualified professionals", "will custody") must be
  reviewed for each launch country's legal-services advertising rules.
- ⚠️ Memorial/deceased-user content: define what happens to a vault when the owner dies (the
  hand-off to The Keep is the product answer; the Terms need to say it).
