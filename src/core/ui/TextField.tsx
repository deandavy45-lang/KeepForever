import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { hitTarget, radius, space, type as typeScale, useColors } from '@/core/theme';
import { Text } from './Text';

export function TextField({ label, multiline, ...rest }: TextInputProps & { label: string }) {
  const c = useColors();
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="label" muted>
        {label.toUpperCase()}
      </Text>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor={c.inkMuted}
        style={[
          styles.input,
          typeScale.body,
          { color: c.ink, backgroundColor: c.surface, borderColor: c.line },
          multiline && { minHeight: 120, textAlignVertical: 'top' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: hitTarget, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm },
});
