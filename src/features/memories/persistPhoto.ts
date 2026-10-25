import { Directory, File, Paths } from 'expo-file-system';
import { newId } from '@/data/ids';

/**
 * Image picker results live in a cache folder the OS may purge. Copy each photo into the
 * app's document directory so the vault survives storage pressure and app updates.
 */
export function persistPhoto(uri: string): string {
  const dir = new Directory(Paths.document, 'media');
  dir.create({ idempotent: true, intermediates: true });
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = new File(dir, `${newId()}.${ext}`);
  new File(uri).copy(dest);
  return dest.uri;
}
