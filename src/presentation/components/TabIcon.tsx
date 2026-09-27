import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type TabKey = 'play' | 'collection' | 'glossary';

/** Filled when the tab is active, outline when not. */
export const TAB_ICONS: Record<TabKey, { active: IconName; inactive: IconName }> = {
  play: { active: 'footsteps', inactive: 'footsteps-outline' },
  collection: { active: 'albums', inactive: 'albums-outline' },
  glossary: { active: 'book', inactive: 'book-outline' },
};

interface Props {
  tab: TabKey;
  focused: boolean;
  color: ColorValue;
  size: number;
}

export function TabIcon({ tab, focused, color, size }: Props) {
  const name = focused ? TAB_ICONS[tab].active : TAB_ICONS[tab].inactive;
  return <Ionicons name={name} size={size} color={color} testID={`tab-icon-${tab}-${focused ? 'active' : 'inactive'}`} />;
}
