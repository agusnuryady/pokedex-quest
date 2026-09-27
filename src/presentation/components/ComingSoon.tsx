import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typeScale } from '@/shared/theme';

/** Temporary placeholder for screens built in the next phase. */
export function ComingSoon({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: palette.paper },
  title: { fontSize: typeScale.title, fontWeight: '700', color: palette.ink, marginBottom: spacing.sm },
  detail: { fontSize: typeScale.body, lineHeight: 22, color: palette.inkSoft },
});
