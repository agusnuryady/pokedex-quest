import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, spacing } from '@/shared/theme';
import { AppText } from './AppText';

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

/** Page frame: safe area, a readable max width on web and tablets, and an optional big title. */
export function Screen({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.column}>
        {title ? (
          <View style={styles.header}>
            <AppText variant="display" accessibilityRole="header">{title}</AppText>
            {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
          </View>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

export const CONTENT_MAX_WIDTH = 960;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  column: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
});
