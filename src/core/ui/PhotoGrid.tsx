import { StyleSheet, View } from 'react-native';
import { space } from '@/core/theme';
import { Photo } from './Photo';

export function PhotoGrid({ uris, columns = 3 }: { uris: string[]; columns?: number }) {
  return (
    <View style={styles.grid}>
      {uris.map((uri) => (
        <View key={uri} style={{ width: `${100 / columns}%`, padding: space.xs / 2 }}>
          <Photo uri={uri} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -space.xs / 2 } });
