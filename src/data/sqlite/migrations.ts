/**
 * Local SQLite schema, applied in order and tracked with PRAGMA user_version.
 * Never edit a shipped migration; append a new one.
 * Mirrors supabase/migrations/0001_init.sql (minus auth/RLS) so rows sync 1:1.
 */
export const migrations: string[] = [
  /* 1: initial schema */ `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE vaults (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE people (
    id TEXT PRIMARY KEY NOT NULL,
    vault_id TEXT NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    relation TEXT,
    birth_date TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE memories (
    id TEXT PRIMARY KEY NOT NULL,
    vault_id TEXT NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL DEFAULT '',
    occurred_on TEXT,
    location TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_memories_timeline ON memories(vault_id, occurred_on DESC, created_at DESC);

  CREATE TABLE media_assets (
    id TEXT PRIMARY KEY NOT NULL,
    memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    local_uri TEXT NOT NULL,
    remote_path TEXT,
    width INTEGER, height INTEGER, mime_type TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_media_memory ON media_assets(memory_id, position);

  CREATE TABLE memory_people (
    memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    PRIMARY KEY (memory_id, person_id)
  );

  CREATE TABLE albums (
    id TEXT PRIMARY KEY NOT NULL,
    vault_id TEXT NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    kind TEXT NOT NULL DEFAULT 'manual' CHECK (kind IN ('manual','year','person')),
    cover_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE album_memories (
    album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (album_id, memory_id)
  );

  CREATE TABLE books (
    id TEXT PRIMARY KEY NOT NULL,
    vault_id TEXT NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
    album_id TEXT REFERENCES albums(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    trim_size TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','exported','ordered')),
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE book_pages (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    layout TEXT NOT NULL,
    asset_ids TEXT NOT NULL DEFAULT '[]', -- JSON array of media_assets.id
    heading TEXT,
    body TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_pages_book ON book_pages(book_id, position);

  CREATE TABLE referral_events (
    id TEXT PRIMARY KEY NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('impression','open','dismiss','opt_out')),
    surface TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  `,
];
