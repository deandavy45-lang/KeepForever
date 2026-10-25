import { Image } from 'expo-image';
import { View, type ViewStyle } from 'react-native';
import { radius, useColors } from '@/core/theme';

/** Single photo with a placeholder tint while loading. Uses expo-image for disk caching. */
export function Photo({
  uri,
  aspectRatio = 1,
  style,
  label,
}: {
  uri?: string | null;
  aspectRatio?: number;
  style?: ViewStyle;
  label?: string;
}) {
  const c = useColors();
  return (
    <View
      style={[{ aspectRatio, borderRadius: radius.md, overflow: 'hidden', backgroundColor: c.surfaceAlt }, style]}
      accessible={Boolean(label)}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {uri ? (
        <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" transition={150} />
      ) : null}
    </View>
  );
}
