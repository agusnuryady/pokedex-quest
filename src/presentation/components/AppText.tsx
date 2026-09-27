import { StyleSheet, Text, type TextProps } from 'react-native';
import { fonts, palette, typeScale } from '@/shared/theme';

export type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'number';

interface Props extends TextProps {
  variant?: TextVariant;
  color?: string;
}

/** Every piece of text goes through here, so the type scale lives in one place. */
export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  return <Text {...rest} style={[styles[variant], color ? { color } : null, style]} />;
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: typeScale.display, lineHeight: 40, color: palette.ink },
  title: { fontFamily: fonts.display, fontSize: typeScale.title, lineHeight: 28, color: palette.ink },
  subtitle: { fontFamily: fonts.displayMedium, fontSize: typeScale.subtitle, lineHeight: 22, color: palette.ink },
  body: { fontSize: typeScale.body, lineHeight: 22, color: palette.ink },
  caption: { fontSize: typeScale.caption, lineHeight: 16, color: palette.inkSoft },
  number: { fontFamily: fonts.displayMedium, fontSize: typeScale.caption, color: palette.inkSoft, fontVariant: ['tabular-nums'] },
});
