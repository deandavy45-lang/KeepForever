import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Card, Photo, Text } from '@/core/ui';
import { radius, space, useColors } from '@/core/theme';
import type { MemoryWithMedia } from '@/data';
import { formatDate } from './format';

export function MemoryCard({ memory }: { memory: MemoryWithMedia }) {
  const c = useColors();
  const cover = memory.media[0]?.localUri;
  const count = memory.media.length;
  const date = formatDate(memory.occurredOn);

  return (
    <Card
      style={{ gap: space.md }}
      onPress={() => router.push({ pathname: '/memory/[id]', params: { id: memory.id } })}
      accessibilityLabel={[memory.title, date, count > 1 ? `${count} photos` : null].filter(Boolean).join(', ')}
    >
      {cover ? (
        <View>
          <Photo uri={cover} aspectRatio={3 / 2} />
          {count > 1 ? (
            <View
              style={{
                position: 'absolute',
                right: space.sm,
                bottom: space.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.xs,
                paddingHorizontal: space.sm,
                paddingVertical: 4,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(23,20,18,0.62)',
              }}
            >
              <Ionicons name="images-outline" size={13} color="#FFFFFF" />
              <Text variant="label" style={{ color: '#FFFFFF', letterSpacing: 0.2 }}>
                {count}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ gap: space.xs }}>
        <Text variant="label" style={{ color: c.accent }}>
          {date.toUpperCase()}
        </Text>
        <Text variant="title" style={{ fontSize: 20, lineHeight: 26 }}>
          {memory.title}
        </Text>
        {memory.location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            <Ionicons name="location-outline" size={13} color={c.inkMuted} />
            <Text variant="caption" muted>
              {memory.location}
            </Text>
          </View>
        ) : null}
        {memory.story ? (
          <Text numberOfLines={2} muted style={{ marginTop: space.xs }}>
            {memory.story}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}