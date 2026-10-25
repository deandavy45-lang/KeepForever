import { Directory, Paths } from 'expo-file-system';
import type { SQLiteDatabase } from 'expo-sqlite';
import { newId, now } from '../ids';
import { autoLayout } from '../layout';
import type { Repository } from '../repository';
import type {
  Album,
  AlbumSummary,
  BookPage,
  BookWithPages,
  ID,
  KeepsakeBook,
  MediaAsset,
  MemoryWithMedia,
  NewMemory,
  ReferralEventKind,
  TrimSize,
  VaultStats,
} from '../types';
import { migrations } from './migrations';

type Row = Record<string, any>;

const toMemory = (r: Row): Omit<MemoryWithMedia, 'media'> => ({
  id: r.id, vaultId: r.vault_id, title: r.title, story: r.story, occurredOn: r.occurred_on,
  location: r.location, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at,
});
const toAsset = (r: Row): MediaAsset => ({
  id: r.id, memoryId: r.memory_id, localUri: r.local_uri, remotePath: r.remote_path, width: r.width,
  height: r.height, mimeType: r.mime_type, position: r.position, createdAt: r.created_at,
  updatedAt: r.updated_at, deletedAt: r.deleted_at,
});
const toAlbum = (r: Row): Album => ({
  id: r.id, vaultId: r.vault_id, title: r.title, description: r.description, kind: r.kind,
  coverAssetId: r.cover_asset_id, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at,
});
const toBook = (r: Row): KeepsakeBook => ({
  id: r.id, vaultId: r.vault_id, albumId: r.album_id, title: r.title, subtitle: r.subtitle,
  trimSize: r.trim_size, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at,
});
const toPage = (r: Row): BookPage => ({
  id: r.id, bookId: r.book_id, position: r.position, layout: r.layout, assetIds: JSON.parse(r.asset_ids),
  heading: r.heading, body: r.body, createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at,
});

export class SQLiteRepository implements Repository {
  private vaultId: ID = '';
  constructor(private db: SQLiteDatabase) {}

  async init() {
    const { user_version } = (await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version')) ?? { user_version: 0 };
    for (let v = user_version; v < migrations.length; v++) {
      await this.db.withTransactionAsync(async () => {
        await this.db.execAsync(migrations[v]);
        await this.db.execAsync(`PRAGMA user_version = ${v + 1}`);
      });
    }
    await this.db.execAsync('PRAGMA foreign_keys = ON');
    const vault = await this.db.getFirstAsync<Row>('SELECT id FROM vaults WHERE deleted_at IS NULL LIMIT 1');
    if (vault) {
      this.vaultId = vault.id;
    } else {
      this.vaultId = newId();
      const t = now();
      await this.db.runAsync('INSERT INTO vaults (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)', this.vaultId, 'Our Family', t, t);
    }
  }

  private async mediaFor(memoryIds: ID[]): Promise<Map<ID, MediaAsset[]>> {
    const map = new Map<ID, MediaAsset[]>();
    if (!memoryIds.length) return map;
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM media_assets WHERE deleted_at IS NULL AND memory_id IN (${memoryIds.map(() => '?').join(',')}) ORDER BY position`,
      ...memoryIds,
    );
    for (const r of rows) {
      const a = toAsset(r);
      map.set(a.memoryId, [...(map.get(a.memoryId) ?? []), a]);
    }
    return map;
  }

  private async hydrate(rows: Row[]): Promise<MemoryWithMedia[]> {
    const media = await this.mediaFor(rows.map((r) => r.id));
    return rows.map((r) => ({ ...toMemory(r), media: media.get(r.id) ?? [] }));
  }

  async listMemories() {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM memories WHERE vault_id = ? AND deleted_at IS NULL
       ORDER BY COALESCE(occurred_on, substr(created_at, 1, 10)) DESC, created_at DESC`,
      this.vaultId,
    );
    return this.hydrate(rows);
  }

  async getMemory(id: ID) {
    const row = await this.db.getFirstAsync<Row>('SELECT * FROM memories WHERE id = ? AND deleted_at IS NULL', id);
    return row ? (await this.hydrate([row]))[0] : null;
  }

  async createMemory(input: NewMemory, albumId?: ID | null) {
    const id = newId();
    const t = now();
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        'INSERT INTO memories (id, vault_id, title, story, occurred_on, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        id, this.vaultId, input.title, input.story, input.occurredOn, input.location, t, t,
      );
      for (const [i, p] of input.photos.entries()) {
        await this.db.runAsync(
          'INSERT INTO media_assets (id, memory_id, local_uri, width, height, mime_type, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          newId(), id, p.uri, p.width, p.height, p.mimeType, i, t, t,
        );
      }
      if (albumId) await this.addToAlbum(albumId, id);
    });
    return id;
  }

  async deleteMemory(id: ID) {
    const t = now();
    await this.db.runAsync('UPDATE memories SET deleted_at = ?, updated_at = ? WHERE id = ?', t, t, id);
  }

  async listAlbums(): Promise<AlbumSummary[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT a.*,
        (SELECT COUNT(*) FROM album_memories am JOIN memories m ON m.id = am.memory_id
          WHERE am.album_id = a.id AND m.deleted_at IS NULL) AS memory_count,
        COALESCE(
          (SELECT local_uri FROM media_assets WHERE id = a.cover_asset_id),
          (SELECT ma.local_uri FROM album_memories am
             JOIN memories m ON m.id = am.memory_id AND m.deleted_at IS NULL
             JOIN media_assets ma ON ma.memory_id = am.memory_id AND ma.deleted_at IS NULL
           WHERE am.album_id = a.id ORDER BY am.position, ma.position LIMIT 1)
        ) AS cover_uri
       FROM albums a WHERE a.vault_id = ? AND a.deleted_at IS NULL ORDER BY a.updated_at DESC`,
      this.vaultId,
    );
    return rows.map((r) => ({ ...toAlbum(r), memoryCount: r.memory_count, coverUri: r.cover_uri }));
  }

  async getAlbum(id: ID) {
    const row = await this.db.getFirstAsync<Row>('SELECT * FROM albums WHERE id = ? AND deleted_at IS NULL', id);
    if (!row) return null;
    const mems = await this.db.getAllAsync<Row>(
      `SELECT m.* FROM album_memories am JOIN memories m ON m.id = am.memory_id
       WHERE am.album_id = ? AND m.deleted_at IS NULL ORDER BY am.position`,
      id,
    );
    return { ...toAlbum(row), memories: await this.hydrate(mems) };
  }

  async createAlbum(title: string, description: string | null = null) {
    const id = newId();
    const t = now();
    await this.db.runAsync(
      'INSERT INTO albums (id, vault_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      id, this.vaultId, title, description, t, t,
    );
    return id;
  }

  async addToAlbum(albumId: ID, memoryId: ID) {
    const next = await this.db.getFirstAsync<{ p: number }>(
      'SELECT COALESCE(MAX(position) + 1, 0) AS p FROM album_memories WHERE album_id = ?', albumId,
    );
    await this.db.runAsync(
      'INSERT OR IGNORE INTO album_memories (album_id, memory_id, position) VALUES (?, ?, ?)', albumId, memoryId, next?.p ?? 0,
    );
    await this.db.runAsync('UPDATE albums SET updated_at = ? WHERE id = ?', now(), albumId);
  }

  async listBooks() {
    const rows = await this.db.getAllAsync<Row>(
      'SELECT * FROM books WHERE vault_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC', this.vaultId,
    );
    return rows.map(toBook);
  }

  async getBook(id: ID): Promise<BookWithPages | null> {
    const row = await this.db.getFirstAsync<Row>('SELECT * FROM books WHERE id = ? AND deleted_at IS NULL', id);
    if (!row) return null;
    const pages = (await this.db.getAllAsync<Row>(
      'SELECT * FROM book_pages WHERE book_id = ? AND deleted_at IS NULL ORDER BY position', id,
    )).map(toPage);
    const assetIds = [...new Set(pages.flatMap((p) => p.assetIds))];
    const assets = assetIds.length
      ? await this.db.getAllAsync<Row>(`SELECT id, local_uri FROM media_assets WHERE id IN (${assetIds.map(() => '?').join(',')})`, ...assetIds)
      : [];
    const uri = new Map(assets.map((a) => [a.id as string, a.local_uri as string]));
    return {
      ...toBook(row),
      pages: pages.map((p) => ({ ...p, uris: p.assetIds.map((a) => uri.get(a)).filter((u): u is string => !!u) })),
    };
  }

  async createBookFromAlbum(albumId: ID, trimSize: TrimSize) {
    const album = await this.getAlbum(albumId);
    if (!album) throw new Error('Album not found');
    const id = newId();
    const t = now();
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        'INSERT INTO books (id, vault_id, album_id, title, trim_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        id, this.vaultId, albumId, album.title, trimSize, t, t,
      );
      for (const [i, p] of autoLayout(album.title, album.memories).entries()) {
        await this.db.runAsync(
          'INSERT INTO book_pages (id, book_id, position, layout, asset_ids, heading, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          newId(), id, i, p.layout, JSON.stringify(p.assetIds), p.heading, p.body, t, t,
        );
      }
    });
    return id;
  }

  async markBookExported(id: ID) {
    await this.db.runAsync("UPDATE books SET status = 'exported', updated_at = ? WHERE id = ? AND status = 'draft'", now(), id);
  }

  async getStats(): Promise<VaultStats> {
    const r = await this.db.getFirstAsync<Row>(
      `SELECT
        (SELECT COUNT(*) FROM memories WHERE vault_id = $v AND deleted_at IS NULL) AS memory_count,
        (SELECT COUNT(*) FROM media_assets ma JOIN memories m ON m.id = ma.memory_id
          WHERE m.vault_id = $v AND m.deleted_at IS NULL AND ma.deleted_at IS NULL) AS photo_count,
        (SELECT COUNT(*) FROM albums WHERE vault_id = $v AND deleted_at IS NULL) AS album_count,
        (SELECT COUNT(*) FROM books WHERE vault_id = $v AND deleted_at IS NULL) AS book_count,
        (SELECT MIN(created_at) FROM memories WHERE vault_id = $v AND deleted_at IS NULL) AS first_at`,
      { $v: this.vaultId },
    );
    return {
      memoryCount: r?.memory_count ?? 0, photoCount: r?.photo_count ?? 0, albumCount: r?.album_count ?? 0,
      bookCount: r?.book_count ?? 0, firstMemoryAt: r?.first_at ?? null,
    };
  }

  async getSetting(key: string) {
    return (await this.db.getFirstAsync<Row>('SELECT value FROM settings WHERE key = ?', key))?.value ?? null;
  }

  async setSetting(key: string, value: string) {
    await this.db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
  }

  async logReferralEvent(kind: ReferralEventKind, surface: string) {
    await this.db.runAsync('INSERT INTO referral_events (id, kind, surface, created_at) VALUES (?, ?, ?, ?)', newId(), kind, surface, now());
  }

  async eraseEverything() {
    await this.db.execAsync(`
      DELETE FROM book_pages; DELETE FROM books; DELETE FROM album_memories; DELETE FROM albums;
      DELETE FROM memory_people; DELETE FROM media_assets; DELETE FROM memories; DELETE FROM people;
      DELETE FROM referral_events; DELETE FROM settings; DELETE FROM vaults;`);
    const media = new Directory(Paths.document, 'media');
    if (media.exists) media.delete();
    await this.init();
  }
}
