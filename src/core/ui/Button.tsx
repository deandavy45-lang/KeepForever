import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { hitTarget, radius, space, useColors } from '@/core/theme';
import { Text } from './Text';

type Tone = 'primary' | 'secondary' | 'ghost' | 'legacy';

export function Button({
  label,
  onPress,
  tone = 'primary',
  loading,
  disabled,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  tone?: Tone;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const c = useColors();
  const bg = { primary: c.accent, secondary: c.surfaceAlt, ghost: 'transparent', legacy: c.legacy }[tone];
  const fg = { primary: c.accentInk, secondary: c.ink, ghost: c.accent, legacy: c.bg }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text variant="heading" style={{ color: fg }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: hitTarget,
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
