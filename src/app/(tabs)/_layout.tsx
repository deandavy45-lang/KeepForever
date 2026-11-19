import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import type { ComponentProps } from 'react';
import { Platform, useWindowDimensions, type ColorValue } from 'react-native';
import { radius, space, type as typeScale, useColors } from '@/core/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Filled icon when active, outline when inactive, so state never relies on color alone. */
const icon =
  (active: IconName, inactive: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color as string} size={size} />
  );

/** Keep in step with CONTENT_MAX_WIDTH in Screen.tsx. */
const CONTENT_MAX_WIDTH = 720;

export default function TabsLayout() {
  const c = useColors();
  const { width } = useWindowDimensions();

  // On wide desktop viewports, keep the tabs aligned with the content column.
  const sidePad = Platform.OS === 'web' ? Math.max(space.sm, (width - CONTENT_MAX_WIDTH) / 2) : space.sm;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.ink,
        tabBarActiveBackgroundColor: c.accentSoft,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.line,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 68 : undefined,
          paddingTop: space.sm,
          paddingHorizontal: sidePad,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarItemStyle: {
          marginHorizontal: space.xs,
          marginBottom: space.xs,
          borderRadius: radius.md,
          paddingVertical: space.xs,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
        tabBarIconStyle: { marginBottom: 0 },
        headerStyle: { backgroundColor: c.bg },
        headerTitleStyle: { ...typeScale.title, color: c.ink },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Timeline', tabBarIcon: icon('time', 'time-outline') }} />
      <Tabs.Screen name="albums" options={{ title: 'Albums', tabBarIcon: icon('albums', 'albums-outline') }} />
      <Tabs.Screen name="books" options={{ title: 'Books', tabBarIcon: icon('book', 'book-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings', 'settings-outline') }} />
    </Tabs>
  );
}