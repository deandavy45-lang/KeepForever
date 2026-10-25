# For Keeps

Family photo, memory, and keepsake-book app for iOS and Android. Local-first, private by
default, with a calm, opt-in bridge to **The Keep** for estate and legacy planning.

## Open in VS Code (2 minutes)

1. Unzip, then **File → Open Folder…** and pick `for-keeps`. Accept the recommended extensions.
2. Install Node.js 20+ (https://nodejs.org) if you don't have it.
3. Terminal → **Run Task… → Install** (or `npm install`).
4. Terminal → **Run Task… → Preview in browser** (or `npm run web`), then open http://localhost:8081.
   The browser preview uses demo data and runs with no phone or native tooling.

Also works as a **Dev Container / GitHub Codespace** (`.devcontainer/` included; port 8081 opens automatically).

## Run on a phone

This app uses native modules (SQLite, print, file system), so it runs in a **development build**,
not Expo Go:

```bash
npx eas-cli@latest login
npm run build:dev            # cloud build, install the result on your phone
npm start                    # then open the app; it connects to this dev server
```

## Ship to the stores

```bash
npm run build:prod           # signed iOS + Android builds on EAS
npm run submit               # upload to App Store Connect and Google Play Console
```

Before the first submission, work through `docs/04-store-compliance.md`.

## Configuration

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_KEEP_REFERRAL_URL` | The Keep landing page for the referral link |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Optional cloud backup/sharing (leave blank for offline-only) |

Feature flags: `src/core/config/features.ts` (`keepReferral`, `printOrdering`, `cloudSync`).
App identity (name, bundle IDs `com.forkeeps.app`, permissions): `app.json`.

## Docs

| Doc | What's in it |
|---|---|
| [01 UX research](docs/01-ux-research.md) | Personas, competitor teardown, retention loops, UI principles, interview guide |
| [02 Architecture](docs/02-architecture.md) | Stack, folder layout, data flow, sync plan, scaling notes |
| [03 Data model](docs/03-data-model.md) | Tables, relationships, row-level security |
| [04 Store compliance](docs/04-store-compliance.md) | Apple + Google checklist with status |
| [05 The Keep referral](docs/05-the-keep-referral.md) | Surfaces, eligibility rules, flow, metrics |

## Scripts

`npm run web` · `npm start` · `npm run typecheck` · `npm run doctor` · `npm run build:dev` · `npm run build:prod` · `npm run submit`
