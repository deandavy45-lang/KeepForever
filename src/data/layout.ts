import type { BookPage, MediaAsset, MemoryWithMedia, PageLayout } from './types';

type DraftPage = Pick<BookPage, 'layout' | 'assetIds' | 'heading' | 'body'>;

/**
 * Turns a list of memories into a sensible first draft of book pages.
 * Pure function so it is shared by every repository and easy to unit test.
 */
export function autoLayout(title: string, memories: MemoryWithMedia[]): DraftPage[] {
  const pages: DraftPage[] = [];
  const firstPhoto = memories.flatMap((m) => m.media)[0];
  pages.push({ layout: 'cover', assetIds: firstPhoto ? [firstPhoto.id] : [], heading: title, body: null });

  const chronological = [...memories].sort((a, b) =>
    (a.occurredOn ?? a.createdAt).localeCompare(b.occurredOn ?? b.createdAt),
  );

  for (const m of chronological) {
    const ids = m.media.map((a: MediaAsset) => a.id);
    const layout: PageLayout =
      ids.length === 0 ? 'story' : ids.length === 1 ? (m.story ? 'photo_caption' : 'full_bleed') : ids.length < 4 ? 'two_up' : 'grid_four';
    const perPage = layout === 'grid_four' ? 4 : layout === 'two_up' ? 2 : 1;
    const chunks = ids.length ? chunk(ids, perPage) : [[]];
    chunks.forEach((assetIds, i) =>
      pages.push({
        layout: i === 0 ? layout : assetIds.length >= 3 ? 'grid_four' : assetIds.length === 2 ? 'two_up' : 'full_bleed',
        assetIds,
        heading: i === 0 ? m.title : null,
        body: i === 0 ? m.story || null : null,
      }),
    );
  }
  // Back cover is the only place the Keep Forever hallmark may appear (see features/books/brand.ts).
  pages.push({ layout: 'back_cover', assetIds: [], heading: null, body: null });
  return pages;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
