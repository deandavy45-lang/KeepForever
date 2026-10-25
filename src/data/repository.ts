import type {
  Album,
  BookCoverPatch,
  AlbumSummary,
  BookWithPages,
  ID,
  KeepsakeBook,
  MemoryWithMedia,
  NewMemory,
  ReferralEventKind,
  TrimSize,
  VaultStats,
} from './types';

/**
 * The one contract every storage backend implements. Screens and features depend on this
 * interface only, so SQLite (native), the in-browser preview store, and a future
 * remote-first backend are interchangeable.
 */
export interface Repository {
  init(): Promise<void>;

  listMemories(): Promise<MemoryWithMedia[]>;
  getMemory(id: ID): Promise<MemoryWithMedia | null>;
  createMemory(input: NewMemory, albumId?: ID | null): Promise<ID>;
  deleteMemory(id: ID): Promise<void>;

  listAlbums(): Promise<AlbumSummary[]>;
  getAlbum(id: ID): Promise<(Album & { memories: MemoryWithMedia[] }) | null>;
  createAlbum(title: string, description?: string | null): Promise<ID>;
  addToAlbum(albumId: ID, memoryId: ID): Promise<void>;

  listBooks(): Promise<KeepsakeBook[]>;
  getBook(id: ID): Promise<BookWithPages | null>;
  /** Builds a draft book with an auto-generated layout from an album's memories. */
  createBookFromAlbum(albumId: ID, trimSize: TrimSize): Promise<ID>;
  markBookExported(id: ID): Promise<void>;
  /** Title, family-name line, spine text, emblem, and cover photo. */
  updateBookCover(id: ID, patch: BookCoverPatch): Promise<void>;

  getStats(): Promise<VaultStats>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  logReferralEvent(kind: ReferralEventKind, surface: string): Promise<void>;

  /** Permanently erases all local data. Required for in-app account deletion (App Store 5.1.1(v)). */
  eraseEverything(): Promise<void>;
}
