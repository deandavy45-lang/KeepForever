import { router } from 'expo-router';
import { View } from 'react-native';
import { space } from '@/core/theme';
import { Button, EmptyState, Screen, SectionHeader, Text } from '@/core/ui';
import { useQuery } from '@/data';
import { KeepCard } from '@/features/keep-referral';
import { MemoryCard } from '@/features/memories/MemoryCard';
import { groupByYear } from '@/features/memories/format';

export default function TimelineScreen() {
  const { data: memories, loading } = useQuery((repo) => repo.listMemories());
  if (loading) return <Screen>{null}</Screen>;

  if (!memories?.length) {
    return (
      <Screen>
        <EmptyState
          title="Start your family vault"
          body="Add a photo and the story behind it. Everything stays on this device unless you turn on backup."
          actionLabel="Add your first memory"
          onAction={() => router.push('/memory/new')}
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ gap: space.xl }}>
      <Button label="Add a memory" onPress={() => router.push('/memory/new')} />
      <KeepCard surface="timeline_card" />
      {groupByYear(memories).map(({ year, data }) => (
        <View key={year} style={{ gap: space.lg }}>
          <SectionHeader eyebrow={`${data.length} ${data.length === 1 ? 'memory' : 'memories'}`} title={year} />
          {data.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </View>
      ))}
      <Text variant="caption" muted style={{ textAlign: 'center', paddingTop: space.md }}>
        That's everything so far.
      </Text>
    </Screen>
  );
}