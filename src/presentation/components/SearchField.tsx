import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { palette, radius, spacing, typeScale } from '@/shared/theme';
import { AppText } from './AppText';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChangeText, placeholder = 'Search by name or number' }: Props) {
  return (
    <View style={styles.field}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.inkSoft}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search Pokémon"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12}>
          <AppText variant="caption" style={styles.clear}>Clear</AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.fog,
  },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: typeScale.body, color: palette.ink },
  clear: { color: palette.moss, fontWeight: '600' },
});
