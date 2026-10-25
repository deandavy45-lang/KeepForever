/**
 * Sync plan (not yet active, see docs/02-architecture.md):
 *  1. Push: rows where updated_at > last_push_at, in FK order (vaults → memories → media → albums → books → pages).
 *     Media files upload to Storage bucket `vault-media/{vault_id}/{asset_id}` before their row.
 *  2. Pull: rows where updated_at > last_pull_at for vaults the user is a member of (RLS enforces this).
 *  3. Conflicts: last-writer-wins per row on updated_at; soft deletes (deleted_at) win over edits.
 * The Repository interface stays unchanged; sync runs beside it.
 */
export {};
