# 03 · Data model

Same tables locally (SQLite, `src/data/sqlite/migrations.ts`) and in the cloud
(Postgres, `supabase/migrations/0001_init.sql`). IDs are UUIDs generated on device so rows
can be created offline and synced later without collisions.

```
vaults 1─┬─* vault_members *─1 auth.users        (cloud only: sharing + roles)
         ├─* people
         ├─* memories 1─* media_assets
         │      └─* memory_people *─1 people
         ├─* albums 1─* album_memories *─1 memories
         └─* books 1─* book_pages  (asset_ids → media_assets)
                └─* print_orders                  (cloud only)
keep_referrals (cloud) · referral_events, settings (device only)
```

| Table | Purpose | Notes |
|---|---|---|
| `vaults` | One family's collection | Owner + members (owner / editor / viewer) in the cloud |
| `memories` | A moment: title, story, date, place | `occurred_on` drives the timeline; may be null ("Undated") |
| `media_assets` | Photos in a memory | `local_uri` on device, `remote_path` once uploaded |
| `people`, `memory_people` | Who is in a memory | Powers person albums and the legacy hand-off later |
| `albums`, `album_memories` | Ordered collections | `kind`: manual, year, person (smart albums later) |
| `books`, `book_pages` | Keepsake book drafts | `trim_size`, user cover fields (`subtitle`, `spine_text`, `emblem_uri`), page `layout` incl. `back_cover`, ordered `asset_ids` |
| `print_orders` | Courier-bound orders | Physical goods, paid outside IAP |
| `referral_events` | Local log of Keep card impressions/opens/dismissals | Drives frequency caps; never uploaded with PII |
| `keep_referrals` | Anonymous install ref → optional Keep account link | Linked only after the user signs up on The Keep and consents |

## Row-level security

Verified locally against Postgres 16 with Supabase-style `auth` and `storage` stubs:
a member reads and writes their vault; a non-member sees 0 rows and gets an RLS error on insert.
Viewers can read; editors can write content; only owners manage members or delete the vault.

## Migrations

- Device: append to the `migrations` array; `PRAGMA user_version` tracks what ran.
- Cloud: add `supabase/migrations/0002_*.sql`, run `supabase db push`.
- Keep `src/data/types.ts` in step with both.
