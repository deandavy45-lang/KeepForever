import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { radius, space, useColors } from '@/core/theme';
import { Button, Card, Photo, Text, TextField } from '@/core/ui';
import { useMutation, type BookWithPages } from '@/data';
import { pickPhotos } from '@/features/memories/pickPhotos';

/**
 * Front cover and spine are the family's own: title, family-name line, emblem, cover photo,
 * spine text. Nothing here adds brand marks (policy in ./brand.ts).
 */
export function CoverEditor({ book, onDone }: { book: BookWithPages; onDone: () => void }) {
  const c = useColors();
  const coverPage = book.pages.find((p) => p.layout === 'cover');
  const photos = book.pages
    .filter((p) => p.layout !== 'cover')
    .flatMap((p) => p.assetIds.map((id, i) => ({ id, uri: p.uris[i] })))
    .filter((x): x is { id: string; uri: string } => Boolean(x.uri));
  const unique = [...new Map(photos.map((p) => [p.id, p])).values()];

  const [title, setTitle] = useState(book.title);
  const [subtitle, setSubtitle] = useState(book.subtitle ?? '');
  const [spineText, setSpineText] = useState(book.spineText ?? '');
  const [emblemUri, setEmblemUri] = useState(book.emblemUri);
  const [coverAssetId, setCoverAssetId] = useState(coverPage?.assetIds[0] ?? null);
  const save = useMutation((repo) =>
    repo.updateBookCover(book.id, {
      title: title.trim() || book.title,
      subtitle: subtitle.trim() || null,
      spineText: spineText.trim() || null,
      emblemUri,
      coverAssetId,
    }),
  );

  return (
    <Card>
      <Text variant="heading">Design your cover</Text>
      <Text variant="caption" muted>
        The front cover and spine are yours alone. No logos, no branding.
      </Text>
      <TextField label="Title" value={title} onChangeText={setTitle} />
      <TextField label="Family name line" value={subtitle} onChangeText={setSubtitle} placeholder="The Davy Family · 1998–2024" />
      <TextField label="Spine text" value={spineText} onChangeText={setSpineText} placeholder="Davy · Summers at the Lake" />
      <Text variant="label" muted>COVER PHOTO</Text>
      <ScrollView horizontal contentContainerStyle={{ gap: space.sm }}>
        {unique.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setCoverAssetId(p.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: p.id === coverAssetId }}
            accessibilityLabel="Use as cover photo"
            style={{ width: 72, borderRadius: radius.md, borderWidth: 3, borderColor: p.id === coverAssetId ? c.accent : 'transparent' }}
          >
            <Photo uri={p.uri} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        {emblemUri ? <Photo uri={emblemUri} style={{ width: 56 }} label="Family emblem" /> : null}
        <View style={{ flex: 1 }}>
          <Button
            label={emblemUri ? 'Change emblem' : 'Add family emblem'}
            tone="secondary"
            onPress={async () => {
              const [picked] = await pickPhotos(1);
              if (picked) setEmblemUri(picked.uri);
            }}
          />
        </View>
        {emblemUri ? <Button label="Remove" tone="ghost" onPress={() => setEmblemUri(null)} /> : null}
      </View>
      <Button
        label="Save cover"
        loading={save.pending}
        onPress={async () => {
          await save.run();
          onDone();
        }}
      />
    </Card>
  );
}
