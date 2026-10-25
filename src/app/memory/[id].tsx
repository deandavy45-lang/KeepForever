import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { Button, EmptyState, Photo, Screen, Text } from '@/core/ui';
import { useMutation, useQuery } from '@/data';
import { formatDate } from '@/features/memories/format';

export default function MemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: memory, loading } = useQuery((repo) => repo.getMemory(id), [id]);
  const remove = useMutation((repo) => repo.deleteMemory(id));

  if (loading) return <Screen>{null}</Screen>;
  if (!memory) return <Screen><EmptyState title="Memory not found" body="It may have been deleted." /></Screen>;

  const onDelete = () => {
    const go = async () => {
      await remove.run();
      router.back();
    };
    if (Platform.OS === 'web') return window.confirm('Delete this memory?') && go();
    Alert.alert('Delete this memory?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: memory.title }} />
      <Text variant="display">{memory.title}</Text>
      <Text muted>{[formatDate(memory.occurredOn), memory.location].filter(Boolean).join(' · ')}</Text>
      {memory.media.map((m) => (
        <Photo key={m.id} uri={m.localUri} aspectRatio={m.width && m.height ? m.width / m.height : 4 / 3} />
      ))}
      {memory.story ? <Text>{memory.story}</Text> : null}
      <Button label="Delete memory" tone="ghost" onPress={onDelete} />
    </Screen>
  );
}
