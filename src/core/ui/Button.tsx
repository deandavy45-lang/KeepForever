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
  const border = { primary: 'transparent', secondary: c.line, ghost: 'transparent', legacy: 'transparent' }[tone];
  const lifted = tone === 'primary' || tone === 'legacy';
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
        { backgroundColor: bg, borderColor: border },
        lifted && styles.lifted,
        { opacity: disabled ? 0.5 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text variant="heading" style={{ color: fg, letterSpacing: 0.2 }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: hitTarget + 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifted: {
    shadowColor: '#A4553A',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});