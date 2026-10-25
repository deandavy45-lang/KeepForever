import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { space } from '@/core/theme';
import { Button, Card, EmptyState, Screen, Text } from '@/core/ui';
import { useMutation, useQuery, type TrimSize } from '@/data';
import { trimSizes } from '@/features/books/trimSizes';
import { MemoryCard } from '@/features/memories/MemoryCard';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: album } = useQuery((repo) => repo.getAlbum(id), [id]);
  const [choosing, setChoosing] = useState(false);
  const makeBook = useMutation((repo, size: TrimSize) => repo.createBookFromAlbum(id, size));

  if (!album) return <Screen>{null}</Screen>;

  return (
    <Screen>
      <Stack.Screen options={{ title: album.title }} />
      <Text variant="display">{album.title}</Text>
      {album.description ? <Text muted>{album.description}</Text> : null}
      <View style={{ gap: space.sm }}>
        <Button label="Add a memory here" tone="secondary" onPress={() => router.push({ pathname: '/memory/new', params: { albumId: id } })} />
        {album.memories.length ? <Button label="Make a book" onPress={() => setChoosing((v) => !v)} /> : null}
      </View>
      {choosing ? (
        <Card>
          <Text variant="heading">Choose a size</Text>
          {(Object.keys(trimSizes) as TrimSize[]).map((size) => (
            <Button
              key={size}
              label={trimSizes[size].label}
              tone="ghost"
              loading={makeBook.pending}
              onPress={async () => {
                const bookId = await makeBook.run(size);
                router.push({ pathname: '/book/[id]', params: { id: bookId } });
              }}
            />
          ))}
        </Card>
      ) : null}
      {album.memories.length ? (
        album.memories.map((m) => <MemoryCard key={m.id} memory={m} />)
      ) : (
        <EmptyState title="This album is empty" body="Add a memory to get started." />
      )}
    </Screen>
  );
}
