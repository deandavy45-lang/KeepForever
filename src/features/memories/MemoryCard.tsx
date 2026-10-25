import { router } from 'expo-router';
import { View } from 'react-native';
import { Card, Photo, Text } from '@/core/ui';
import { space } from '@/core/theme';
import type { MemoryWithMedia } from '@/data';
import { formatDate } from './format';

export function MemoryCard({ memory }: { memory: MemoryWithMedia }) {
  const cover = memory.media[0]?.localUri;
  const extra = memory.media.length - 1;
  return (
    <Card
      onPress={() => router.push({ pathname: '/memory/[id]', params: { id: memory.id } })}
      accessibilityLabel={`${memory.title}, ${formatDate(memory.occurredOn)}`}
    >
      {cover ? <Photo uri={cover} aspectRatio={4 / 3} /> : null}
      <View style={{ gap: space.xs }}>
        <Text variant="heading">{memory.title}</Text>
        <Text variant="caption" muted>
          {[formatDate(memory.occurredOn), memory.location, extra > 0 ? `+${extra} photos` : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        {memory.story ? (
          <Text numberOfLines={2} muted>
            {memory.story}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
