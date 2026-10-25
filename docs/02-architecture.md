# 02 · Mobile architecture

## Stack (and why)

| Layer | Choice | Why |
|---|---|---|
| App framework | **Expo SDK 58 / React Native 0.88, TypeScript** | One codebase for iOS + Android, cloud builds via EAS (no Mac needed), web preview for VS Code |
| Navigation | **Expo Router** (file-based, `src/app/`) | Deep links (`forkeeps://`) and typed routes for free |
| Local data | **expo-sqlite** behind a `Repository` interface | Local-first: works offline, fast, private by default |
| Browser preview | `WebRepository` (in-memory + localStorage) | `npx expo start --web` runs with zero native setup |
| Cloud (optional) | **Supabase**: Postgres + Auth + Storage + RLS | Family sharing and backup later without changing screens |
| Print | **expo-print** HTML→PDF with trim + bleed, **expo-sharing** | On-device PDF for any local printer; adapter for courier binding |
| State | `useQuery` / `useMutation` over the repository + a tiny Zustand version counter | No server cache library needed for a local-first app |

## Folder layout

```
src/
  app/                 Routes only (Expo Router). Thin screens that compose features.
    (tabs)/            Timeline · Albums · Books · Settings
    memory/ album/ book/  Detail and create screens
    legacy.tsx         The Keep explainer (modal)
  core/
    theme/             Design tokens + light/dark ThemeProvider
    ui/                Reusable primitives: Button, Card, Text, Photo, PhotoGrid, TextField…
    config/            env.ts (EXPO_PUBLIC_*), features.ts (feature flags)
  data/
    types.ts           Domain model + zod validation
    repository.ts      The storage contract every backend implements
    layout.ts          Pure auto-layout for books (shared by all backends)
    sqlite/            Native backend + versioned migrations
    web/               Browser preview backend + demo seed
    createRepository(.web).ts  Platform switch (Metro picks .web.ts on web)
  features/            Self-contained modules, each removable behind a flag
    memories/          Photo picking/persisting, MemoryCard, date grouping
    albums/            AlbumTile
    books/             Trim sizes, print HTML renderer, PDF export, fulfillment adapter
    keep-referral/     Config, eligibility rules, URL builder, hook, KeepCard
    sync/              Supabase client + sync plan
supabase/migrations/   Cloud schema with row-level security
docs/                  These documents
```

**Rule of thumb:** screens import from `core` and `features`; features import from `core`
and `data`; nothing imports from `app/`. Swap a backend by implementing `Repository`.

## Data flow

```
Screen ──useQuery──▶ Repository (interface) ──▶ SQLiteRepository (device)
   │                                       └──▶ WebRepository (browser preview)
   └─useMutation──▶ write ──▶ bump data version ──▶ every mounted query refetches
                                           (later) SyncEngine ⇄ Supabase (RLS)
```

## Photos

- Picked with the **system photo picker** (no broad library permission), EXIF stripped.
- Copied from the picker cache into `Documents/media/` so the OS can't purge them.
- Later uploaded to Supabase Storage at `vault-media/{vault_id}/{asset_id}.{ext}`; the
  storage policy checks vault membership from the first path segment.

## Sync plan (designed, not active)

Every table has `created_at / updated_at / deleted_at`. Push changed rows in FK order,
pull rows changed since the last cursor, last-writer-wins per row, soft deletes win.
Turn on with `features.cloudSync` once Supabase Auth (Sign in with Apple + Google) is set up.

## Scaling notes

- Timeline queries are indexed on `(vault_id, occurred_on, created_at)`; switch the timeline
  to `FlatList`/`FlashList` virtualization past ~500 memories.
- Thumbnails: add an `expo-image-manipulator` step to store a 600px thumbnail per asset.
- Book PDFs embed photos as base64; for 100+ page books, render per-chapter and merge server-side.
