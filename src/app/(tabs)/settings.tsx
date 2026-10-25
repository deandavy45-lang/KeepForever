import { router } from 'expo-router';
import { Alert, Platform, Switch, View } from 'react-native';
import { isCloudSyncConfigured } from '@/core/config/env';
import { space, useColors } from '@/core/theme';
import { Button, Card, Screen, SectionHeader, Text } from '@/core/ui';
import { useMutation, useQuery } from '@/data';
import { useKeepReferral } from '@/features/keep-referral';

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete everything', style: 'destructive', onPress: onYes },
  ]);
}

export default function SettingsScreen() {
  const c = useColors();
  const { data: stats } = useQuery((repo) => repo.getStats());
  const keep = useKeepReferral('settings_row');
  const erase = useMutation((repo) => repo.eraseEverything());

  return (
    <Screen>
      <SectionHeader eyebrow="Your vault" title="Our Family" />
      <Card>
        <Text>
          {stats?.memoryCount ?? 0} {stats?.memoryCount === 1 ? 'memory' : 'memories'} · {stats?.photoCount ?? 0} photo{stats?.photoCount === 1 ? '' : 's'} · {stats?.albumCount ?? 0} album{stats?.albumCount === 1 ? '' : 's'} ·{' '}
          {stats?.bookCount ?? 0} book{stats?.bookCount === 1 ? '' : 's'}
        </Text>
        <Text variant="caption" muted>
          {isCloudSyncConfigured ? 'Cloud backup available.' : 'Stored only on this device. Cloud backup is coming soon.'}
        </Text>
      </Card>

      <SectionHeader eyebrow="Planning ahead" title="Legacy" />
      <Card onPress={() => router.push('/legacy')} accessibilityLabel="Learn about The Keep">
        <Text variant="heading" style={{ color: c.legacy }}>
          The Keep
        </Text>
        <Text muted>A separate service for estate planning, will custody, and passing on your family vault.</Text>
      </Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
        <Text style={{ flex: 1 }}>Show occasional suggestions about The Keep</Text>
        <Switch
          value={!keep.optedOut}
          trackColor={{ true: c.legacy }}
          onValueChange={(on) => keep.setOptOut(!on)}
          accessibilityLabel="Show occasional suggestions about The Keep"
        />
      </View>

      <SectionHeader eyebrow="Privacy" title="Your data" />
      <Text muted>
        Photos never leave your device unless you export or back them up. We don't sell data or track you
        across other apps.
      </Text>
      <Button
        label="Delete all my data"
        tone="secondary"
        loading={erase.pending}
        onPress={() =>
          confirm('Delete everything?', 'This permanently removes every memory, album, and book from this device.', () =>
            erase.run(),
          )
        }
      />
    </Screen>
  );
}
