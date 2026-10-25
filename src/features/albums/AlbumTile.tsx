import { router } from 'expo-router';
import { Card, Photo, Text } from '@/core/ui';
import type { AlbumSummary } from '@/data';

export function AlbumTile({ album }: { album: AlbumSummary }) {
  return (
    <Card
      onPress={() => router.push({ pathname: '/album/[id]', params: { id: album.id } })}
      accessibilityLabel={`${album.title}, ${album.memoryCount} memories`}
    >
      <Photo uri={album.coverUri} aspectRatio={1} />
      <Text variant="heading" numberOfLines={1}>
        {album.title}
      </Text>
      <Text variant="caption" muted>
        {album.memoryCount} {album.memoryCount === 1 ? 'memory' : 'memories'}
      </Text>
    </Card>
  );
}
