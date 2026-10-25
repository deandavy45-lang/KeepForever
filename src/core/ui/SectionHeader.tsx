import { View } from 'react-native';
import { space } from '@/core/theme';
import { Text } from './Text';

export function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View style={{ gap: space.xs }} accessibilityRole="header">
      {eyebrow ? (
        <Text variant="label" muted>
          {eyebrow.toUpperCase()}
        </Text>
      ) : null}
      <Text variant="title">{title}</Text>
    </View>
  );
}
