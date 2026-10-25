import { router } from 'expo-router';
import { View } from 'react-native';
import { space, useColors } from '@/core/theme';
import { Button, Card, Screen, Text } from '@/core/ui';
import { useKeepReferral } from '@/features/keep-referral';

/**
 * Interstitial before leaving the app. Explains what The Keep is, that it is a separate
 * service, and what is (not) shared, so the user makes an informed, unpressured choice.
 */
export default function LegacyScreen() {
  const c = useColors();
  const { open } = useKeepReferral('settings_row');
  const points = [
    ['Will custody', 'Store your will and key documents securely, with named people who can access them when needed.'],
    ['Legacy wishes', 'Decide who inherits your family vault and what they should know.'],
    ['Estate planning', 'Guided planning with qualified professionals where you live.'],
  ];
  return (
    <Screen>
      <Text variant="label" style={{ color: c.legacy }}>A SEPARATE SERVICE FROM THE MAKERS OF KEEP FOREVER</Text>
      <Text variant="display">Make sure your memories reach the right hands</Text>
      <Text muted>
        The Keep helps families plan for the future: what happens to their memories, wishes, and important documents.
      </Text>
      <View style={{ gap: space.md }}>
        {points.map(([h, b]) => (
          <Card key={h}>
            <Text variant="heading">{h}</Text>
            <Text muted>{b}</Text>
          </Card>
        ))}
      </View>
      <Card style={{ backgroundColor: c.legacySoft, borderColor: c.legacy }}>
        <Text variant="heading">What we share</Text>
        <Text muted>
          Nothing from your vault. Opening The Keep only tells it you came from Keep Forever. Your photos and stories stay
          here unless you choose to move them. Keep Forever works fully without The Keep.
        </Text>
      </Card>
      <Button label="Visit The Keep" tone="legacy" onPress={() => open('site')} />
      <Button label="I already have a Keep account" tone="secondary" onPress={() => open('account')} />
      <Button label="Not now" tone="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
