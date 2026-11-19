import { router } from 'expo-router';
import { View } from 'react-native';
import { Card, Photo, Text } from '@/core/ui';
import { space } from '@/core/theme';
import type { AlbumSummary } from '@/data';

export function AlbumTile({ album }: { album: AlbumSummary }) {
  const count = `${album.memoryCount} ${album.memoryCount === 1 ? 'memory' : 'memories'}`;
  return (
    <Card
      style={{ padding: space.sm, gap: space.sm }}
      onPress={() => router.push({ pathname: '/album/[id]', params: { id: album.id } })}
      accessibilityLabel={`${album.title}, ${count}`}
    >
      <Photo uri={album.coverUri} aspectRatio={1} />
      <View style={{ gap: 2, paddingHorizontal: space.xs, paddingBottom: space.xs }}>
        <Text variant="heading" numberOfLines={1}>
          {album.title}
        </Text>
        <Text variant="caption" muted>
          {count}
        </Text>
      </View>
    </Card>
  );
}