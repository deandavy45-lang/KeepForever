import { router } from 'expo-router';
import { Card, EmptyState, Screen, Text } from '@/core/ui';
import { useQuery } from '@/data';
import { trimSizes } from '@/features/books/trimSizes';

const statusLabel = { draft: 'Draft', exported: 'PDF exported', ordered: 'Ordered' } as const;

export default function BooksScreen() {
  const { data: books } = useQuery((repo) => repo.listBooks());
  return (
    <Screen>
      {books && !books.length ? (
        <EmptyState
          title="Make a keepsake book"
          body="Open any album and tap “Make a book”. We'll lay out the pages; you export a print-ready PDF."
          actionLabel="Go to albums"
          onAction={() => router.push('/albums')}
        />
      ) : null}
      {books?.map((b) => (
        <Card key={b.id} onPress={() => router.push({ pathname: '/book/[id]', params: { id: b.id } })} accessibilityLabel={b.title}>
          <Text variant="heading">{b.title}</Text>
          <Text variant="caption" muted>
            {trimSizes[b.trimSize].label} · {statusLabel[b.status]}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}
