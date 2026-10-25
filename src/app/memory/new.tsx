import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { space, useColors } from '@/core/theme';
import { Button, PhotoGrid, Screen, Text, TextField } from '@/core/ui';
import { newMemorySchema, useMutation, type NewMemoryInput } from '@/data';
import { pickPhotos } from '@/features/memories/pickPhotos';

export default function NewMemoryScreen() {
  const c = useColors();
  const { albumId } = useLocalSearchParams<{ albumId?: string }>();
  const [form, setForm] = useState({ title: '', story: '', occurredOn: '', location: '' });
  const [photos, setPhotos] = useState<NonNullable<NewMemoryInput['photos']>>([]);
  const [error, setError] = useState<string | null>(null);
  const save = useMutation((repo, input: NewMemoryInput) => repo.createMemory(newMemorySchema.parse(input), albumId ?? null));
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSave() {
    const input = {
      title: form.title,
      story: form.story,
      occurredOn: form.occurredOn || null,
      location: form.location || null,
      photos,
    };
    const parsed = newMemorySchema.safeParse(input);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Check the form');
    await save.run(input);
    router.back();
  }

  return (
    <Screen contentStyle={{ gap: space.lg }}>
      <Button label={photos.length ? `Add more photos (${photos.length})` : 'Choose photos'} tone="secondary" onPress={async () => setPhotos([...photos, ...(await pickPhotos())])} />
      {photos.length ? <PhotoGrid uris={photos.map((p) => p.uri)} /> : null}
      <TextField label="Title" value={form.title} onChangeText={set('title')} placeholder="First swim off the dock" />
      <TextField label="The story" value={form.story} onChangeText={set('story')} multiline placeholder="Who was there? What do you want to remember?" />
      <TextField label="When (YYYY-MM-DD)" value={form.occurredOn} onChangeText={set('occurredOn')} placeholder="1998-07-14" keyboardType="numbers-and-punctuation" />
      <TextField label="Where" value={form.location} onChangeText={set('location')} placeholder="Lake Wanaka" />
      {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
      <Button label="Save memory" onPress={onSave} loading={save.pending} />
    </Screen>
  );
}
