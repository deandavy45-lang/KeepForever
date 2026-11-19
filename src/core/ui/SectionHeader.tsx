import { View } from 'react-native';
import { space, useColors } from '@/core/theme';
import { Text } from './Text';

export function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  const c = useColors();
  return (
    <View style={{ gap: space.xs, paddingTop: space.sm }} accessibilityRole="header">
      {eyebrow ? (
        <Text variant="label" style={{ color: c.accent }}>
          {eyebrow.toUpperCase()}
        </Text>
      ) : null}
      <Text variant="display">{title}</Text>
      <View style={{ height: 2, width: 32, borderRadius: 1, backgroundColor: c.accent, marginTop: space.xs }} />
    </View>
  );
}