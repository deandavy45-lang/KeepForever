import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import type { ComponentProps } from 'react';
import { Platform, Text as RNText, useWindowDimensions, type ColorValue } from 'react-native';
import { radius, space, type as typeScale, useColors } from '@/core/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Filled icon when active, outline when inactive, so state never relies on color alone. */
const icon =
  (active: IconName, inactive: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color as string} size={size} />
  );

/** Bolder label when active; same size so nothing shifts between states. */
const label = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => (
  <RNText
    numberOfLines={1}
    style={{ color, fontSize: 12, lineHeight: 16, fontWeight: focused ? '700' : '500', letterSpacing: 0.3 }}
  >
    {children}
  </RNText>
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
        tabBarInactiveTintColor: c.inkMuted,
        tabBarActiveBackgroundColor: c.accentSoft,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.line,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 72 : undefined,
          paddingTop: space.sm,
          paddingHorizontal: sidePad,
          elevation: 10,
          shadowColor: '#2B2622',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarItemStyle: {
          marginHorizontal: space.xs,
          marginBottom: space.xs,
          borderRadius: radius.md,
          paddingVertical: space.xs,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIconStyle: { marginBottom: 2 },
        headerStyle: { backgroundColor: c.bg },
        headerTitleStyle: { ...typeScale.title, color: c.ink },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Timeline', tabBarIcon: icon('time', 'time-outline'), tabBarLabel: label }} />
      <Tabs.Screen name="albums" options={{ title: 'Albums', tabBarIcon: icon('albums', 'albums-outline'), tabBarLabel: label }} />
      <Tabs.Screen name="books" options={{ title: 'Books', tabBarIcon: icon('book', 'book-outline'), tabBarLabel: label }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings', 'settings-outline'), tabBarLabel: label }} />
    </Tabs>
  );
}