import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
}

const COLORS: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: palette.moss, text: palette.white, border: palette.moss },
  secondary: { bg: palette.white, text: palette.ink, border: palette.fog },
  danger: { bg: palette.white, text: palette.berry, border: palette.berry },
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const c = COLORS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: c.bg, borderColor: c.border },
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? <ActivityIndicator color={c.text} /> : <AppText variant="subtitle" color={c.text}>{label}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.5 },
});
