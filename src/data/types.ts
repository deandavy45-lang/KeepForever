import { z } from 'zod';

/**
 * Domain model. Every row carries sync columns (updatedAt, deletedAt) so the local
 * SQLite store can reconcile with the Supabase mirror later without a schema change.
 * Keep this file in step with sqlite/migrations.ts and supabase/migrations/*.sql.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISOTimestamp = string;

interface Syncable {
  id: ID;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  deletedAt: ISOTimestamp | null;
}

export interface Vault extends Syncable {
  name: string; // e.g. "The Davy Family"
}

export interface Person extends Syncable {
  vaultId: ID;
  displayName: string;
  relation: string | null;
  birthDate: ISODate | null;
}

export interface Memory extends Syncable {
  vaultId: ID;
  title: string;
  story: string;
  occurredOn: ISODate | null;
  location: string | null;
}

export interface MediaAsset extends Syncable {
  memoryId: ID;
  localUri: string;
  remotePath: string | null; // Supabase Storage key once uploaded
  width: number | null;
  height: number | null;
  mimeType: string | null;
  position: number;
}

export type AlbumKind = 'manual' | 'year' | 'person';

export interface Album extends Syncable {
  vaultId: ID;
  title: string;
  description: string | null;
  kind: AlbumKind;
  coverAssetId: ID | null;
}

export type TrimSize = 'square_8' | 'letter_portrait' | 'a4_portrait' | 'landscape_11x8_5';
export type BookStatus = 'draft' | 'exported' | 'ordered';
export type PageLayout = 'cover' | 'full_bleed' | 'photo_caption' | 'two_up' | 'grid_four' | 'story' | 'back_cover';

export interface KeepsakeBook extends Syncable {
  vaultId: ID;
  albumId: ID | null;
  title: string;
  /** Cover line for family names, e.g. "The Davy Family · 1998–2024". */
  subtitle: string | null;
  /** Printed on the spine by the bindery. User text only, never brand text. */
  spineText: string | null;
  /** Optional family crest/emblem image shown on the front cover. */
  emblemUri: string | null;
  trimSize: TrimSize;
  status: BookStatus;
}

/** User-editable cover fields. Covers and spines carry zero Keep Forever branding. */
export interface BookCoverPatch {
  title?: string;
  subtitle?: string | null;
  spineText?: string | null;
  emblemUri?: string | null;
  coverAssetId?: ID | null;
}

export interface BookPage extends Syncable {
  bookId: ID;
  position: number;
  layout: PageLayout;
  assetIds: ID[];
  heading: string | null;
  body: string | null;
}

export type ReferralEventKind = 'impression' | 'open' | 'dismiss' | 'opt_out';

/** Read models used by screens. */
export interface MemoryWithMedia extends Memory {
  media: MediaAsset[];
}
export interface AlbumSummary extends Album {
  memoryCount: number;
  coverUri: string | null;
}
export interface BookWithPages extends KeepsakeBook {
  pages: (BookPage & { uris: string[] })[];
}
export interface VaultStats {
  memoryCount: number;
  photoCount: number;
  albumCount: number;
  bookCount: number;
  firstMemoryAt: ISOTimestamp | null;
}

export const newMemorySchema = z.object({
  title: z.string().trim().min(1, 'Give this memory a title').max(120),
  story: z.string().max(10_000).default(''),
  occurredOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .nullable()
    .default(null),
  location: z.string().max(200).nullable().default(null),
  photos: z
    .array(
      z.object({
        uri: z.string(),
        width: z.number().nullable(),
        height: z.number().nullable(),
        mimeType: z.string().nullable(),
      }),
    )
    .default([]),
});
export type NewMemoryInput = z.input<typeof newMemorySchema>;
export type NewMemory = z.output<typeof newMemorySchema>;
