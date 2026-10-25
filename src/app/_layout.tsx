import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useColors, type as typeScale } from '@/core/theme';
import { RepositoryProvider } from '@/data';

function Splash() {
  const c = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.accent} />
    </View>
  );
}

function AppStack() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.accent,
        headerTitleStyle: { ...typeScale.heading, color: c.ink },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="memory/new" options={{ title: 'New memory', presentation: 'modal' }} />
      <Stack.Screen name="memory/[id]" options={{ title: '' }} />
      <Stack.Screen name="album/[id]" options={{ title: '' }} />
      <Stack.Screen name="book/[id]" options={{ title: 'Keepsake book' }} />
      <Stack.Screen name="legacy" options={{ title: 'The Keep', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <RepositoryProvider fallback={<Splash />}>
          <AppStack />
        </RepositoryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
