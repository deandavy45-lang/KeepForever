import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { hitTarget, radius, space, useColors } from '@/core/theme';
import { Button, Text } from '@/core/ui';
import type { ReferralSurface } from './config';
import { useKeepReferral } from './useKeepReferral';

/**
 * The one proactive touchpoint for The Keep. Visually distinct (green "legacy" tone),
 * labelled as a separate service, always dismissible, never blocks a task, and only
 * appears once eligibility rules in config.ts are met.
 */
export function KeepCard({ surface }: { surface: Exclude<ReferralSurface, 'settings_row'> }) {
  const c = useColors();
  const { visible, logImpression, dismiss } = useKeepReferral(surface);
  useEffect(() => {
    if (visible) logImpression();
  }, [visible, logImpression]);
  if (!visible) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.legacySoft, borderColor: c.legacy }]}>
      <View style={styles.row}>
        <Text variant="label" style={{ color: c.legacy }}>
          FROM OUR PARTNER SERVICE, THE KEEP
        </Text>
        <Pressable
          onPress={() => dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={12}
          style={styles.close}
        >
          <Text style={{ color: c.legacy }}>✕</Text>
        </Pressable>
      </View>
      <Text variant="heading">You've built something worth protecting</Text>
      <Text muted>
        The Keep helps families plan what happens to their memories, wishes, and important
        documents in the future. It's optional and separate from For Keeps.
      </Text>
      <Button label="Learn about The Keep" tone="legacy" onPress={() => router.push('/legacy')} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { minWidth: hitTarget / 1.5, alignItems: 'flex-end' },
});
