import * as ImagePicker from 'expo-image-picker';
import type { NewMemoryInput } from '@/data';
import { persistPhoto } from './persistPhoto';

type Picked = NonNullable<NewMemoryInput['photos']>;

/**
 * Uses the system photo picker (PHPicker on iOS, Android Photo Picker), which needs no
 * broad library permission. This keeps us clear of Google Play's photo/video permission
 * policy and Apple's limited-library prompts.
 */
export async function pickPhotos(limit = 20): Promise<Picked> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.9,
    exif: false, // strip location metadata by default; privacy first
  });
  if (result.canceled) return [];
  return result.assets.map((a) => ({
    uri: persistPhoto(a.uri),
    width: a.width ?? null,
    height: a.height ?? null,
    mimeType: a.mimeType ?? null,
  }));
}
