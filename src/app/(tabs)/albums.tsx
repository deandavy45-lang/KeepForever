import { useState } from 'react';
import { View } from 'react-native';
import { space } from '@/core/theme';
import { Button, Card, EmptyState, Screen, TextField } from '@/core/ui';
import { useMutation, useQuery } from '@/data';
import { AlbumTile } from '@/features/albums/AlbumTile';

export default function AlbumsScreen() {
  const { data: albums } = useQuery((repo) => repo.listAlbums());
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const create = useMutation((repo, t: string) => repo.createAlbum(t));

  const newAlbum = creating ? (
    <Card>
      <TextField label="Album name" value={title} onChangeText={setTitle} placeholder="Summers at the lake" autoFocus />
      <Button
        label="Create album"
        disabled={!title.trim()}
        loading={create.pending}
        onPress={async () => {
          await create.run(title.trim());
          setTitle('');
          setCreating(false);
        }}
      />
    </Card>
  ) : (
    <Button label="New album" tone="secondary" onPress={() => setCreating(true)} />
  );

  return (
    <Screen>
      {newAlbum}
      {albums && !albums.length && !creating ? (
        <EmptyState title="No albums yet" body="Group memories by trip, person, or season, then turn any album into a book." />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {albums?.map((a) => (
          <View key={a.id} style={{ width: '47%' }}>
            <AlbumTile album={a} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
