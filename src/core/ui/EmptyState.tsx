import { StyleSheet, View } from 'react-native';
import { space } from '@/core/theme';
import { Button } from './Button';
import { Text } from './Text';

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text variant="title" style={styles.center}>
        {title}
      </Text>
      <Text muted style={styles.center}>
        {body}
      </Text>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: space.xxl * 2, paddingHorizontal: space.xl, gap: space.lg, alignItems: 'center' },
  center: { textAlign: 'center' },
});
