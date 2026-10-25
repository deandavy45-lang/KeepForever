import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { features } from '@/core/config/features';
import { radius, space, useColors } from '@/core/theme';
import { Button, Card, Photo, Screen, Text } from '@/core/ui';
import { useMutation, useQuery, type BookWithPages } from '@/data';
import { exportBookPdf } from '@/features/books/exportBook';
import { trimSizes } from '@/features/books/trimSizes';
import { KeepCard } from '@/features/keep-referral';

type Page = BookWithPages['pages'][number];

function PagePreview({ page, aspect }: { page: Page; aspect: number }) {
  const c = useColors();
  const cols = page.layout === 'grid_four' || page.layout === 'two_up' ? 2 : 1;
  return (
    <View
      style={{ aspectRatio: aspect, backgroundColor: c.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: c.line, padding: page.layout === 'cover' || page.layout === 'full_bleed' ? 0 : space.md, gap: space.sm, overflow: 'hidden' }}
      accessibilityLabel={`Page ${page.position + 1}, ${page.layout.replace('_', ' ')}`}
    >
      {page.heading && page.layout !== 'cover' ? <Text variant="heading">{page.heading}</Text> : null}
      <View style={{ flex: 1, minHeight: 0, flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, overflow: 'hidden' }}>
        {page.uris.map((u) => (
          <Photo
            key={u}
            uri={u}
            style={{ width: cols === 2 ? '47%' : '100%', height: page.uris.length > 2 ? '47%' : '100%', aspectRatio: undefined }}
          />
        ))}
      </View>
      {page.layout === 'cover' ? (
        <Text variant="title" style={{ position: 'absolute', bottom: space.lg, left: 0, right: 0, textAlign: 'center', color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 8 }}>
          {page.heading}
        </Text>
      ) : page.body ? (
        <Text variant="caption" numberOfLines={3}>{page.body}</Text>
      ) : null}
    </View>
  );
}

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: book } = useQuery((repo) => repo.getBook(id), [id]);
  const markExported = useMutation((repo) => repo.markBookExported(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!book) return <Screen>{null}</Screen>;

  const t = trimSizes[book.trimSize];
  const onExport = async () => {
    setBusy(true);
    setError(null);
    try {
      await exportBookPdf(book, { bleed: true });
      await markExported.run();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text variant="display">{book.title}</Text>
      <Text muted>
        {t.label} · {book.pages.length} pages · includes 0.125 in print bleed
      </Text>
      <Button label="Export print-ready PDF" onPress={onExport} loading={busy} accessibilityHint="Creates a PDF you can send to any print shop" />
      {features.printOrdering ? <Button label="Order a bound copy" tone="secondary" onPress={() => {}} /> : (
        <Text variant="caption" muted>Bound copies delivered to your door are coming soon. For now, any local printer can use the PDF.</Text>
      )}
      {error ? <Text>{error}</Text> : null}
      {book.status !== 'draft' ? <KeepCard surface="book_export" /> : null}
      <Card>
        <Text variant="label" muted>PAGES</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {book.pages.map((p) => (
            <View key={p.id} style={{ width: '46%' }}>
              <PagePreview page={p} aspect={t.widthIn / t.heightIn} />
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
