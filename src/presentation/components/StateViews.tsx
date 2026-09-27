import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { palette, spacing } from '@/shared/theme';
import { AppText } from './AppText';
import { Button } from './Button';

/** Shared loading, error and empty screens so every list handles these the same way. */
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={palette.moss} size="large" />
      <AppText variant="caption" style={styles.gap}>{label}</AppText>
    </View>
  );
}

interface MessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function MessageState({ title, message, actionLabel, onAction }: MessageProps) {
  return (
    <View style={styles.center}>
      <AppText variant="title" style={styles.text}>{title}</AppText>
      <AppText variant="body" color={palette.inkSoft} style={[styles.text, styles.gap]}>{message}</AppText>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <MessageState title="Couldn't load Pokémon" message={message} actionLabel="Try again" onAction={onRetry} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  text: { textAlign: 'center', maxWidth: 360 },
  gap: { marginTop: spacing.sm },
  action: { marginTop: spacing.xl },
});
