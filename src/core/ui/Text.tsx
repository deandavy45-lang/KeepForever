import { Text as RNText, type TextProps } from 'react-native';
import { type, useColors } from '@/core/theme';

type Variant = keyof typeof type;

export function Text({
  variant = 'body',
  muted,
  style,
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean }) {
  const c = useColors();
  return (
    <RNText
      {...rest}
      style={[type[variant], { color: muted ? c.inkMuted : c.ink }, style]}
      maxFontSizeMultiplier={1.8}
    />
  );
}
