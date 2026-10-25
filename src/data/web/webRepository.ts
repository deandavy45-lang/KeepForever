import { newId, now } from '../ids';
import { autoLayout } from '../layout';
import type { Repository } from '../repository';
import type {
  Album,
  BookCoverPatch,
  BookPage,
  ID,
  KeepsakeBook,
  MediaAsset,
  Memory,
  MemoryWithMedia,
  NewMemory,
  ReferralEventKind,
  TrimSize,
} from '../types';
import { seed } from './seed';

/**
 * Browser preview backend. Same contract as SQLiteRepository, backed by plain arrays
 * persisted to localStorage, so `npx expo start --web` runs with no native modules.
 * Not for production: web is a preview/marketing surface only.
 */
interface State {
  vaultId: ID;
  memories: Memory[];
  media: MediaAsset[];
  albums: Album[];
  albumMemories: { albumId: ID; memoryId: ID; position: number }[];
  books: KeepsakeBook[];
  pages: BookPage[];
  settings: Record<string, string>;
  referralEvents: { id: ID; kind: ReferralEventKind; surface: string; createdAt: string }[];
}

const KEY = 'keepforever.preview.v2';
const live = <T extends { deletedAt: string | null }>(xs: T[]) => xs.filter((x) => !x.deletedAt);

export class WebRepository implements Repository {
  private s!: State;

  async init() {
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      if (raw) this.s = JSON.parse(raw);
    } catch {}
    if (!this.s) {
      this.s = { vaultId: newId(), memories: [], media: [], albums: [], albumMemories: [], books: [], pages: [], settings: {}, referralEvents: [] };
      await seed(this);
    }
  }

  private save() {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(this.s));
    } catch {}
  }

  private withMedia = (m: Memory): MemoryWithMedia => ({
    ...m,
    media: live(this.s.media).filter((a) => a.memoryId === m.id).sort((a, b) => a.position - b.position),
  });

  async listMemories() {
    return live(this.s.memories)
      .sort((a, b) => (b.occurredOn ?? b.createdAt).localeCompare(a.occurredOn ?? a.createdAt))
      .map(this.withMedia);
  }

  async getMemory(id: ID) {
    const m = live(this.s.memories).find((x) => x.id === id);
    return m ? this.withMedia(m) : null;
  }

  async createMemory(input: NewMemory, albumId?: ID | null) {
    const t = now();
    const id = newId();
    this.s.memories.push({ id, vaultId: this.s.vaultId, title: input.title, story: input.story, occurredOn: input.occurredOn, location: input.location, createdAt: t, updatedAt: t, deletedAt: null });
    input.photos.forEach((p, i) =>
      this.s.media.push({ id: newId(), memoryId: id, localUri: p.uri, remotePath: null, width: p.width, height: p.height, mimeType: p.mimeType, position: i, createdAt: t, updatedAt: t, deletedAt: null }),
    );
    if (albumId) await this.addToAlbum(albumId, id);
    this.save();
    return id;
  }

  async deleteMemory(id: ID) {
    const m = this.s.memories.find((x) => x.id === id);
    if (m) m.deletedAt = m.updatedAt = now();
    this.save();
  }

  private albumMemories(albumId: ID) {
    const ids = this.s.albumMemories.filter((x) => x.albumId === albumId).sort((a, b) => a.position - b.position).map((x) => x.memoryId);
    return ids.map((id) => live(this.s.memories).find((m) => m.id === id)).filter((m): m is Memory => !!m).map(this.withMedia);
  }

  async listAlbums() {
    return live(this.s.albums)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((a) => {
        const mems = this.albumMemories(a.id);
        return { ...a, memoryCount: mems.length, coverUri: mems.flatMap((m) => m.media)[0]?.localUri ?? null };
      });
  }

  async getAlbum(id: ID) {
    const a = live(this.s.albums).find((x) => x.id === id);
    return a ? { ...a, memories: this.albumMemories(id) } : null;
  }

  async createAlbum(title: string, description: string | null = null) {
    const t = now();
    const id = newId();
    this.s.albums.push({ id, vaultId: this.s.vaultId, title, description, kind: 'manual', coverAssetId: null, createdAt: t, updatedAt: t, deletedAt: null });
    this.save();
    return id;
  }

  async addToAlbum(albumId: ID, memoryId: ID) {
    if (this.s.albumMemories.some((x) => x.albumId === albumId && x.memoryId === memoryId)) return;
    const position = this.s.albumMemories.filter((x) => x.albumId === albumId).length;
    this.s.albumMemories.push({ albumId, memoryId, position });
    const a = this.s.albums.find((x) => x.id === albumId);
    if (a) a.updatedAt = now();
    this.save();
  }

  async listBooks() {
    return live(this.s.books).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getBook(id: ID) {
    const b = live(this.s.books).find((x) => x.id === id);
    if (!b) return null;
    const uri = new Map(this.s.media.map((a) => [a.id, a.localUri]));
    const pages = live(this.s.pages).filter((p) => p.bookId === id).sort((a, b) => a.position - b.position);
    return { ...b, pages: pages.map((p) => ({ ...p, uris: p.assetIds.map((a) => uri.get(a)).filter((u): u is string => !!u) })) };
  }

  async createBookFromAlbum(albumId: ID, trimSize: TrimSize) {
    const album = await this.getAlbum(albumId);
    if (!album) throw new Error('Album not found');
    const t = now();
    const id = newId();
    this.s.books.push({ id, vaultId: this.s.vaultId, albumId, title: album.title, subtitle: null, spineText: null, emblemUri: null, trimSize, status: 'draft', createdAt: t, updatedAt: t, deletedAt: null });
    autoLayout(album.title, album.memories).forEach((p, i) =>
      this.s.pages.push({ ...p, id: newId(), bookId: id, position: i, createdAt: t, updatedAt: t, deletedAt: null }),
    );
    this.save();
    return id;
  }

  async markBookExported(id: ID) {
    const b = this.s.books.find((x) => x.id === id);
    if (b && b.status === 'draft') {
      b.status = 'exported';
      b.updatedAt = now();
    }
    this.save();
  }

  async updateBookCover(id: ID, patch: BookCoverPatch) {
    const b = this.s.books.find((x) => x.id === id);
    if (!b) return;
    const { coverAssetId, ...fields } = patch;
    Object.assign(b, fields, { updatedAt: now() });
    if (coverAssetId !== undefined) {
      const cover = this.s.pages.find((p) => p.bookId === id && p.layout === 'cover');
      if (cover) cover.assetIds = coverAssetId ? [coverAssetId] : [];
    }
    this.save();
  }

  async getStats() {
    const mems = live(this.s.memories);
    const memIds = new Set(mems.map((m) => m.id));
    return {
      memoryCount: mems.length,
      photoCount: live(this.s.media).filter((a) => memIds.has(a.memoryId)).length,
      albumCount: live(this.s.albums).length,
      bookCount: live(this.s.books).length,
      firstMemoryAt: mems.map((m) => m.createdAt).sort()[0] ?? null,
    };
  }

  async getSetting(key: string) {
    return this.s.settings[key] ?? null;
  }

  async setSetting(key: string, value: string) {
    this.s.settings[key] = value;
    this.save();
  }

  async logReferralEvent(kind: ReferralEventKind, surface: string) {
    this.s.referralEvents.push({ id: newId(), kind, surface, createdAt: now() });
    this.save();
  }

  async eraseEverything() {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {}
    this.s = undefined as unknown as State;
    await this.init();
  }
}
